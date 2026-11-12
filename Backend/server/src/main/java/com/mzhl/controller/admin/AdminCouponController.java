package com.mzhl.controller.admin;

import com.mzhl.dto.CouponDTO;
import com.mzhl.dto.CouponPageQueryDTO;
import com.mzhl.result.PageResult;
import com.mzhl.result.Result;
import com.mzhl.service.CouponService;
import com.mzhl.vo.CouponVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/coupon")
@Tag(name = "优惠券管理")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;

    @PostMapping
    @Operation(summary = "创建优惠券")
    public Result<Void> createCoupon(@RequestBody CouponDTO couponDTO) {
        log.info("创建优惠券，优惠券数据：{}", couponDTO);
        couponService.createCoupon(couponDTO);
        return Result.success();
    }

    @PutMapping("/publish/{id}")
    @Operation(summary = "发布优惠券")
    public Result<Void> publishCoupon(@PathVariable Long id) {
        log.info("发布优惠券，优惠券ID：{}", id);
        couponService.publishCoupon(id);
        return Result.success();
    }

    @PutMapping("/stop/{id}")
    @Operation(summary = "停止优惠券")
    public Result<Void> stopCoupon(@PathVariable Long id) {
        log.info("停止优惠券，优惠券ID：{}", id);
        couponService.stopCoupon(id);
        return Result.success();
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询优惠券")
    public Result<PageResult> pageQuery(CouponPageQueryDTO queryDTO) {
        log.info("分页查询优惠券，查询条件：{}", queryDTO);
        PageResult pageResult = couponService.pageQuery(queryDTO);
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    @Operation(summary = "查询优惠券详情")
    public Result<CouponVO> getById(@PathVariable Long id) {
        log.info("查询优惠券详情，优惠券ID：{}", id);
        CouponVO couponVO = couponService.getById(id);
        return Result.success(couponVO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除优惠券")
    public Result<Void> deleteCoupon(@PathVariable Long id) {
        log.info("删除优惠券，优惠券ID：{}", id);
        couponService.deleteCoupon(id);
        return Result.success();
    }

    @DeleteMapping("/batch")
    @Operation(summary = "批量删除优惠券")
    public Result<Void> deleteBatch(@RequestParam List<Long> ids) {
        log.info("批量删除优惠券，优惠券ID列表：{}", ids);
        couponService.deleteBatch(ids);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改优惠券")
    public Result<Void> updateCoupon(@RequestBody CouponDTO couponDTO) {
        log.info("修改优惠券，优惠券数据：{}", couponDTO);
        couponService.updateCoupon(couponDTO);
        return Result.success();
    }
}