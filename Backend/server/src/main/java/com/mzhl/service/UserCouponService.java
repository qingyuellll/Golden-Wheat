package com.mzhl.service;

import com.mzhl.dto.CouponCalculateDTO;
import com.mzhl.vo.AvailableCouponVO;
import com.mzhl.vo.CouponPreviewVO;
import com.mzhl.vo.CouponVO;
import com.mzhl.vo.OptimalCouponVO;
import com.mzhl.vo.UserCouponVO;

import java.math.BigDecimal;
import java.util.List;

/**
 * 用户优惠券服务接口
 */
public interface UserCouponService {

    /**
     * 领取优惠券
     */
    void receiveCoupon(Long couponId, Long userId);

    /**
     * 通过兑换码领取优惠券
     */
    void receiveCouponByCode(String code, Long userId);

    /**
     * 查询可领取的优惠券列表
     */
    List<CouponVO> getAvailableCoupons();

    /**
     * 查询我的优惠券
     */
    List<UserCouponVO> getMyCoupons(Long userId, Integer status);

    /**
     * 计算订单可用优惠券
     */
    List<AvailableCouponVO> calculateAvailableCoupons(CouponCalculateDTO calculateDTO);

    /**
     * 优惠券组合试算：与下单锁定（lockCouponsForOrder）同一核销口径，
     * 供结算页在用户勾选任意组合时实时预览精确优惠（不落库）。
     * 归属/状态/过期校验与锁定逻辑一致，券不可用时直接抛错。
     */
    CouponPreviewVO previewCombination(CouponCalculateDTO calculateDTO);

    /**
     * 查找最优优惠券组合
     */
    OptimalCouponVO findOptimalCoupons(CouponCalculateDTO calculateDTO);

    /**
     * 使用优惠券
     */
    void useCoupon(Long userCouponId, Long orderId, BigDecimal discountAmount);

    /**
     * 下单锁券：服务端校验券归属/状态/有效期并按策略重算优惠金额，逐张锁定并关联订单
     * @param userId 用户ID
     * @param userCouponIds 选中的用户券ID列表
     * @param orderId 订单ID
     * @param orderAmount 订单小计（服务端计算）
     * @return 服务端重算的总优惠金额
     */
    BigDecimal lockCouponsForOrder(Long userId, List<Long> userCouponIds, Long orderId, BigDecimal orderAmount);

    /**
     * 按订单解锁券（取消订单时调用）
     * @return 解锁张数
     */
    int unlockCouponsByOrder(Long orderId);

    /**
     * 按订单核销券（支付成功时调用，锁定转已使用）
     */
    void useCouponsByOrder(Long orderId);

    /**
     * 解锁超时的锁定券（定时任务调用，防止下单未支付/未取消导致券被永久锁住）
     * @param timeoutMinutes 锁定超时分钟数
     * @return 解锁张数
     */
    int unlockTimeoutCoupons(int timeoutMinutes);

    /**
     * 解锁优惠券
     */
    void unlockCoupon(Long userCouponId);

    /**
     * 标记过期优惠券
     */
    void expireCoupons();
}