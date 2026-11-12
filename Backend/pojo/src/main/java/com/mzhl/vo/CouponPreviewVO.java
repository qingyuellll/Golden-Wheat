package com.mzhl.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * 优惠券组合试算结果：与下单锁定（lockCouponsForOrder）完全同一口径，
 * 供结算页在用户勾选优惠券组合时实时预览精确优惠。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponPreviewVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 商品小计（不含打包费） */
    private BigDecimal orderAmount;

    /** 组合内每张券的实算优惠（顺序核销口径） */
    private List<CouponDiscount> coupons;

    /** 组合总优惠 */
    private BigDecimal totalDiscount;

    /** 试算应付金额 = 小计 - 总优惠（不含打包费，最低为 0） */
    private BigDecimal payAmount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CouponDiscount implements Serializable {

        private static final long serialVersionUID = 1L;

        /** user_coupon.id */
        private Long userCouponId;

        /** 券名称 */
        private String name;

        /** 该券在组合中的实算优惠（不满足门槛被跳过则为 0） */
        private BigDecimal discount;

        /** 是否因未达门槛被跳过 */
        private Boolean skipped;
    }
}
