package com.mzhl.controller.user;

import com.mzhl.dto.CouponCalculateDTO;
import com.mzhl.result.Result;
import com.mzhl.service.UserCouponService;
import com.mzhl.vo.AvailableCouponVO;
import com.mzhl.vo.CouponPreviewVO;
import com.mzhl.vo.CouponVO;
import com.mzhl.vo.OptimalCouponVO;
import com.mzhl.vo.UserCouponVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户端 - 优惠券Controller
 */
@Slf4j
@RestController
@RequestMapping("/user/coupon")
@Tag(name = "用户端优惠券接口")
public class UserCouponController {

    @Autowired
    private UserCouponService userCouponService;

    /**
     * 领取优惠券（主动领取）
     */
    @PostMapping("/receive/{couponId}")
    @Operation(summary = "领取优惠券")
    public Result<Void> receiveCoupon(@PathVariable Long couponId) {
        Long userId = getCurrentUserId();
        log.info("用户领取优惠券 - userId: {}, couponId: {}", userId, couponId);
        userCouponService.receiveCoupon(couponId, userId);
        return Result.success();
    }

    /**
     * 通过兑换码领取优惠券
     */
    @PostMapping("/exchange/{code}")
    @Operation(summary = "兑换码领取优惠券")
    public Result<Void> exchangeCoupon(@PathVariable String code) {
        Long userId = getCurrentUserId();
        log.info("用户兑换优惠券 - userId: {}, code: {}", userId, code);
        userCouponService.receiveCouponByCode(code, userId);
        return Result.success();
    }

    /**
     * 查询可领取的优惠券列表
     */
    @GetMapping("/available")
    @Operation(summary = "查询可领取的优惠券")
    public Result<List<CouponVO>> getAvailableCoupons() {
        log.info("查询可领取的优惠券");
        List<CouponVO> result = userCouponService.getAvailableCoupons();
        return Result.success(result);
    }

    /**
     * 查询我的优惠券
     * @param status 状态：1-未使用 2-已使用 3-已过期，不传则查询全部
     */
    @GetMapping("/my")
    @Operation(summary = "查询我的优惠券")
    public Result<List<UserCouponVO>> getMyCoupons(@RequestParam(required = false) Integer status) {
        Long userId = getCurrentUserId();
        log.info("查询我的优惠券 - userId: {}, status: {}", userId, status);
        List<UserCouponVO> result = userCouponService.getMyCoupons(userId, status);
        return Result.success(result);
    }

    /**
     * 计算订单可用优惠券
     */
    @PostMapping("/calculate")
    @Operation(summary = "计算订单可用优惠券")
    public Result<List<AvailableCouponVO>> calculateAvailableCoupons(@RequestBody CouponCalculateDTO calculateDTO) {
        Long userId = getCurrentUserId();
        calculateDTO.setUserId(userId);
        log.info("计算订单可用优惠券 - userId: {}", userId);
        List<AvailableCouponVO> result = userCouponService.calculateAvailableCoupons(calculateDTO);
        return Result.success(result);
    }

    /**
     * 优惠券组合试算：用户在结算页勾选任意组合时，实时预览与下单锁定完全同口径的精确优惠
     */
    @PostMapping("/preview")
    @Operation(summary = "优惠券组合试算")
    public Result<CouponPreviewVO> previewCombination(@RequestBody CouponCalculateDTO calculateDTO) {
        log.info("优惠券组合试算 - userId: {}, 勾选: {}", getCurrentUserId(), calculateDTO.getUserCouponIds());
        CouponPreviewVO result = userCouponService.previewCombination(calculateDTO);
        return Result.success(result);
    }

    /**
     * 查找最优优惠券组合（全排列 + CompletableFuture并行计算）
     */
    @PostMapping("/optimal")
    @Operation(summary = "查找最优优惠券组合")
    public Result<OptimalCouponVO> findOptimalCoupons(@RequestBody CouponCalculateDTO calculateDTO) {
        Long userId = getCurrentUserId();
        calculateDTO.setUserId(userId);
        log.info("查找最优优惠券组合 - userId: {}", userId);
        OptimalCouponVO result = userCouponService.findOptimalCoupons(calculateDTO);
        return Result.success(result);
    }

    /**
     * 获取当前登录用户ID
     * 从ThreadLocal中获取（BaseContext）
     */
    private Long getCurrentUserId() {
        return com.mzhl.context.BaseContext.getCurrentId();
    }
}