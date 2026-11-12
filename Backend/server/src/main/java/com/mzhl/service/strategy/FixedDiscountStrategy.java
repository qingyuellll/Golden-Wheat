package com.mzhl.service.strategy;

import com.mzhl.entity.Coupon;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/**
 * 固定金额策略
 * 作用：实现"满X减Y"的优惠计算，不可叠加
 *
 * 示例：
 * - 满100减20券
 * - 订单金额150元 → 优惠20元 → 实付130元
 *
 * 与每满减的区别：
 * - 固定金额：只能用一次（满100减20，200也只减20）
 * - 每满减：可叠加（每满100减20，200减40）
 */
@Component
public class FixedDiscountStrategy implements DiscountStrategy {

    /**
     * 判断是否可用
     * 条件：订单金额 >= 使用门槛
     */
    @Override
    public boolean canUse(BigDecimal orderAmount, Coupon coupon) {
        // 如果门槛金额为null或0，表示无门槛立减
        if (coupon.getThresholdAmount() == null
            || coupon.getThresholdAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return true;
        }

        // 检查订单金额是否达到门槛
        return orderAmount.compareTo(coupon.getThresholdAmount()) >= 0;
    }

    /**
     * 计算优惠金额
     * 核心逻辑：直接使用discountValue作为优惠金额
     */
    @Override
    public BigDecimal calculateDiscount(BigDecimal orderAmount, Coupon coupon) {
        // 获取优惠金额（如20元）
        BigDecimal discountValue = coupon.getDiscountValue();

        // 防御性编程：检查优惠金额合法性
        if (discountValue == null || discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // 固定金额就是优惠值本身
        BigDecimal discountAmount = discountValue;

        // 确保优惠金额不超过订单金额（极端情况保护）
        // 例如：订单50元，优惠券是减100元 → 最多只能优惠50元
        discountAmount = discountAmount.min(orderAmount);

        return discountAmount;
    }

    /**
     * 生成规则描述
     * 格式："满X减Y"或"立减Y"（无门槛时）
     */
    @Override
    public String getRuleDescription(Coupon coupon) {
        StringBuilder sb = new StringBuilder();

        // 如果有门槛，显示"满X减Y"
        if (coupon.getThresholdAmount() != null
            && coupon.getThresholdAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("满").append(coupon.getThresholdAmount());
        } else {
            // 无门槛时显示"立减"
            sb.append("立减");
        }

        // 拼接优惠金额
        sb.append("减").append(coupon.getDiscountValue());

        return sb.toString();
    }

    /**
     * 返回策略类型
     * 3表示固定金额策略
     */
    @Override
    public Integer getStrategyType() {
        return 3;
    }
}