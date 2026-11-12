package com.mzhl.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 领取优惠券DTO
 * 作用：用户领取优惠券时传递的参数
 */
@Data
public class ReceiveCouponDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    // 优惠券模板ID
    private Long couponId;

    // 兑换码（可选，如果是兑换码领取则需要）
    private String exchangeCode;
}