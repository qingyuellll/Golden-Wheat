package com.mzhl.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

/**
 * 优惠券适用范围实体类
 * 作用：定义优惠券可以用于哪些商品或分类
 * 数据库表：coupon_scope
 *
 * 设计思想：
 * - 当coupon.specific=1时，需要查询此表确定适用范围
 * - 支持"指定商品"和"指定分类"两种模式
 *
 * 示例：
 * - 某优惠券只可用于"川菜"分类 → type=2, biz_id=川菜分类ID
 * - 某优惠券只可用于"宫保鸡丁" → type=1, biz_id=宫保鸡丁ID
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponScope implements Serializable {

    private static final long serialVersionUID = 1L;

    // 主键ID，自增
    private Long id;

    /** 范围类型：1-指定商品（dish/setmeal） */
    public static final Integer TYPE_DISH = 1;
    /** 范围类型：2-指定分类（category），定向券的适用范围按订单分类匹配 */
    public static final Integer TYPE_CATEGORY = 2;

    // 范围类型：1-指定商品（dish/setmeal） 2-指定分类（category）
    private Integer type;

    // 优惠券ID，关联coupon表的id
    private Long couponId;

    // 业务ID（根据type不同含义不同）
    // type=1时：对应dish_id或setmeal_id
    // type=2时：对应category_id
    private Long bizId;
}
