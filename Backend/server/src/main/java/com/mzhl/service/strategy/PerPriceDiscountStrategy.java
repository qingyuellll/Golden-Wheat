package com.mzhl.service.strategy;

import com.mzhl.entity.Coupon;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 每满减策略
 * 作用：实现"每满X减Y"的优惠计算，可叠加
 *
 * 示例：
 * - 每满100减20
 * - 订单金额250元 → 可以享受2次优惠 → 减免40元
 *
 * 计算公式：
 * 优惠次数 = floor(订单金额 / 门槛金额)
 * 优惠金额 = 优惠次数 × 每次减免金额
 * 最终优惠 = min(优惠金额, 最大优惠金额)
 */
@Component // Spring组件注解，自动注册到容器
public class PerPriceDiscountStrategy implements DiscountStrategy {

    /**
     * 判断是否可用
     * 条件：订单金额 >= 使用门槛
     */
    @Override
    public boolean canUse(BigDecimal orderAmount, Coupon coupon) {
        // 空值检查：如果门槛金额为null或0，表示无门槛
        if (coupon.getThresholdAmount() == null
            || coupon.getThresholdAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return true;
        }

        // 比较订单金额和门槛金额
        // compareTo返回值：-1(小于) 0(等于) 1(大于)
        return orderAmount.compareTo(coupon.getThresholdAmount()) >= 0;
    }

    /**
     * 计算优惠金额
     * 核心逻辑：循环累加，直到不满足条件
     */
    @Override
    public BigDecimal calculateDiscount(BigDecimal orderAmount, Coupon coupon) {
        // 获取门槛金额（如100元）
        BigDecimal threshold = coupon.getThresholdAmount();

        // 获取每次减免金额（如20元）
        BigDecimal discountPerTime = coupon.getDiscountValue();

        // 获取最大优惠金额（如上限50元）
        BigDecimal maxDiscount = coupon.getMaxDiscountAmount();

        // 防御性编程：如果门槛金额为0或null，返回0优惠
        if (threshold == null || threshold.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // 计算可以享受几次优惠
        // 例如：250 / 100 = 2次（向下取整）
        int times = orderAmount.divide(threshold, 0, RoundingMode.DOWN).intValue();

        // 计算总优惠金额
        // 例如：2次 × 20元 = 40元
        BigDecimal totalDiscount = discountPerTime.multiply(new BigDecimal(times));

        // 如果有最大优惠限制，取较小值
        // 例如：计算出的优惠是80元，但上限是50元 → 最终优惠50元
        if (maxDiscount != null && maxDiscount.compareTo(BigDecimal.ZERO) > 0) {
            // min方法返回两个BigDecimal中较小的那个
            totalDiscount = totalDiscount.min(maxDiscount);
        }

        // 确保优惠金额不超过订单金额（极端情况保护）
        totalDiscount = totalDiscount.min(orderAmount);

        return totalDiscount;
    }

    /**
     * 生成规则描述
     * 格式："每满X减Y，上限Z"
     */
    @Override
    public String getRuleDescription(Coupon coupon) {
        // 使用StringBuilder拼接字符串（性能优于+运算符）
        StringBuilder sb = new StringBuilder();

        // 拼接门槛金额
        sb.append("每满").append(coupon.getThresholdAmount()).append("减").append(coupon.getDiscountValue());

        // 如果有最大优惠限制，追加说明
        if (coupon.getMaxDiscountAmount() != null
            && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("，上限").append(coupon.getMaxDiscountAmount());
        }

        return sb.toString();
    }

    /**
     * 返回策略类型
     * 1表示每满减策略
     */
    @Override
    public Integer getStrategyType() {
        return 1;
    }
}