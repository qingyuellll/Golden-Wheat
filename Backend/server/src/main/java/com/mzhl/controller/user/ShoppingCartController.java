package com.mzhl.controller.user;


import com.mzhl.dto.ShoppingCartDTO;
import com.mzhl.entity.ShoppingCart;
import com.mzhl.result.Result;
import com.mzhl.service.ShoppingCartService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/shoppingCart")
@Tag(name = "C端-购物车接口")
@Slf4j
public class ShoppingCartController {

    @Autowired
    private ShoppingCartService shoppingCartService;

    /**
     * 添加购物车接口
     * 使用PostMapping注解处理HTTP POST请求
     * @ApiOperation注解用于接口说明，表示此接口用于添加购物车
     * @param shoppingCartDTO 接收前端传递的购物车数据，通过@RequestBody注解将请求体映射到Java对象
     * @return 返回操作结果，使用Result.success()表示操作成功
     */
    @PostMapping("/add")
    @Operation(summary = "添加购物车")
    public Result add(@RequestBody ShoppingCartDTO shoppingCartDTO){
    // 记录添加购物车的日志信息
        log.info("添加购物车,商品信息：{}",shoppingCartDTO);
        // 调用shoppingCartService的add方法添加购物车
        shoppingCartService.addShopingCart(shoppingCartDTO);

    // 返回成功结果
        return Result.success();
    }

    /**
     * 查询购物车列表接口
     * 通过GET请求获取当前用户的购物车信息
     *
     * @return 返回Result对象，包含购物车列表数据
     */
    @GetMapping("/list")    // HTTP GET请求映射，用于处理"/list"路径的请求
    @Operation(summary = "查询购物车")  // Swagger API注解，描述接口功能为"查询购物车"
    public Result<List<ShoppingCart>> list(){
        List<ShoppingCart> list = shoppingCartService.showShoppingCart();
        return Result.success(list);

    }

    /**
     * 清空购物车的接口方法
     * 使用HTTP DELETE方法请求
     *
     * @return 返回一个操作成功的结果对象
     */
    @DeleteMapping("/clean")    // 映射HTTP DELETE请求到/clean路径
    @Operation(summary = "清空购物车")  // Swagger注解，表示该接口的功能描述
    public Result clean(){
        shoppingCartService.cleanShoppingCart();// 定义一个名为clean的方法，返回Result类型
        return Result.success(); // 返回一个表示操作成功的Result对象
    }

    /**
     * 删除购物车中一个商品
     * @param shoppingCartDTO
     * @return
     */
    @PostMapping("/sub")
    @Operation(summary = "删除购物车中一个商品")
    public Result sub(@RequestBody ShoppingCartDTO shoppingCartDTO){
        log.info("删除购物车中一个商品，商品：{}", shoppingCartDTO);
        shoppingCartService.subShoppingCart(shoppingCartDTO);
        return Result.success();
    }
}
