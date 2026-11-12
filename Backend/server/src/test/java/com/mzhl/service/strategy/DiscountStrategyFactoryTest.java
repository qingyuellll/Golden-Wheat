package com.mzhl.service.strategy;

import com.mzhl.entity.Coupon;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class DiscountStrategyFactoryTest {

    @Test
    void shouldTreatDiscountType3AsRateCoupon() {
        DiscountStrategyFactory factory = new DiscountStrategyFactory(List.of(
                new PerPriceDiscountStrategy(),
                new RateDiscountStrategy(),
                new FixedDiscountStrategy()
        ));

        Coupon coupon = Coupon.builder()
                .discountType(3)
                .discountValue(new BigDecimal("80"))
                .thresholdAmount(new BigDecimal("50"))
                .maxDiscountAmount(new BigDecimal("50"))
                .build();

        DiscountStrategy strategy = factory.getStrategy(coupon.getDiscountType());

        assertInstanceOf(RateDiscountStrategy.class, strategy);
        assertEquals(new BigDecimal("20.00"), strategy.calculateDiscount(new BigDecimal("100"), coupon));
        assertEquals("8折，满50可用", strategy.getRuleDescription(coupon));
    }
}
