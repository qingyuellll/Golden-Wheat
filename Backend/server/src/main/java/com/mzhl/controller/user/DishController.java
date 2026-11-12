package com.mzhl.controller.user;

import com.mzhl.constant.StatusConstant;
import com.mzhl.entity.Dish;
import com.mzhl.result.Result;
import com.mzhl.service.DishService;
import com.mzhl.vo.DishVO;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController("userDishController")
@RequestMapping("/user/dish")
@Slf4j
@Tag(name = "C端-菜品浏览接口")
public class DishController {
    @Autowired
    private DishService dishService;

    @Autowired
    private RedisTemplate redisTemplate;

    /**
     * 根据ID查询菜品（含口味），供 C 端详情页展示与选规格
     *
     * @param id
     * @return
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询菜品")
    public Result<DishVO> getById(@PathVariable Long id) {
        log.info("查询菜品ID：{}", id);
        DishVO dishVO = dishService.getByIdWithFlavor(id);
        if (dishVO == null) {
            log.warn("未找到菜品，ID：{}", id);
            return Result.error("菜品不存在");
        }
        log.info("查询到菜品：{}", dishVO.getName());
        return Result.success(dishVO);
    }

    @GetMapping("/test")
    public Result<String> test() {
        return Result.success("test ok");
    }

    /**
     * 根据分类id查询菜品
     *
     * @param categoryId
     * @return
     */
    @GetMapping("/list")
    @Operation(summary = "根据分类id查询菜品")

    public Result<List<DishVO>> list(Long categoryId) {

        String key = "dish_" + categoryId;

        List<DishVO> list = null;
        try {
            list = (List<DishVO>) redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.warn("Redis缓存读取异常，清除旧缓存key: {}", key);
            redisTemplate.delete(key);
        }

        if (list != null && !list.isEmpty()) {
            return Result.success(list);
        }

        log.info("查询的菜品分类id为：{}", categoryId);
        Dish dish = new Dish();
        dish.setCategoryId(categoryId);
        dish.setStatus(StatusConstant.ENABLE);

        list = dishService.listWithFlavor(dish);
        redisTemplate.opsForValue().set(key, list);

        return Result.success(list);
    }

}
