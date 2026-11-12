package com.mzhl.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * 最优优惠券组合VO
 * 作用：返回最省钱的优惠券组合方案
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimalCouponVO implements Serializable {

    private static final long serialVersionUID = 1L;

    // 推荐使用的用户优惠券ID列表
    private List<Long> userCouponIds;

    // 优惠券名称列表
    private List<String> couponNames;

    // 总优惠金额
    private BigDecimal totalDiscount;

    // 原价
    private BigDecimal originalAmount;

    // 实付金额
    private BigDecimal payAmount;

    // 节省金额
    private BigDecimal savedAmount;
}