package com.mzhl.interceptor;

import com.mzhl.constant.JwtClaimsConstant;
import com.mzhl.context.BaseContext;
import com.mzhl.properties.JwtProperties;
import com.mzhl.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 公开接口的可选身份解析拦截器。
 * <p>
 * 优惠券列表这类接口既允许游客浏览，又要在已登录时返回"是否已领取"。
 * 若直接放进 JwtTokenUserInterceptor 的白名单，BaseContext 永远是空，
 * 用户永远看到"可领取"；若不放进白名单，游客连列表都打不开。
 * <p>
 * 因此这里单独注册一个只解析、不拦截的拦截器：带合法令牌就写入当前用户，
 * 令牌缺失或非法一律放行，由业务代码决定游客分支。
 */
@Component
@Slf4j
public class OptionalJwtUserInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtProperties jwtProperties;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        String token = request.getHeader(jwtProperties.getUserTokenName());
        if (token == null || token.isBlank()) {
            return true;
        }

        try {
            Claims claims = JwtUtil.parseJWT(jwtProperties.getUserSecretKey(), token);
            if (!JwtClaimsConstant.TOKEN_TYPE_ACCESS.equals(claims.get(JwtClaimsConstant.TOKEN_TYPE))) {
                return true;
            }
            Object userId = claims.get(JwtClaimsConstant.USER_ID);
            if (userId != null) {
                BaseContext.setCurrentId(Long.valueOf(userId.toString()));
            }
        } catch (Exception ex) {
            log.debug("公开接口携带的令牌无效，按游客处理");
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        BaseContext.removeCurrentId();
    }
}
