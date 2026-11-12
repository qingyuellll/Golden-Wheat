package com.mzhl.controller.user;

import com.mzhl.constant.JwtClaimsConstant;
import com.mzhl.dto.SendCodeDTO;
import com.mzhl.dto.UserLoginDTO;
import com.mzhl.dto.WebLoginDTO;
import com.mzhl.entity.User;
import com.mzhl.properties.JwtProperties;
import com.mzhl.result.Result;
import com.mzhl.service.UserService;
import com.mzhl.utils.JwtUtil;
import com.mzhl.vo.UserLoginVO;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user/user")
@Tag(name = "C端用户相关")
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtProperties jwtProperties;

    @PostMapping("/login")
    @Operation(summary = "微信用户登录")
    public Result<UserLoginVO> login(@RequestBody UserLoginDTO userLoginDTO) {
        log.info("微信用户登录：{}", userLoginDTO.getCode());

        User user = userService.wxLogin(userLoginDTO);

        UserLoginVO userLoginVO = buildLoginVO(user);

        return Result.success(userLoginVO);
    }

    @PostMapping("/sendCode")
    @Operation(summary = "发送验证码")
    public Result<String> sendCode(@RequestBody SendCodeDTO sendCodeDTO) {
        log.info("发送验证码，手机号：{}", sendCodeDTO.getPhone());

        //验证码只落 Redis + 日志，绝不回传给前端
        userService.sendCode(sendCodeDTO.getPhone());

        return Result.success("验证码已发送");
    }

    @PostMapping("/webLogin")
    @Operation(summary = "网页版用户登录")
    public Result<UserLoginVO> webLogin(@RequestBody WebLoginDTO webLoginDTO) {
        log.info("网页用户登录，手机号：{}", webLoginDTO.getPhone());

        User user = userService.webLogin(webLoginDTO);

        UserLoginVO userLoginVO = buildLoginVO(user);

        return Result.success(userLoginVO);
    }

    @PostMapping("/refresh")
    @Operation(summary = "刷新令牌")
    public Result<UserLoginVO> refresh(jakarta.servlet.http.HttpServletRequest request) {
        //刷新令牌由前端放在 authentication 头中传来
        String refreshToken = request.getHeader(jwtProperties.getUserTokenName());
        if (refreshToken == null || refreshToken.isBlank()) {
            return Result.error("刷新令牌缺失");
        }

        Long userId;
        try {
            var claims = JwtUtil.parseJWT(jwtProperties.getUserSecretKey(), refreshToken);
            //必须是 refresh 类型令牌
            if (!JwtClaimsConstant.TOKEN_TYPE_REFRESH.equals(claims.get(JwtClaimsConstant.TOKEN_TYPE))) {
                return Result.error("无效的刷新令牌");
            }
            userId = Long.valueOf(claims.get(JwtClaimsConstant.USER_ID).toString());
        } catch (Exception ex) {
            return Result.error("刷新令牌已过期，请重新登录");
        }

        UserLoginVO userLoginVO = buildLoginVO(User.builder().id(userId).build());

        return Result.success(userLoginVO);
    }

    /**
     * 为用户签发一对令牌：短 TTL 的 access + 长 TTL 的 refresh
     */
    private UserLoginVO buildLoginVO(User user) {
        Map<String, Object> accessClaims = new HashMap<>();
        accessClaims.put(JwtClaimsConstant.USER_ID, user.getId());
        accessClaims.put(JwtClaimsConstant.TOKEN_TYPE, JwtClaimsConstant.TOKEN_TYPE_ACCESS);
        String token = JwtUtil.createJWT(jwtProperties.getUserSecretKey(), jwtProperties.getUserTtl(), accessClaims);

        Map<String, Object> refreshClaims = new HashMap<>();
        refreshClaims.put(JwtClaimsConstant.USER_ID, user.getId());
        refreshClaims.put(JwtClaimsConstant.TOKEN_TYPE, JwtClaimsConstant.TOKEN_TYPE_REFRESH);
        String refreshToken = JwtUtil.createJWT(jwtProperties.getUserSecretKey(), jwtProperties.getUserRefreshTtl(), refreshClaims);

        return UserLoginVO.builder()
                .id(user.getId())
                .openid(user.getOpenid())
                .token(token)
                .refreshToken(refreshToken)
                .build();
    }
}
