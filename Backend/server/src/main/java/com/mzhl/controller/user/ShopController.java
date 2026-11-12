package com.mzhl.controller.user;

import com.mzhl.result.Result;
import com.mzhl.vo.ShopConfigVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController("userShopController")
@RequestMapping("/user/shop")
@Tag(name = "店铺管理")
@Slf4j
public class ShopController {

    public static final String KEY = "SHOP_STATUS";

    @Autowired
    private RedisTemplate redisTemplate;

    /** 每单固定打包费（元），与下单核算金额使用同一配置，保证前端展示与服务端实收一致 */
    @Value("${mzhl.shop.pack-fee:3}")
    private BigDecimal packFee;

    @GetMapping("/status")
    @Operation(summary = "获取营业状态")
    public Result<Integer> getStatus() {
        return Result.success(readStatus());
    }

    /**
     * 下单页所需的店铺公开配置：营业状态 + 打包费
     */
    @GetMapping("/config")
    @Operation(summary = "获取店铺公开配置")
    public Result<ShopConfigVO> getConfig() {
        ShopConfigVO config = ShopConfigVO.builder()
                .status(readStatus())
                .packFee(packFee)
                .build();
        return Result.success(config);
    }

    private Integer readStatus() {
        Integer status = null;
        try {
            status = (Integer) redisTemplate.opsForValue().get(KEY);
        } catch (Exception e) {
            log.warn("Redis缓存读取异常，清除旧缓存key: {}", KEY);
            redisTemplate.delete(KEY);
        }

        if (status == null) {
            status = 1;
            redisTemplate.opsForValue().set(KEY, status);
        }

        log.info("获取营业状态为：{}", status == 1 ? "营业中" : "打烊中");
        return status;
    }
}
