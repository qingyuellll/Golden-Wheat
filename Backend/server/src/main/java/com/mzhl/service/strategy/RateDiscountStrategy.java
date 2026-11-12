package com.mzhl.service.strategy;

import com.mzhl.entity.Coupon;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 折扣策略
 * 作用：实现"打几折"的优惠计算
 *
 * 示例：
 * - 8折券（discountValue=80）
 * - 订单金额100元 → 优惠20元 → 实付80元
 *
 * 计算公式：
 * 折扣率 = discountValue / 100
 * 优惠金额 = 订单金额 × (1 - 折扣率)
 * 最终优惠 = min(优惠金额, 最大优惠金额)
 */
@Component
public class RateDiscountStrategy implements DiscountStrategy {

    /**
     * 判断是否可用
     * 条件：订单金额 >= 使用门槛
     */
    @Override
    public boolean canUse(BigDecimal orderAmount, Coupon coupon) {
        // 如果门槛金额为null或0，表示无门槛
        if (coupon.getThresholdAmount() == null
            || coupon.getThresholdAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return true;
        }

        // 检查订单金额是否达到门槛
        return orderAmount.compareTo(coupon.getThresholdAmount()) >= 0;
    }

    /**
     * 计算优惠金额
     * 核心逻辑：按比例计算折扣
     */
    @Override
    public BigDecimal calculateDiscount(BigDecimal orderAmount, Coupon coupon) {
        // 获取折扣值（如80表示8折）
        BigDecimal discountValue = coupon.getDiscountValue();

        // 获取最大优惠金额
        BigDecimal maxDiscount = coupon.getMaxDiscountAmount();

        // 防御性编程：检查折扣值合法性
        if (discountValue == null || discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // 计算折扣率
        // 例如：80 / 100 = 0.8（8折）
        BigDecimal discountRate = discountValue.divide(
            new BigDecimal(100),    // 除以100
            2,                       // 保留2位小数
            RoundingMode.HALF_UP     // 四舍五入
        );

        // 计算优惠比例
        // 例如：1 - 0.8 = 0.2（优惠20%）
        BigDecimal discountRatio = BigDecimal.ONE.subtract(discountRate);

        // 计算优惠金额
        // 例如：100元 × 0.2 = 20元
        BigDecimal discountAmount = orderAmount.multiply(discountRatio);

        // 四舍五入到分（保留2位小数）
        discountAmount = discountAmount.setScale(2, RoundingMode.HALF_UP);

        // 如果有最大优惠限制，取较小值
        // 例如：8折理论上优惠80元，但上限是30元 → 最终优惠30元
        if (maxDiscount != null && maxDiscount.compareTo(BigDecimal.ZERO) > 0) {
            discountAmount = discountAmount.min(maxDiscount);
        }

        // 确保优惠金额不超过订单金额
        discountAmount = discountAmount.min(orderAmount);

        return discountAmount;
    }

    /**
     * 生成规则描述
     * 格式："X折"或"X折，上限Z"
     */
    @Override
    public String getRuleDescription(Coupon coupon) {
        StringBuilder sb = new StringBuilder();

        // 将折扣值转换为可读格式
        // 例如：80 → 8.0折
        BigDecimal discountValue = coupon.getDiscountValue();
        BigDecimal displayValue = discountValue.divide(new BigDecimal(10), 1, RoundingMode.HALF_UP);
        sb.append(displayValue).append("折");

        // 如果有最大优惠限制，追加说明
        if (coupon.getMaxDiscountAmount() != null
            && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("，上限").append(coupon.getMaxDiscountAmount());
        }

        // 如果有门槛，追加说明
        if (coupon.getThresholdAmount() != null
            && coupon.getThresholdAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("，满").append(coupon.getThresholdAmount()).append("可用");
        }

        return sb.toString();
    }

    /**
     * 返回策略类型
     * 2表示折扣策略
     */
    @Override
    public Integer getStrategyType() {
        return 2;
    }
}