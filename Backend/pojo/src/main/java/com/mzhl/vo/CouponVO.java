package com.mzhl.vo;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券视图对象
 * 作用：返回给前端的优惠券信息
 *
 * 为什么需要VO？
 * - 过滤敏感字段（如creator、updater）
 * - 添加计算字段（如剩余数量、可用性状态）
 * - 格式化数据（如将status转为文字描述）
 */
@Data
public class CouponVO implements Serializable {

    private static final long serialVersionUID = 1L;

    // 优惠券ID
    private Long id;

    // 优惠券名称
    private String name;

    // 优惠券类型描述："代金券"、"折扣券"
    private String typeDesc;

    // 优惠规则描述："满100减20"、"8折"
    private String ruleDesc;

    // 优惠计算方式
    private Integer discountType;

    // 优惠值
    private BigDecimal discountValue;

    // 使用门槛
    private BigDecimal thresholdAmount;

    // 最大优惠金额
    private BigDecimal maxDiscountAmount;

    // 可领取开始时间
    private LocalDateTime issueBeginTime;

    // 可领取结束时间
    private LocalDateTime issueEndTime;

    // 有效期说明："领取后7天有效"、"2026-05-01至2026-06-01有效"
    private String validityDesc;

    // 发行总量
    private Integer totalNum;

    // 已领取数量
    private Integer issueNum;

    // 剩余数量（计算字段 = totalNum - issueNum）
    private Integer remainNum;

    // 每人限领数量
    private Integer userLimit;

    // 状态：1-进行中 2-已停止
    private Integer status;

    // 状态描述："进行中"、"已停止"
    private String statusDesc;

    // 用户是否已领取（查询时动态设置）
    private Boolean received;

    // 是否指定商品范围：0-全场通用 1-定向券（编辑回显需要，直接取自券模板）
    private Integer specific;

    // 适用范围描述："全场通用"、"仅限川菜"
    private String scopeDesc;
}