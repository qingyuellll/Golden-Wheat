package com.mzhl.service.impl;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.mzhl.constant.MessageConstant;
import com.mzhl.dto.UserLoginDTO;
import com.mzhl.dto.WebLoginDTO;
import com.mzhl.entity.User;
import com.mzhl.exception.LoginFailedException;
import com.mzhl.mapper.UserMapper;
import com.mzhl.properties.WeChatProperties;
import com.mzhl.service.UserService;
import com.mzhl.utils.HttpClientUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    public static final String WX_LOGIN = "https://api.weixin.qq.com/sns/jscode2session";
    public static final String GRANT_TYPE = "authorization_code";
    public static final String LOGIN_CODE_PREFIX = "LOGIN_CODE:";
    public static final long CODE_TTL_MINUTES = 5;

    /** 验证码防爆破：错误次数计数前缀、上限、锁定时长 */
    public static final String LOGIN_FAIL_PREFIX = "LOGIN_FAIL:";
    public static final long MAX_LOGIN_FAIL_TIMES = 5;
    public static final long LOGIN_LOCK_MINUTES = 10;

    @Autowired
    private WeChatProperties weChatProperties;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public User wxLogin(UserLoginDTO userLoginDTO) {
        String openid = getOpenid(userLoginDTO.getCode());

        if (openid == null) {
            throw new LoginFailedException(MessageConstant.LOGIN_FAILED);
        }

        User user = userMapper.getByOpenid(openid);

        if (user == null) {
            user = User.builder()
                    .openid(openid)
                    .createTime(LocalDateTime.now())
                    .build();
            userMapper.insert(user);
        }

        return user;
    }

    @Override
    public String sendCode(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            throw new LoginFailedException("手机号不能为空");
        }

        String code = String.valueOf(new Random().nextInt(900000) + 100000);

        String key = LOGIN_CODE_PREFIX + phone;
        redisTemplate.opsForValue().set(key, code, CODE_TTL_MINUTES, TimeUnit.MINUTES);

        //验证码只写日志（生产环境应换成真实短信通道），绝不返回给调用方
        log.info("手机号 {} 的验证码为: {}，有效期 {} 分钟", phone, code, CODE_TTL_MINUTES);

        return "验证码已发送";
    }

    @Override
    public User webLogin(WebLoginDTO webLoginDTO) {
        String phone = webLoginDTO.getPhone();
        String code = webLoginDTO.getCode();

        if (phone == null || phone.trim().isEmpty()) {
            throw new LoginFailedException("手机号不能为空");
        }
        if (code == null || code.trim().isEmpty()) {
            throw new LoginFailedException("验证码不能为空");
        }

        //防爆破：10 分钟窗口内错满 5 次锁定，锁定期间即使验证码正确也拒绝
        String failKey = LOGIN_FAIL_PREFIX + phone;
        Object failCount = redisTemplate.opsForValue().get(failKey);
        if (failCount != null && Long.parseLong(failCount.toString()) >= MAX_LOGIN_FAIL_TIMES) {
            throw new LoginFailedException("错误次数过多，请" + LOGIN_LOCK_MINUTES + "分钟后重试");
        }

        String key = LOGIN_CODE_PREFIX + phone;
        Object storedCode = redisTemplate.opsForValue().get(key);

        if (storedCode == null) {
            throw new LoginFailedException("验证码已过期，请重新获取");
        }
        if (!code.equals(storedCode.toString())) {
            Long fails = redisTemplate.opsForValue().increment(failKey);
            if (fails != null && fails == 1) {
                redisTemplate.expire(failKey, LOGIN_LOCK_MINUTES, TimeUnit.MINUTES);
            }
            throw new LoginFailedException("验证码错误");
        }

        redisTemplate.delete(key);
        redisTemplate.delete(failKey);

        User user = userMapper.getByPhone(phone);

        if (user == null) {
            user = User.builder()
                    .phone(phone)
                    .name("用户" + phone.substring(phone.length() - 4))
                    .createTime(LocalDateTime.now())
                    .build();
            userMapper.insert(user);
        }

        return user;
    }

    private String getOpenid(String code) {
        Map<String, String> map = new HashMap<>();
        map.put("appid", weChatProperties.getAppid());
        map.put("secret", weChatProperties.getSecret());
        map.put("js_code", code);
        map.put("grant_type", GRANT_TYPE);

        String json = HttpClientUtil.doGet(WX_LOGIN, map);
        log.info("微信 code2session 返回原始 JSON: {}", json);

        if (json == null || json.isEmpty()) {
            log.error("微信 code2session 返回结果为空，可能是网络请求超时或失败");
            throw new LoginFailedException(MessageConstant.LOGIN_FAILED);
        }

        JSONObject jsonObject = JSON.parseObject(json);

        Integer errcode = jsonObject.getInteger("errcode");
        if (errcode != null && errcode != 0) {
            String errmsg = jsonObject.getString("errmsg");
            log.error("微信 code2session 返回错误: errcode={}, errmsg={}", errcode, errmsg);
            throw new LoginFailedException(MessageConstant.LOGIN_FAILED);
        }

        String openid = jsonObject.getString("openid");
        if (openid == null) {
            log.error("微信 code2session 返回 JSON 中 openid 为空: {}", json);
            throw new LoginFailedException(MessageConstant.LOGIN_FAILED);
        }
        log.info("成功获取 openid: {}", openid);
        return openid;
    }
}
