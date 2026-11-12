package com.mzhl.service;

import com.mzhl.dto.CouponDTO;
import com.mzhl.dto.CouponPageQueryDTO;
import com.mzhl.result.PageResult;
import com.mzhl.vo.CouponVO;

import java.util.List;

public interface CouponService {

    /**
     * 创建优惠券
     * @param couponDTO 优惠券数据传输对象，包含优惠券的基本信息
     */
    void createCoupon(CouponDTO couponDTO);

    /**
     * 发布优惠券
     * @param id 优惠券ID
     */
    void publishCoupon(Long id);

    /**
     * 停止优惠券
     * @param id 优惠券ID
     */
    void stopCoupon(Long id);

    /**
     * 分页查询优惠券
     * @param queryDTO 分页查询条件，包含页码、每页大小、查询条件等
     * @return 返回优惠券分页结果
     */
    PageResult pageQuery(CouponPageQueryDTO queryDTO);

    /**
     * 根据ID查询优惠券详情
     * @param id 优惠券ID
     * @return 返回优惠券视图对象
     */
    CouponVO getById(Long id);

    /**
     * 删除优惠券
     * @param id 优惠券ID
     */
    void deleteCoupon(Long id);

    /**
     * 批量删除优惠券
     * @param ids 优惠券ID列表
     */
    void deleteBatch(List<Long> ids);

    /**
     * 修改优惠券
     * @param couponDTO 优惠券数据传输对象，包含优惠券的修改信息
     */
    void updateCoupon(CouponDTO couponDTO);
}