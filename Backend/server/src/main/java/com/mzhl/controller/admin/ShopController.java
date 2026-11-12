package com.mzhl.controller.admin;

import com.mzhl.result.Result;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

@RestController("adminShopController")
@RequestMapping("/admin/shop")
@Tag(name = "店铺管理")
@Slf4j
public class ShopController {

    public static final String KEY = "SHOP_STATUS";
    @Autowired
    private RedisTemplate redisTemplate;
    /**
     * 设置营业状态接口
     * @param status 营业状态，1表示营业，其他值表示非营业
     * @return 返回操作结果
     */
    @PutMapping("/{status}")
    @Operation(summary = "设置营业状态")
    public Result setStatus(@PathVariable Integer status) {
    // 记录设置店铺状态的日志，输出状态是否为营业(1)
        log.info("设置店铺状态：{}", status == 1?"营业中" : "打烊中");
        // 将营业状态存储到Redis中，key为"shop:status"，value为status
        redisTemplate.opsForValue().set(KEY, status);
    // 返回操作成功的结果
        return Result.success();
    }

    /**
     * 获取营业状态接口
     * @return 返回营业状态结果，1表示营业中，其他表示打烊中
     */
    @GetMapping("/status")
    @Operation(summary = "获取营业状态")
    public Result<Integer> getStatus() {

    // 获取Redis中保存的营业状态，key为"shop:status"
        Integer status = (Integer) redisTemplate.opsForValue().get(KEY);
        log.info("获取营业状态为：{}", status == 1?"营业中" : "打烊中");
    // 返回营业状态
        return Result.success(status);
    }

}
