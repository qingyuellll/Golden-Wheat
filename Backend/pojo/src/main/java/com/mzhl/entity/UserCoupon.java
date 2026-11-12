package com.mzhl.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户优惠券实例实体类
 * 作用：记录用户领取的具体优惠券，是Coupon的实例化
 * 数据库表：user_coupon
 *
 * 设计思想：
 * - Coupon是"模板"，定义规则（如"满100减20券"）
 * - UserCoupon是"实例"，用户实际持有的券（如"张三领取的那张券"）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCoupon implements Serializable {

    private static final long serialVersionUID = 1L;

    // 主键ID，自增
    private Long id;

    // 用户ID，关联user表的id
    private Long userId;

    // 优惠券模板ID，关联coupon表的id
    private Long couponId;

    // 有效期开始时间（用户领取时确定）
    private LocalDateTime termBeginTime;

    // 有效期结束时间（用户领取时确定，过期后不可用）
    private LocalDateTime termEndTime;

    // 使用时间（核销时间），null表示未使用
    private LocalDateTime usedTime;

    // 状态：1-未使用 2-已使用 3-已过期 4-已锁定（下单但未支付）
    private Integer status;

    // 锁定/核销该券的订单ID，null表示未关联订单（下单锁券、支付核销、取消解锁都靠它回查）
    private Long orderId;

    // 同一用户同一券的第几张（限领N张时区分份数），与 (user_id, coupon_id, copy_no) 唯一索引配套
    private Integer copyNo;

    // 记录创建时间（领取时间）
    private LocalDateTime createTime;

    // 记录更新时间
    private LocalDateTime updateTime;
}
