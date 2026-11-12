package com.mzhl.config;

import com.mzhl.interceptor.JwtTokenAdminInterceptor;
import com.mzhl.interceptor.JwtTokenUserInterceptor;
import com.mzhl.interceptor.OptionalJwtUserInterceptor;
import com.mzhl.json.JacksonObjectMapper;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import java.util.List;

@Configuration
@Slf4j
public class WebMvcConfiguration extends WebMvcConfigurationSupport {

    @Autowired
    private JwtTokenAdminInterceptor jwtTokenAdminInterceptor;
    @Autowired
    private JwtTokenUserInterceptor jwtTokenUserInterceptor;
    @Autowired
    private OptionalJwtUserInterceptor optionalJwtUserInterceptor;

    protected void addInterceptors(InterceptorRegistry registry) {
        log.info("开始注册自定义拦截器...");
        registry.addInterceptor(jwtTokenAdminInterceptor)
                .addPathPatterns("/admin/**")
                .excludePathPatterns("/admin/employee/login");

        registry.addInterceptor(jwtTokenUserInterceptor)
                .addPathPatterns("/user/**")
                .excludePathPatterns(
                        "/user/user/login",
                        "/user/user/sendCode",
                        "/user/user/webLogin",
                        "/user/user/refresh",
                        "/user/shop/status",
                        "/user/shop/config",
                        "/user/coupon/available",
                        "/user/dish/list",
                        "/user/dish/{id}",
                        "/user/category/list",
                        "/user/setmeal/list",
                        "/user/setmeal/dish/{id}",
                        "/user/setmeal/{id}"
                );

        // 公开接口仍需识别"已登录用户"，否则优惠券列表的"已领取"标记恒为 false
        registry.addInterceptor(optionalJwtUserInterceptor)
                .addPathPatterns("/user/coupon/available");

        //AI 对话接口同样要求登录（/api/chat/**）
        registry.addInterceptor(jwtTokenUserInterceptor)
                .addPathPatterns("/api/**");
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("项目接口文档")
                        .version("2.0")
                        .description("项目接口文档"));
    }

    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        log.info("开始设置静态资源映射...");
        registry.addResourceHandler("/doc.html").addResourceLocations("classpath:/META-INF/resources/");
        registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");
    }

    protected void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        log.info("开始扩展消息转换器...");
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(new JacksonObjectMapper());
        converters.add(0, converter);
    }
}
