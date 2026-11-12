package com.mzhl.dto;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券数据传输对象
 * 作用：前端传递优惠券创建/修改数据到后端
 *
 * 为什么需要DTO？
 * - 安全：避免暴露Entity的所有字段（如creator、updater）
 * - 解耦：前端数据结构可以和数据库结构不一致
 * - 校验：可以在DTO上加验证注解
 */
@Data
public class CouponDTO implements Serializable {

    // 序列化版本号
    private static final long serialVersionUID = 1L;

    // 优惠券ID（修改时需要，创建时不需要）
    private Long id;

    // 优惠券名称
    private String name;

    // 优惠券类型：1-代金券 2-折扣券 3-赠品券
    private Integer type;

    // 优惠计算方式：1-每满减 2-阶梯折扣 3-固定折扣
    private Integer discountType;

    // 是否指定商品：0-全场通用 1-指定商品
    private Integer specific;

    // 优惠值
    private BigDecimal discountValue;

    // 使用门槛
    private BigDecimal thresholdAmount;

    // 最大优惠金额
    private BigDecimal maxDiscountAmount;

    // 获取方式：1-用户领取 2-兑换码 3-系统发放
    private Integer obtainWay;

    // 可领取开始时间
    private LocalDateTime issueBeginTime;

    // 可领取结束时间
    private LocalDateTime issueEndTime;

    // 有效期天数
    private Integer termDays;

    // 固定有效期开始时间
    private LocalDateTime termBeginTime;

    // 固定有效期结束时间
    private LocalDateTime termEndTime;

    // 发行总量
    private Integer totalNum;

    // 每人限领数量
    private Integer userLimit;

    // 扩展参数（JSON字符串）
    private String extParam;

    // 指定商品/分类ID列表（前端传递，后端存入coupon_scope表）
    private java.util.List<Long> scopeIds;
}
