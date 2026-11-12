package com.mzhl.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * 优惠计算请求DTO
 * 作用：计算订单可用优惠券时传递的数据
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponCalculateDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    // 用户ID
    private Long userId;

    // 订单中的商品列表
    private List<OrderItemDTO> items;

    // 用户勾选的优惠券组合（user_coupon.id 列表，顺序即结算口径中的核销顺序）
    private List<Long> userCouponIds;

    /**
     * 内部静态类：订单项
     * 为什么不直接用OrderDetail？因为计算优惠只需要部分字段
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO implements Serializable {

        // 商品ID（菜品或套餐ID）
        private Long itemId;

        // 商品类型：1-菜品 2-套餐
        private Integer itemType;

        // 商品分类ID（用于判断是否在优惠券范围内）
        private Long categoryId;

        // 商品单价（分）
        private BigDecimal price;

        // 购买数量
        private Integer quantity;
    }
}