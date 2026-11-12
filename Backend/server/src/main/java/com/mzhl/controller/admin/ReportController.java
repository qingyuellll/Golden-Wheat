package com.mzhl.controller.admin;

import com.mzhl.result.Result;
import com.mzhl.service.ReportService;
import com.mzhl.vo.OrderReportVO;
import com.mzhl.vo.SalesTop10ReportVO;
import com.mzhl.vo.TurnoverReportVO;
import com.mzhl.vo.UserReportVO;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * 报表控制器类
 * 用于处理与报表相关的请求和业务逻辑
 */
@RestController
@RequestMapping("/admin/report")
@Tag(name = "报表管理")
@Slf4j
public class ReportController {
    @Autowired
    private ReportService reportService;

    /**
     * 营业额统计接口
     * @param begin 开始日期，格式为yyyy-MM-dd
     * @param end 结束日期，格式为yyyy-MM-dd
     * @return 返回指定日期范围内的营业额统计报表数据
     */
    @GetMapping("/turnoverStatistics")
    @Operation(summary = "营业额统计")
    public Result<TurnoverReportVO> turnoverStatistics(    // 方法返回类型为Result<TurnoverReportVO>，表示统一响应结果
            @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate begin,  // 请求参数，开始日期，格式为yyyy-MM-dd
            @DateTimeFormat(pattern = "yyyy-MM-dd")LocalDate end) {   // 请求参数，结束日期，格式为yyyy-MM-dd
        log.info("根据日期获取营业额报表,{},{}", begin, end);    // 日志记录，记录接口调用信息


    // 调用营业额报表服务方法获取数据，并封装为统一响应结果返回
        return Result.success(reportService.getTurnoverStatistics(begin, end));
    }

    /**
     * 用户统计接口
     * @GetMapping 映射HTTP GET请求到/userStatistics路径
     * @ApiOperation 接口描述，用于API文档生成，描述为"用户统计"
     * @return 返回类型为Result<UserReportVO>，Result为统一响应结果封装，UserReportVO为用户统计数据视图对象
     *
     * @param begin 请求参数，开始日期，使用@DateTimeFormat注解指定日期格式为yyyy-MM-dd
     * @param end 请求参数，结束日期，使用@DateTimeFormat注解指定日期格式为yyyy-MM-dd
     *
     * 注意：当前方法返回null，实际实现中应返回用户统计数据
     */
    @GetMapping("/userStatistics")
    @Operation(summary = "用户统计")
    public Result<UserReportVO> userStatistics(
            @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate begin,  // 请求参数，开始日期，格式为yyyy-MM-dd
            @DateTimeFormat(pattern = "yyyy-MM-dd")LocalDate end) {
        log.info("根据日期获取用户报表,{},{}", begin, end);    // 日志记录，记录接口调用信息

        return Result.success(reportService.getUserStatistics(begin, end));
    }

    /**
     * 获取订单统计报表的接口方法
     * @param begin 开始日期，格式为yyyy-MM-dd
     * @param end 结束日期，格式为yyyy-MM-dd
     * @return 返回包含用户统计报表数据的Result对象
     */
    @GetMapping("/ordersStatistics")    // HTTP GET请求映射，路径为/ordersStatistics
    @Operation(summary = "订单统计")    // Swagger API文档注解，说明接口功能为"订单统计"
    public Result<OrderReportVO> ordersStatistics(
            @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate begin,  // 请求参数，开始日期，格式为yyyy-MM-dd
            @DateTimeFormat(pattern = "yyyy-MM-dd")LocalDate end) {
        log.info("根据日期获取订单报表,{},{}", begin, end);    // 日志记录，记录接口调用信息

        return Result.success(reportService.getOrderStatistics(begin, end));
    }

/**
 * 销售排行榜TOP10接口
 * 用于获取指定日期范围内的销售排行榜前10名数据
 *
 * @param begin 开始日期，格式为yyyy-MM-dd
 * @param end 结束日期，格式为yyyy-MM-dd
 * @return 返回销售排行榜TOP10数据，封装在Result中
 */
    @GetMapping("/top10")    // HTTP GET请求映射，路径为/top10
    @Operation(summary = "top10")    // Swagger API文档注解，说明接口功能为"top10"
    public Result<SalesTop10ReportVO> top10(
            @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate begin,  // 请求参数，开始日期，格式为yyyy-MM-dd
            @DateTimeFormat(pattern = "yyyy-MM-dd")LocalDate end) {
        log.info("根据日期获取top10报表,{},{}", begin, end);    // 日志记录，记录接口调用信息

        return Result.success(reportService.getSalesTop10(begin, end));
    }

    /**
     * 导出报表接口
     * @param response HTTP响应对象，用于输出导出文件
     */
    @GetMapping("/export")    // HTTP GET请求映射，访问路径为/export
    @Operation(summary = "导出报表")  // Swagger接口文档注释，说明接口功能为导出报表
    public void export(HttpServletResponse response){  // 导出报表方法，接收HTTP响应对象作为参数
        reportService.exportBusinessData(response);
    }


}
