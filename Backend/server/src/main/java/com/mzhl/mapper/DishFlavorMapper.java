package com.mzhl.mapper;

import com.mzhl.entity.DishFlavor;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DishFlavorMapper {
    /**
     * 批量插入菜品口味数据
     * @param flavors 菜品口味列表，包含需要插入的所有口味信息
     */
    void insertBatch(List<DishFlavor> flavors);

    /**
     * 根据菜品id查询对应的口味数据
     * @param dishId 菜品id
     * @return 菜品口味列表
     */
    @Delete("delete from dish_flavor where dish_id = #{id}")
    void deleteByDishId(Long dishId);

    /**
     * 根据菜品id列表批量删除菜品口味数据
     * @param dishIds 菜品id列表
     */
    void deleteByDishIds(List<Long> dishIds);

    /**
     * 根据菜品id查询对应的口味数据
     * @param dishId 菜品id
     * @return 菜品口味列表
     */
    @Select("select * from dish_flavor where dish_id = #{dishId}")
    List<DishFlavor> getByDishId(Long dishId);
}
