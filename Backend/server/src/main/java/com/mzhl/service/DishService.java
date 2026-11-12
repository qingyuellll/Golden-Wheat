package com.mzhl.service;

import com.mzhl.dto.DishDTO;
import com.mzhl.dto.DishPageQueryDTO;
import com.mzhl.entity.Dish;
import com.mzhl.result.PageResult;
import com.mzhl.vo.DishVO;

import java.util.List;

public interface DishService {

    /**
     * 保存菜品和口味信息的方法
     * @param dishDTO 菜品数据传输对象，包含需要保存的菜品信息
     */
    public void saveWithFlavor(DishDTO dishDTO);

    /**
     * 分页查询菜品信息
     * @param dishPageQueryDTO 菜品分页查询条件对象，包含页码、每页大小、查询条件等信息
     * @return PageResult 分页查询结果，包含菜品数据列表及分页信息
     */
    PageResult pageQuery(DishPageQueryDTO dishPageQueryDTO);

    /**
     * 批量删除方法
     * 根据传入的ID列表批量删除对应的记录
     *
     * @param ids 要删除的记录ID列表，类型为Long类型的List集合
     */
    void deleteBatch(List<Long> ids);

    /**
     * 根据ID查询菜品信息，并获取口味数据
     * @param id 菜品ID
     * @return DishVO 包含菜品信息和口味数据的视图对象
     */
    DishVO getByIdWithFlavor(Long id);

    /**
     * 根据ID查询菜品信息
     * @param id 菜品ID
     * @return Dish 菜品实体对象
     */
    Dish getById(Long id);

    /**
     * 根据风味信息更新菜品信息
     * @param dishDTO 包含菜品风味信息的DTO对象
     */
    void updateWithFlavor(DishDTO dishDTO);

    /**
     * 条件查询菜品和口味
     * @param dish
     * @return
     */
    List<DishVO> listWithFlavor(Dish dish);

    /**
     * 菜品起售停售
     * @param status
     * @param id
     */
    void startOrStop(Integer status, Long id);

    /**
     * 根据分类id查询菜品
     * @param categoryId
     * @return
     */
    List<Dish> list(Long categoryId);
}


