package com.mzhl.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 店铺公开配置（C 端下单页需要）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopConfigVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 营业状态：1 营业中，0 打烊 */
    private Integer status;

    /** 每单固定打包费（元），与下单时服务端实际收取的金额同源 */
    private BigDecimal packFee;
}
