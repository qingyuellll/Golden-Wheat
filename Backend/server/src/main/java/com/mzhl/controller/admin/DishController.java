package com.mzhl.controller.admin;


import com.mzhl.dto.DishDTO;
import com.mzhl.dto.DishPageQueryDTO;
import com.mzhl.entity.Dish;
import com.mzhl.result.PageResult;
import com.mzhl.result.Result;
import com.mzhl.service.DishService;
import com.mzhl.vo.DishVO;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/admin/dish")
@Tag(name = "菜品相关接口")
@Slf4j
public class DishController {

    @Autowired
    private DishService dishService;
    @Autowired
    private RedisTemplate redisTemplate;

    /**
     * 新增菜品接口
     * @param dishDTO 菜品数据传输对象，包含菜品的基本信息和口味信息
     * @return 返回操作结果，成功时返回成功状态码
     */
    @PostMapping
    @Operation(summary = "新增菜品")
    public Result save(@RequestBody DishDTO dishDTO){
    // 打印新增菜品的日志信息，包含菜品详情
        log.info("新增菜品：{}",dishDTO);
    // 调用服务层方法保存菜品及其口味信息
        dishService.saveWithFlavor(dishDTO);

    // 返回操作成功的结果
        String key = "dish_" + dishDTO.getCategoryId();
        clearCache(key);
        return Result.success();
    }

    /**
     * 菜品分页查询接口
     * @param dishPageQueryDTO 菜品分页查询条件数据传输对象
     * @return 返回分页查询结果，包含菜品分页信息
     */
    @GetMapping("/page")    // HTTP GET请求映射，用于处理菜品分页查询请求
    @Operation(summary = "菜品分页查询")  // Swagger注解，用于API文档说明
    public Result<PageResult> page(DishPageQueryDTO dishPageQueryDTO){  // 方法定义，接收分页查询参数
        log.info("菜品分页查询：{}",dishPageQueryDTO);  // 记录日志，输出查询参数
        PageResult pageResult = dishService.pageQuery(dishPageQueryDTO);  // 调用服务层方法执行分页查询
        return Result.success(pageResult);  // 返回成功响应，包含分页查询结果

    }

    /**
     * 删除菜品接口
     * @param ids 菜品ID列表，支持批量删除
     * @return 返回操作结果
     */
    @DeleteMapping
    @Operation(summary = "删除菜品")
    public Result delete(@RequestParam List<Long> ids){
        log.info("删除菜品：{}",ids);  // 记录删除操作的日志信息，包含要删除的菜品ID列表
        dishService.deleteBatch(ids);
        clearCache("dish_*");

        return Result.success();// 调用服务层方法，删除菜品及其关联的口味信息

    }

    /**
     * 根据ID查询菜品信息
     * @param id 菜品的唯一标识符
     * @return 返回一个包含菜品信息的结果对象
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询菜品信息")
    public Result<DishVO> getById(@PathVariable Long id){
    // 记录查询日志，包含要查询的菜品ID
        log.info("根据ID查询菜品：{}",id);

        DishVO dishVO =dishService.getByIdWithFlavor(id);
    // 返回成功结果，实际应用中应查询数据库后返回具体数据
        return Result.success(dishVO);
    }

    /**
     * 更新菜品信息的接口方法
     * @param dishDTO 包含菜品更新数据的DTO对象，通过请求体传递
     * @return 返回一个成功的结果对象
     */
    @PutMapping
    @Operation(summary = "更新菜品信息")
    public Result update(@RequestBody DishDTO dishDTO){
        log.info("更新菜品：{}",dishDTO);  // 记录更新操作的日志信息，包含要更新的菜品数据
        dishService.updateWithFlavor(dishDTO);
        // 调用服务层方法，更新菜品及其关联的口味信息
        clearCache("dish_*");

        return Result.success();  // 直接返回成功结果，实际应用中可能需要包含更新后的数据
    }

    /**
     * 菜品起售停售
     * @param status
     * @param id
     * @return
     */
    @PostMapping("/status/{status}")
    @Operation(summary = "菜品起售停售")
    public Result<String> startOrStop(@PathVariable Integer status, Long id){
        dishService.startOrStop(status,id);

        clearCache("dish_*");

        return Result.success();
    }

    /**
     * 根据分类id查询菜品
     * @param categoryId
     * @return
     */
    @GetMapping("/list")
    @Operation(summary = "根据分类id查询菜品")
    public Result<List<Dish>> list(Long categoryId){
        List<Dish> list = dishService.list(categoryId);
        return Result.success(list);
    }

    /**
     * 清除符合指定模式的Redis缓存键
     * @param pattern 匹配的键模式，可以使用通配符，例如"user:*"表示所有以"user:"开头的键
     */
    private void clearCache(String pattern){
    // 根据模式获取所有匹配的键集合
        Set keys = redisTemplate.keys(pattern);
    // 删除获取到的所有键
        redisTemplate.delete(keys);
    }
}
