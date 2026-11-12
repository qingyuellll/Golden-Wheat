package com.mzhl.mapper;

import com.mzhl.entity.CouponScope;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CouponScopeMapper {

    /**
     * 批量插入适用范围
     * @param scopeList 需要插入的适用范围列表
     */
    void batchInsert(@Param("list") List<CouponScope> scopeList);

    /**
     * 根据优惠券ID查询适用范围
     * @param couponId 优惠券ID
     * @return 返回该优惠券的适用范围列表
     */
    List<CouponScope> findByCouponId(Long couponId);

    /**
     * 删除优惠券的适用范围
     * @param couponId 优惠券ID
     */
    @Delete("delete from coupon_scope where coupon_id = #{couponId}")
    void deleteByCouponId(Long couponId);
}
