package com.mzhl.utils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

/**
 * 兑换码生成工具类
 * 核心技术：Base32编码 + 混淆算法
 *
 * 设计原理：
 * 1. 使用Base32编码（0-9 + 去除容易混淆字母的大写字母表）
 * 2. 将时间戳、优惠券ID、随机数混合生成唯一兑换码
 * 3. 添加混淆位防止规律性猜测
 *
 * 兑换码结构（8位）：
 * [2位类型前缀][4位编码数据][1位校验位][1位混淆位]
 * 例如：CP A1B2 C3 D4 = CPA1B2C3D4
 */
public class CodeUtil {

    /**
     * Base32字符表（32个字符）
     * 去除了易混淆字符：0/O、1/I/L 用其他字符替代
     */
    private static final char[] BASE32_ALPHABET = {
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'J', 'K', 'M', 'N', 'P', 'Q', 'R', 'S',
        'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '2', '3', '4', '5', '6', '7', '8', '9'
    };

    /**
     * 混淆偏移表（用于打乱编码结果）
     * 每位的偏移量不同，增加破解难度
     */
    private static final int[] OBSCURE_OFFSET = {3, 7, 11, 13, 17, 19, 23, 29};

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * 生成兑换码
     *
     * @param couponId 优惠券ID（用于关联）
     * @param batchNo 批次号（同一批次生成一批兑换码）
     * @return 生成的兑换码，格式如 "CPA1B2C3D4"
     *
     * 生成算法：
     * 1. 取时间戳后几位
     * 2. 与优惠券ID、随机数组合
     * 3. Base32编码
     * 4. 混淆处理
     */
    public static String generateCode(Long couponId, Long batchNo) {
        StringBuilder raw = new StringBuilder();

        // 1. 时间戳后4位（秒级，变化周期大）
        long timestamp = LocalDateTime.now().toEpochSecond(ZoneOffset.UTC);
        String tsStr = String.format("%04d", timestamp % 10000);

        // 2. 优惠券ID后3位
        String cidStr = String.format("%03d", couponId % 1000);

        // 3. 批次号后2位
        String batchStr = String.format("%02d", batchNo % 100);

        // 4. 随机数2位
        String randomStr = String.format("%02d", RANDOM.nextInt(100));

        // 5. 组合并编码
        raw.append(tsStr).append(cidStr).append(batchStr).append(randomStr);

        return obscure(encode(raw.toString()));
    }

    /**
     * 将数字字符串编码为Base32
     *
     * @param input 纯数字字符串
     * @return Base32编码后的字符串
     */
    private static String encode(String input) {
        StringBuilder result = new StringBuilder();
        long value = Long.parseLong(input);

        // 转换为32进制
        while (value > 0) {
            int index = (int) (value % 32);
            result.insert(0, BASE32_ALPHABET[index]);
            value /= 32;
        }

        // 补齐到8位（不足前面补字符）
        while (result.length() < 8) {
            result.insert(0, BASE32_ALPHABET[0]);
        }

        // 如果超过8位，截取后8位
        if (result.length() > 8) {
            result = new StringBuilder(result.substring(result.length() - 8));
        }

        return result.toString();
    }

    /**
     * 混淆处理
     * 将编码后的字符按照偏移表进行位移混淆
     *
     * @param encoded Base32编码后的字符串
     * @return 混淆后的字符串
     */
    private static String obscure(String encoded) {
        char[] chars = encoded.toCharArray();

        for (int i = 0; i < chars.length; i++) {
            int originalPos = findPosition(chars[i]);
            if (originalPos >= 0) {
                // 应用混淆偏移
                int newPos = (originalPos + OBSCURE_OFFSET[i]) % BASE32_ALPHABET.length;
                chars[i] = BASE32_ALPHABET[newPos];
            }
        }

        return new String(chars);
    }

    /**
     * 反混淆（解码用）
     *
     * @param obscured 混淆后的字符串
     * @return 原始编码字符串
     */
    public static String deobscure(String obscured) {
        char[] chars = obscured.toCharArray();

        for (int i = 0; i < chars.length; i++) {
            int currentPos = findPosition(chars[i]);
            if (currentPos >= 0) {
                // 反向偏移
                int originalPos = (currentPos - OBSCURE_OFFSET[i] + BASE32_ALPHABET.length) % BASE32_ALPHABET.length;
                chars[i] = BASE32_ALPHABET[originalPos];
            }
        }

        return new String(chars);
    }

    /**
     * 查找字符在Base32表中的位置
     */
    private static int findPosition(char c) {
        for (int i = 0; i < BASE32_ALPHABET.length; i++) {
            if (BASE32_ALPHABET[i] == c) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 解码兑换码
     * 反向操作：反混淆 → Base32解码 → 提取优惠券ID和批次号
     *
     * @param code 混淆后的兑换码
     * @return Map，包含 couponId 和 batch 两个字段；解析失败返回null
     */
    public static Map<String, String> decode(String code) {
        if (code == null || code.length() != 8) {
            return null;
        }

        try {
            // 1. 反混淆
            String deobscured = deobscure(code);

            // 2. Base32解码为数字
            long value = 0;
            for (int i = 0; i < deobscured.length(); i++) {
                int pos = findPosition(deobscured.charAt(i));
                if (pos < 0) {
                    return null;
                }
                value = value * 32 + pos;
            }

            // 3. 格式化为数字字符串（补齐前导0）
            String numStr = String.format("%011d", value);
            // 数字结构：timestamp4 + couponId3 + batchNo2 + random2 = 11位

            if (numStr.length() < 11) {
                return null;
            }

            // 4. 提取各部分
            String tsStr = numStr.substring(numStr.length() - 11, numStr.length() - 7);  // 时间戳4位
            String cidStr = numStr.substring(numStr.length() - 7, numStr.length() - 4);  // 优惠券ID后3位
            String batchStr = numStr.substring(numStr.length() - 4, numStr.length() - 2); // 批次号后2位

            Map<String, String> result = new HashMap<>();
            result.put("couponId", String.valueOf(Long.parseLong(cidStr)));
            result.put("batch", String.valueOf(Long.parseLong(batchStr)));

            return result;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 校验兑换码格式是否合法
     *
     * @param code 兑换码
     * @return true-合法 false-不合法
     */
    public static boolean validateFormat(String code) {
        if (code == null || code.length() != 8) {
            return false;
        }

        // 检查所有字符是否都在Base32表内
        for (char c : code.toCharArray()) {
            if (findPosition(c) < 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * 批量生成兑换码
     *
     * @param couponId 优惠券ID
     * @param batchNo 批次号
     * @param count 生成数量
     * @return 兑换码数组
     */
    public static String[] batchGenerate(Long couponId, Long batchNo, int count) {
        String[] codes = new String[count];
        for (int i = 0; i < count; i++) {
            codes[i] = generateCode(couponId, batchNo);
        }
        return codes;
    }
}