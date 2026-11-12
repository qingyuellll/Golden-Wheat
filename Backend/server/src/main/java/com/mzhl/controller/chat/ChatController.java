package com.mzhl.controller.chat;

import com.mzhl.context.BaseContext;
import com.mzhl.exception.BaseException;
import com.mzhl.result.Result;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * AI 对话接口
 * <p>
 * 对外只暴露一个接口：GET /api/chat/stream
 * 前端用 EventSource 连接，后端把大模型的回答一个字一个字地"推"过去
 * 也就是常见的"打字机效果"
 */
@Slf4j
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    // ChatClient 是 Spring AI 提供的"大模型客户端"
    // 所有跟大模型的交互都通过它来完成
    private final ChatClient chatClient;

    private final RedisTemplate redisTemplate;

    /** 单条消息输入长度上限（字符） */
    private static final int MAX_INPUT_LENGTH = 300;

    /** 单次回复 token 上限 */
    private static final Integer MAX_OUTPUT_TOKENS = 500;

    /** 每用户每分钟最大消息数 */
    private static final long RATE_LIMIT_PER_MINUTE = 10;

    private static final String RATE_LIMIT_KEY_PREFIX = "chat:rate:";

    // 默认提示词 prompt
    private static final String BASE_SYSTEM = """
            【你能做的】
            - 解答系统功能使用问题
            - 引导用户完成常见操作（如：如何下单购买、查看订单、申请退款等）
            - 解释页面上各字段、按钮的含义
            - 遇到系统故障或账号问题，引导用户联系人工客服：400-123-4567
            
            【你不能做的】
            - 不回答与本系统无关的问题，礼貌拒绝即可
            - 不能承诺系统未来会有某某功能
            - 不能替用户执行任何操作（只能指导）
            
            【回答风格】
            - 简洁友好，口语化，不超过200字
            - 操作步骤用数字列出，清晰易懂
            - 遇到不确定的问题，诚实说不知道，并提供人工客服联系方式
            """;

    // 零宽字符常量 (避免在注释中直接写 unicode 转义导致编译错误)
    private static final char ZWSP = '\u200B';  // 零宽空格
    private static final char ZWNJ = '\u200C';  // 零宽非连字符
    private static final char ZWJ  = '\u200D';  // 零宽连字符
    private static final char BOM  = '\uFEFF';  // BOM

    /**
     * 构造方法：初始化 ChatClient
     * <p>
     * Spring Boot 启动时会自动把 ChatClient.Builder 注入进来
     * Builder 会读取 application.yml 里配置的 api-key、model 等参数
     */
    public ChatController(ChatClient.Builder builder, RedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;

        // ---- 第一步：配置对话记忆 ----
        // 大模型本身是"无状态"的，每次请求它都不知道之前说过什么
        // 所以需要我们自己把历史对话存起来，每次请求时一起带过去
        // InMemoryChatMemoryRepository = 把历史记录存在内存里（重启后清空）
        // MessageWindowChatMemory = 滑动窗口，只保留最近 N 条，避免超出 token 限制
        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(new InMemoryChatMemoryRepository())
                .maxMessages(20)   // 最多记住最近 20 条对话（10问10答）
                .build();

        // ---- 第二步：构建 ChatClient ----
        // MessageChatMemoryAdvisor 是一个"拦截器"
        // 它会在每次发请求前，自动把历史记录塞进去
        // 在收到回复后，自动把这轮对话存进记忆里
        // 你不需要手动管理消息列表，它全帮你做了
        this.chatClient = builder
                .defaultSystem(BASE_SYSTEM)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    /**
     * 流式对话接口（打字机效果）
     * <p>
     * 请求示例：GET /api/chat/stream?message=你好
     * <p>
     * 会话记忆按 userId 隔离（sessionId 由服务端生成），
     * 前端传入的任何会话标识都不会被采信，防止读到别人的对话上下文
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam String message) {
        Long userId = currentUserId();
        checkRateLimit(userId);
        String text = validateMessage(message);
        String sessionId = sessionIdOf(userId);

        SseEmitter emitter = new SseEmitter(180_000L);
        AtomicInteger retryCount = new AtomicInteger(0);
        int maxRetries = 2;

        doStreamWithRetry(emitter, text, sessionId, retryCount, maxRetries);

        return emitter;
    }

    /**
     * 一问一答接口（非流式）
     * <p>
     * 请求示例：POST /api/chat/send  body: {"message": "怎么下单？"}
     * 返回 Result&lt;String&gt;，data 为完整的回答文本
     */
    @PostMapping("/send")
    public Result<String> send(@RequestBody Map<String, String> body) {
        Long userId = currentUserId();
        checkRateLimit(userId);
        String message = validateMessage(body == null ? null : body.get("message"));
        String sessionId = sessionIdOf(userId);

        String answer = chatClient.prompt()
                .user(message)
                .options(OpenAiChatOptions.builder().maxTokens(MAX_OUTPUT_TOKENS).build())
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, sessionId))
                .call()
                .content();

        return Result.success(answer);
    }

    /** 当前登录用户 id（由 JWT 拦截器写入 ThreadLocal） */
    private Long currentUserId() {
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            throw new BaseException("未登录或登录已过期");
        }
        return userId;
    }

    /** 服务端生成的会话 id：按用户隔离对话记忆 */
    private String sessionIdOf(Long userId) {
        return "chat:" + userId;
    }

    /** 输入长度上限，防止超长 prompt 白嫖 token */
    private String validateMessage(String message) {
        if (message == null || message.trim().isEmpty()) {
            throw new BaseException("消息不能为空");
        }
        if (message.length() > MAX_INPUT_LENGTH) {
            throw new BaseException("消息太长了，请控制在" + MAX_INPUT_LENGTH + "字以内");
        }
        return message.trim();
    }

    /** 按用户的固定窗口限流：Redis INCR + EXPIRE，每分钟最多 RATE_LIMIT_PER_MINUTE 条 */
    private void checkRateLimit(Long userId) {
        String key = RATE_LIMIT_KEY_PREFIX + userId;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, 60, TimeUnit.SECONDS);
        }
        if (count != null && count > RATE_LIMIT_PER_MINUTE) {
            throw new BaseException("发送太频繁了，请稍后再试");
        }
    }

    private void doStreamWithRetry(SseEmitter emitter, String message, String sessionId,
                                    AtomicInteger retryCount, int maxRetries) {
        chatClient.prompt()
                .user(message)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, sessionId))
                .stream()
                .content()
                .subscribe(
                        token -> {
                            try {
                                String cleaned = sanitizeToken(token);
                                if (!cleaned.isEmpty()) {
                                    emitter.send(cleaned);
                                }
                            } catch (Exception e) {
                                emitter.completeWithError(e);
                            }
                        },
                        error -> {
                            int attempt = retryCount.incrementAndGet();
                            log.warn("AI请求失败(第{}次)，sessionId={}，错误: {}",
                                    attempt, sessionId, error.getMessage());
                            if (attempt <= maxRetries && isRetryable(error)) {
                                log.info("将在1秒后重试，sessionId={}", sessionId);
                                try { Thread.sleep(1000); } catch (InterruptedException ignored) {}
                                doStreamWithRetry(emitter, message, sessionId, retryCount, maxRetries);
                            } else {
                                try {
                                    String userMsg = isAuthError(error)
                                        ? "[AI服务暂时不可用，请联系人工客服：400-123-4567]"
                                        : "[网络异常，请稍后重试]";
                                    emitter.send(userMsg);
                                } catch (Exception e) {
                                    log.error("发送错误消息失败", e);
                                }
                                emitter.complete();
                            }
                        },
                        emitter::complete
                );
    }

    private boolean isRetryable(Throwable error) {
        if (error == null) return false;
        String msg = error.getMessage();
        if (msg == null) return true;
        // 认证/付费类错误不重试
        if (msg.contains("402") || msg.contains("401")
            || msg.contains("Payment Required") || msg.contains("Unauthorized")) {
            return false;
        }
        // 连接重置、超时等可重试
        return msg.contains("Connection reset")
            || msg.contains("timed out")
            || msg.contains("Connection refused");
    }

    private boolean isAuthError(Throwable error) {
        if (error == null) return false;
        Throwable current = error;
        while (current != null) {
            String msg = current.getMessage();
            if (msg != null && (msg.contains("402") || msg.contains("401")
                || msg.contains("Payment Required") || msg.contains("Unauthorized"))) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    /**
     * 清洗大模型返回的 token 文本
     * <p>
     * 解决三个显示异常问题：<br>
     * 1. Jackson JSON 序列化给 String 包裹的 ASCII 双引号<br>
     * 2. 非 BMP 字符（如 Emoji）被转义为 unicode 转义序列<br>
     * 3. CJK 字符之间的多余空格 / 零宽字符
     */
    private String sanitizeToken(String token) {
        if (token == null || token.isEmpty()) return token;

        String cleaned = token;

        // 1. 去除 JSON 序列化包裹的 ASCII 引号
        if (cleaned.length() >= 2
                && cleaned.charAt(0) == '"'
                && cleaned.charAt(cleaned.length() - 1) == '"') {
            cleaned = cleaned.substring(1, cleaned.length() - 1);
        }

        // 2. 解码 unicode 转义序列 (如 surrogate pair -> emoji)
        cleaned = decodeUnicodeEscapes(cleaned);

        // 3. 去除零宽字符
        cleaned = cleaned.replace(String.valueOf(ZWSP), "")
                         .replace(String.valueOf(ZWNJ), "")
                         .replace(String.valueOf(ZWJ), "")
                         .replace(String.valueOf(BOM), "");

        // 4. 去除 CJK 字符之间的多余空格
        cleaned = removeSpacesBetweenCJK(cleaned);

        return cleaned;
    }

    /**
     * 解码字符串中的 unicode 转义序列 (反斜杠 + u + 4位十六进制) 为真实字符
     * 例如输入 "\\u4F60\\u597D" 会输出 "你好"
     */
    private String decodeUnicodeEscapes(String input) {
        if (input == null || input.isEmpty()) return input;
        StringBuilder sb = new StringBuilder();
        int i = 0;
        int len = input.length();
        while (i < len) {
            char c = input.charAt(i);
            if (c == '\\' && i + 5 < len && input.charAt(i + 1) == 'u') {
                String hex = input.substring(i + 2, i + 6);
                try {
                    int code = Integer.parseInt(hex, 16);
                    sb.append((char) code);
                    i += 6;
                    continue;
                } catch (NumberFormatException e) {
                    // 不是有效的 unicode 转义，保留原样
                }
            }
            sb.append(c);
            i++;
        }
        return sb.toString();
    }

    /**
     * 移除 CJK（中日韩）字符之间的所有空白字符
     * <p>
     * 中文、日文、韩文等 CJK 语言中，字符之间不应该有空格，
     * 这些空格通常来自 LLM tokenizer 的分词边界残留
     */
    private String removeSpacesBetweenCJK(String input) {
        if (input == null || input.isEmpty()) return input;
        StringBuilder sb = new StringBuilder();
        int len = input.length();
        for (int i = 0; i < len; i++) {
            char c = input.charAt(i);
            if (c == ' ' || c == '\u3000' || c == '\u00A0' || c == '\t') {
                boolean prevCJK = i > 0 && isCJKChar(input.charAt(i - 1));
                boolean nextCJK = i + 1 < len && isCJKChar(input.charAt(i + 1));
                if (prevCJK && nextCJK) {
                    continue; // 跳过 CJK 字符之间的空格
                }
            }
            sb.append(c);
        }
        return sb.toString();
    }

    /**
     * 判断字符是否属于 CJK 统一表意文字
     */
    private boolean isCJKChar(char c) {
        Character.UnicodeBlock block = Character.UnicodeBlock.of(c);
        return block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS
            || block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A
            || block == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B
            || block == Character.UnicodeBlock.CJK_COMPATIBILITY_IDEOGRAPHS
            || block == Character.UnicodeBlock.CJK_SYMBOLS_AND_PUNCTUATION;
    }
}