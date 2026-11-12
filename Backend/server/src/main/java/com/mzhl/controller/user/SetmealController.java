package com.mzhl.controller.user;

import com.mzhl.constant.StatusConstant;
import com.mzhl.entity.Setmeal;
import com.mzhl.result.Result;
import com.mzhl.service.SetmealService;
import com.mzhl.vo.DishItemVO;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("userSetmealController")
@RequestMapping("/user/setmeal")
@Slf4j
@Tag(name = "C端-套餐浏览接口")
public class SetmealController {
    @Autowired
    private SetmealService setmealService;

    /**
     * 条件查询
     *
     * @param categoryId
     * @return
     */
    @GetMapping("/list")
    @Operation(summary = "根据分类id查询套餐")
    @Cacheable(cacheNames = "setmealCache", key = "#categoryId")//key: "setmealCache::categoryId"
    public Result<List<Setmeal>> list(Long categoryId) {
        log.info("查询的套餐分类id为：{}", categoryId);
        Setmeal setmeal = new Setmeal();
        setmeal.setCategoryId(categoryId);
        setmeal.setStatus(StatusConstant.ENABLE);

        List<Setmeal> list = setmealService.list(setmeal);
        return Result.success(list);
    }

    /**
     * 根据套餐id查询包含的菜品列表
     *
     * @param id
     * @return
     */
    @GetMapping("/dish/{id}")
    @Operation(summary = "根据套餐id查询包含的菜品列表")
    public Result<List<DishItemVO>> dishList(@PathVariable("id") Long id) {
        log.info("查询的套餐id为：{}", id);
        List<DishItemVO> list = setmealService.getDishItemById(id);
        return Result.success(list);
    }

    /**
     * 根据套餐id查询套餐详情（C 端详情页）
     *
     * @param id
     * @return
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据id查询套餐")
    public Result<Setmeal> getById(@PathVariable("id") Long id) {
        log.info("查询的套餐id为：{}", id);
        Setmeal setmeal = setmealService.getById(id);
        if (setmeal == null || !StatusConstant.ENABLE.equals(setmeal.getStatus())) {
            return Result.error("套餐不存在或已停售");
        }
        return Result.success(setmeal);
    }
}
