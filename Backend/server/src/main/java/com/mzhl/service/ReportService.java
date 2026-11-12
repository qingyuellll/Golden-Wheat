package com.mzhl.service;

import com.mzhl.entity.User;
import com.mzhl.vo.BusinessDataVO;
import com.mzhl.vo.OrderReportVO;
import com.mzhl.vo.SalesTop10ReportVO;
import com.mzhl.vo.TurnoverReportVO;
import com.mzhl.vo.UserReportVO;

import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDate;

public interface ReportService {

    /**
     * 获取指定时间段内的营业统计数据
     *
     * @param begin 统计开始日期，包含该日期
     * @param end 统计结束日期，包含该日期
     * @return TurnoverReportVO 包含营业统计数据的值对象，涵盖指定时间段内的营业统计信息
     */
    TurnoverReportVO getTurnoverStatistics(LocalDate begin, LocalDate end);

    /**
     * 获取用户统计数据的方法
     *
     * @param begin 统计开始日期，包含此日期
     * @param end 统计结束日期，包含此日期
     * @return 返回用户统计数据报告对象(UserReportVO)，包含指定时间段内的用户统计信息
     */
    UserReportVO getUserStatistics(LocalDate begin, LocalDate end);

    /**
     * 获取指定时间范围内的订单统计数据
     *
     * @param begin 开始日期，包含该日期
     * @param end 结束日期，包含该日期
     * @return 返回UserReportVO对象，包含订单统计数据
     */
    OrderReportVO getOrderStatistics(LocalDate begin, LocalDate end);

/**
 * 获取指定时间范围内的销售排行榜前10名数据
 *
 * @param begin 开始日期，包含该日期
 * @param end 结束日期，包含该日期
 * @return SalesTop10ReportVO 包含销售排行榜前10名的数据对象
 */
    SalesTop10ReportVO getSalesTop10(LocalDate begin, LocalDate end);

    /**
     * 导出业务数据的方法
     * @param response HTTP响应对象，用于将导出的数据写入响应流中
     */
    void exportBusinessData(HttpServletResponse response);

    /**
     * 获取数据概览
     * @param begin 开始日期
     * @param end 结束日期
     * @return 数据概览VO
     */
    BusinessDataVO getDataOverView(LocalDate begin, LocalDate end);

}
