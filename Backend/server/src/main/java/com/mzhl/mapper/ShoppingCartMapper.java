package com.mzhl.mapper;

import com.mzhl.entity.ShoppingCart;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface ShoppingCartMapper {

    /**
     * 根据购物车对象获取相关的购物车列表
     *
     * @param shoppingCart 购物车对象，作为查询条件
     * @return 返回购物车列表，当前实现返回null
     */
    List<ShoppingCart> list(ShoppingCart shoppingCart) ;

    /**
     * 根据ID更新购物车中的商品数量
     * @param shoppingCart 购物车对象，包含需要更新的商品信息
     */
    @Update("update shopping_cart set number = #{number} where id = #{id}")
    void updateNumberById(ShoppingCart shoppingCart);

    /**
     * 向购物表中插入一条新的购物车记录
     * @param shoppingCart 包含购物车信息的实体对象，包含以下字段：
     *     - id: 购物车记录的唯一标识符
     *     - name: 商品名称
     *     - userId: 用户ID，关联到具体用户
     *     - dishId: 菜品ID，如果是菜品的话
     *     - setmealId: 套餐ID，如果是套餐的话
     *     - dishFlavor: 菜品口味
     *     - number: 商品数量
     *     - amount: 商品金额
     *     - image: 商品图片路径
     *     - createTime: 创建时间
     */
    @Insert("insert into shopping_cart (id, name,  user_id, dish_id, setmeal_id, dish_flavor, number, amount,image, create_time) " +
            "values (#{id}, #{name}, #{userId}, #{dishId}, #{setmealId}, #{dishFlavor}, #{number}, #{amount},#{image}, #{createTime})")
    void insert(ShoppingCart shoppingCart);

    /**
     * 根据用户ID删除相关数据
     *
     * @param userId 用户ID，用于标识需要删除的数据所属的用户
     *              此参数不能为null，否则可能抛出异常
     */
    @Delete("delete from shopping_cart where user_id = #{userId}")
    void deleteByUserId(Long userId);

    /**
     * 根据id删除购物车数据
     * @param id
     */
    @Delete("delete from shopping_cart where id = #{id}")
    void deleteById(Long id);

    /**
     * 批量插入购物车数据
     *
     * @param shoppingCartList
     */
    void insertBatch(List<ShoppingCart> shoppingCartList);


}
