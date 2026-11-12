package com.mzhl.vo;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户优惠券视图对象
 * 作用：返回给用户查看自己持有的优惠券
 */
@Data
public class UserCouponVO implements Serializable {

    private static final long serialVersionUID = 1L;

    // 用户优惠券ID
    private Long id;

    // 优惠券模板ID
    private Long couponId;

    // 优惠券名称
    private String couponName;

    // 优惠规则描述
    private String ruleDesc;

    // 优惠值
    private BigDecimal discountValue;

    // 使用门槛
    private BigDecimal thresholdAmount;

    // 最大优惠金额
    private BigDecimal maxDiscountAmount;

    // 状态：1-未使用 2-已使用 3-已过期
    private Integer status;

    // 状态描述："未使用"、"已使用"
    private String statusDesc;

    // 有效期开始时间
    private LocalDateTime termBeginTime;

    // 有效期结束时间
    private LocalDateTime termEndTime;

    // 剩余天数（计算字段）
    private Integer remainDays;

    // 是否即将过期（<=3天）
    private Boolean expiringSoon;

    // 使用时间
    private LocalDateTime usedTime;
}