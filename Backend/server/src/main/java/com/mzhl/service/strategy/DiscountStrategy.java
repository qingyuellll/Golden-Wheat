package com.mzhl.service.strategy;

import com.mzhl.entity.Coupon;
import java.math.BigDecimal;

/**
 * 优惠计算策略接口
 * 作用：定义统一的优惠计算规范
 *
 * 设计模式：策略模式（Strategy Pattern）
 * - 目的：封装不同的优惠算法，使其可以互相替换
 * - 优点：
 *   1. 符合开闭原则：新增优惠类型不需要修改现有代码
 *   2. 符合单一职责：每个策略类只负责一种计算逻辑
 *   3. 消除if-else：通过多态替代条件判断
 *
 * 实现类：
 * - PerPriceDiscountStrategy：每满减策略
 * - RateDiscountStrategy：折扣策略
 * - FixedDiscountStrategy：固定金额策略
 */
public interface DiscountStrategy {

    /**
     * 判断优惠券是否可用
     *
     * @param orderAmount 订单总金额（元）
     * @param coupon 优惠券对象
     * @return true-可用 false-不可用
     *
     * 实现原理：
     * - 检查订单金额是否达到使用门槛
     * - 检查商品是否在适用范围内
     */
    boolean canUse(BigDecimal orderAmount, Coupon coupon);

    /**
     * 计算优惠金额
     *
     * @param orderAmount 订单总金额（元）
     * @param coupon 优惠券对象
     * @return 优惠金额（元）
     *
     * 实现原理：
     * - 根据discountType选择不同的计算公式
     * - 考虑最大优惠金额限制
     * - 返回BigDecimal保证精度
     */
    BigDecimal calculateDiscount(BigDecimal orderAmount, Coupon coupon);

    /**
     * 获取优惠规则描述
     *
     * @param coupon 优惠券对象
     * @return 规则描述，如"满100减20"、"8折"
     *
     * 作用：前端展示给用户看
     */
    String getRuleDescription(Coupon coupon);

    /**
     * 获取策略类型标识
     *
     * @return 策略类型：1-每满减 2-折扣 3-固定金额
     *
     * 作用：用于工厂模式匹配策略
     */
    Integer getStrategyType();
}