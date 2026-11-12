package com.mzhl.mapper;

import com.mzhl.entity.UserCoupon;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface UserCouponMapper {

    /**
     * 插入用户优惠券（领取优惠券）
     * @param userCoupon 需要插入的用户优惠券对象，包含用户ID、优惠券ID等信息
     */
    void insert(UserCoupon userCoupon);

    /**
     * 批量插入用户优惠券
     * @param userCouponList 需要插入的用户优惠券列表
     */
    void batchInsert(@Param("list") List<UserCoupon> userCouponList);

    /**
     * 更新用户优惠券状态
     * @param userCoupon 需要更新的用户优惠券对象，包含ID和需要更新的字段
     */
    void update(UserCoupon userCoupon);

    /**
     * 根据ID查询用户优惠券
     * @param id 用户优惠券ID
     * @return 返回对应ID的UserCoupon对象
     */
    @Select("select * from user_coupon where id = #{id}")
    UserCoupon findById(Long id);

    /**
     * 查询用户的优惠券列表
     * @param userId 用户ID
     * @param status 状态筛选（可选，null表示查询全部）
     * @return 返回该用户的优惠券列表
     */
    List<UserCoupon> findByUserId(@Param("userId") Long userId, @Param("status") Integer status);

    /**
     * 查询用户未使用的优惠券
     * @param userId 用户ID
     * @return 返回该用户未使用的优惠券列表
     */
    List<UserCoupon> findUnusedByUserId(Long userId);

    /**
     * 统计用户当前持有的某优惠券数量（未使用1+锁定中4，已使用2不计——持有上限语义，用完可再领）
     * @param userId 用户ID
     * @param couponId 优惠券模板ID
     * @return 返回当前持有数量
     */
    @Select("select count(*) from user_coupon where user_id = #{userId} and coupon_id = #{couponId} and status in (1, 4)")
    int countByUserAndCoupon(@Param("userId") Long userId, @Param("couponId") Long couponId);

    /**
     * 查询已过期的优惠券
     * @return 返回所有已过期的用户优惠券列表
     */
    List<UserCoupon> findExpiredCoupons();

    /**
     * 批量更新状态为已过期
     * @param ids 用户优惠券ID列表
     */
    void batchUpdateToExpired(@Param("ids") List<Long> ids);

    /**
     * 锁定优惠券（下单锁券，记录订单ID）
     * @param id 用户优惠券ID
     * @param orderId 订单ID
     * @return 影响行数，0表示券不处于未使用状态（幂等保护）
     */
    @Update("update user_coupon set status = 4, order_id = #{orderId}, update_time = now() " +
            "where id = #{id} and status = 1")
    int lockCoupon(@Param("id") Long id, @Param("orderId") Long orderId);

    /**
     * 解锁优惠券
     * @param id 用户优惠券ID
     */
    @Update("update user_coupon set status = 1, update_time = now() where id = #{id} and status = 4")
    void unlockCoupon(Long id);

    /**
     * 按订单解锁券（取消订单时释放）
     * @param orderId 订单ID
     * @return 影响行数
     */
    @Update("update user_coupon set status = 1, order_id = null, update_time = now() " +
            "where order_id = #{orderId} and status = 4")
    int unlockByOrderId(@Param("orderId") Long orderId);

    /**
     * 按订单核销券（支付成功时锁定转已使用）
     * @param orderId 订单ID
     * @return 影响行数
     */
    @Update("update user_coupon set status = 2, used_time = now(), update_time = now() " +
            "where order_id = #{orderId} and status = 4")
    int useByOrderId(@Param("orderId") Long orderId);

    /**
     * 查询订单关联的券（用于核销/解锁后回查couponId更新模板统计）
     * @param orderId 订单ID
     * @param status 券状态
     */
    @Select("select * from user_coupon where order_id = #{orderId} and status = #{status}")
    List<UserCoupon> findByOrderId(@Param("orderId") Long orderId, @Param("status") Integer status);

    /**
     * 查询超时未支付的锁定券（status=4且锁定超过指定分钟数）
     * @param timeoutMinutes 锁定超时分钟数
     */
    @Select("select * from user_coupon where status = 4 " +
            "and update_time < date_sub(now(), interval #{timeoutMinutes} minute)")
    List<UserCoupon> findTimeoutLocked(@Param("timeoutMinutes") int timeoutMinutes);
}
