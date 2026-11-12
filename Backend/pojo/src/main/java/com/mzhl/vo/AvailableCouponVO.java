package com.mzhl.vo;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 可用优惠券VO
 * 作用：下单时展示可用的优惠券列表
 */
@Data
public class AvailableCouponVO implements Serializable {

    private static final long serialVersionUID = 1L;

    // 用户优惠券ID
    private Long userCouponId;

    // 优惠券名称
    private String name;

    // 优惠金额（预估）
    private BigDecimal discountAmount;

    // 优惠规则描述
    private String ruleDesc;

    // 使用门槛
    private BigDecimal thresholdAmount;

    // 是否满足使用条件
    private Boolean canUse;

    // 不可用原因（当canUse=false时）
    private String unavailableReason;
}