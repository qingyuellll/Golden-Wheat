package com.mzhl.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 优惠券分页查询DTO
 * 作用：封装分页查询条件
 */
@Data
public class CouponPageQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    // 优惠券名称（模糊查询）
    private String name;

    // 优惠券状态：1-进行中 2-已停止
    private Integer status;

    // 当前页码（从1开始）
    private Integer page;

    // 每页条数
    private Integer pageSize;
}