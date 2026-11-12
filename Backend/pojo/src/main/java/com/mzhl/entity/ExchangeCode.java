package com.mzhl.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 兑换码实体类
 * 作用：通过兑换码领取优惠券，常用于营销活动
 * 数据库表：exchange_code
 *
 * 使用场景：
 * - 公众号抽奖获得兑换码
 * - 线下活动发放兑换码
 * - VIP会员专属兑换码
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeCode implements Serializable {

    private static final long serialVersionUID = 1L;

    // 主键ID，自增
    private Long id;

    // 兑换码字符串，如"CPN2026XYZ123"
    private String code;

    // 状态：0-未使用 1-已使用 2-已失效
    private Integer status;

    // 使用后绑定的用户ID，null表示未被使用
    private Long userId;

    // 兑换类型：1-兑换指定优惠券 2-兑换积分 3-兑换其他权益
    private Integer type;

    // 兑换目标ID（根据type不同含义不同）
    // type=1时：对应coupon_id
    // type=2时：积分数值
    private Long exchangeTarget;

    // 兑换码创建时间
    private LocalDateTime createTime;

    // 兑换码过期时间
    private LocalDateTime expiredTime;

    // 记录更新时间
    private LocalDateTime updateTime;
}
