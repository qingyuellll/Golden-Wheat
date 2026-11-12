package com.mzhl.mapper;

import com.github.pagehelper.Page;
import com.mzhl.annotation.AutoFill;
import com.mzhl.dto.DishPageQueryDTO;
import com.mzhl.entity.Dish;
import com.mzhl.enumeration.OperationType;
import com.mzhl.vo.DishVO;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface DishMapper {

    /**
     * 根据分类id查询菜品数量
     * @param categoryId
     * @return
     */
    @Select("select count(id) from dish where category_id = #{categoryId}")
    Integer countByCategoryId(Long categoryId);

    /**
     * 插入一个菜品数据
     *
     * @param dish 要插入的Dish类型对象，包含菜品相关信息
     */
    @AutoFill(value = OperationType.INSERT)
    void insert(Dish dish);

    /**
     * 分页查询菜品信息
     * @param dishPageQueryDTO 菜品分页查询条件数据传输对象，包含分页参数和查询条件
     * @return Page<DishVO> 返回一个包含菜品视图对象(DishVO)的分页结果对象
     */
    Page<DishVO> pageQuery(DishPageQueryDTO dishPageQueryDTO);

    /**
     * 根据ID获取菜品信息
     * @param id 菜品的唯一标识符
     * @return 返回对应的Dish对象，如果未找到则可能返回null
     */
    @Select("select * from dish where id = #{id}")
    Dish getById(Long id);

    /**
     * 根据ID删除记录
     * @param id 要删除的记录ID
     */
    @Delete("delete from dish where id = #{id}")
    void deleteById(Long id);

    /**
     * 根据菜品id列表批量删除菜品
     * @param dishIds 菜品id列表
     */


    void deleteByIds(List<Long> dishIds);

    /**
     * 根据菜品id查询菜品数据
     * @param dish 菜品id列表
     * @return 菜品数据列表
     */
    @AutoFill(value = OperationType.UPDATE)
    void update(Dish dish);

    /**
     * 根据套餐id查询菜品
     * @param setmealId
     * @return
     */
    @Select("select a.* from dish a left join setmeal_dish b on a.id = b.dish_id where b.setmeal_id = #{setmealId}")
    List<Dish> getBySetmealId(Long setmealId);

    /**
     * 动态条件查询菜品
     * @param dish
     * @return
     */
    List<Dish> list(Dish dish);


        /**
         * 根据条件统计菜品数量
         * @param map
         * @return
         */
        Integer countByMap(Map map);
}
