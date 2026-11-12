package com.mzhl.service.impl;


import com.mzhl.dto.GoodsSalesDTO;
import com.mzhl.entity.Orders;
import com.mzhl.mapper.OrderMapper;
import com.mzhl.mapper.UserMapper;
import com.mzhl.service.ReportService;
import com.mzhl.service.WorkspaceService;
import com.mzhl.vo.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.apache.commons.lang3.StringUtils;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ReportServiceImpl implements ReportService{
    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private WorkspaceService workspaceService;

    /**
     * 获取指定时间范围内的营业额统计信息
     * @param begin 统计开始日期，包含该日期
     * @param end 统计结束日期，包含该日期
     * @return TurnoverReportVO 包含指定时间范围内营业额统计信息的数据对象，当前实现返回null
     */
        public TurnoverReportVO getTurnoverStatistics(LocalDate begin, LocalDate end) {
        List<LocalDate> dateList = new ArrayList<>();
        dateList.add(begin);
        while (!begin.equals(end)) {
            begin = begin.plusDays(1);
            dateList.add(begin);
        }
        //存放每天的营业额
        List<Double> turnoverList = new ArrayList<>();
        for (LocalDate date : dateList) {
            //查询营业额数据
            LocalDateTime beginTime = LocalDateTime.of(date, LocalTime.MIN);
            LocalDateTime endTime = LocalDateTime.of(date, LocalTime.MAX);
            //select sum(amount) from orders where order_time >= begin and order_time < end and status = 5
            Map map = new HashMap<>();
            map.put("begin", beginTime);
            map.put("end", endTime);
            map.put("status", Orders.COMPLETED);
            Double turnover = orderMapper.sumByMap(map);
            turnover = turnover == null ? 0.0 : turnover;
            turnoverList.add(turnover);
        }

        //将日期和营业额拼接成字符串

        return TurnoverReportVO
                .builder()
                .dateList(StringUtils.join(dateList, ","))
                .turnoverList(StringUtils.join(turnoverList, ","))
                .build();
    }


    public UserReportVO getUserStatistics(LocalDate begin, LocalDate end) {
            //存放从begin到end的每天对应的日期
            List<LocalDate> dateList = new ArrayList<>();
            dateList.add(begin);
            while (!begin.equals(end)) {
                begin = begin.plusDays(1);
                dateList.add(begin);
            }


            //存放从begin到end的每天对应的新用户数
            List<Integer> newUserList = new ArrayList<>();
            //存放从begin到end的每天对应的总用户数
            List<Integer> totalUserList = new ArrayList<>();
            for (LocalDate date : dateList) {
                LocalDateTime beginTime = LocalDateTime.of(date, LocalTime.MIN);
                LocalDateTime endTime = LocalDateTime.of(date, LocalTime.MAX);

                Map map = new HashMap<>();

                map.put("end", endTime);
                //总用户数量
                Integer totalUser = userMapper.countByMap(map);

                map.put("begin", beginTime);
                //新用户数量
                Integer newUser = userMapper.countByMap(map);

                totalUserList.add(totalUser);
                newUserList.add(newUser);
            }

        return UserReportVO
                .builder()
                .dateList(StringUtils.join(dateList, ","))
                .newUserList(StringUtils.join(newUserList, ","))
                .totalUserList(StringUtils.join(totalUserList, ","))
                .build();
    }


    /**
     * 获取指定时间范围内的订单统计信息
     * @param begin 开始日期
     * @param end 结束日期
     * @return 返回包含日期列表、订单数量列表、有效订单数量列表、总订单数、有效订单数和订单完成率的OrderReportVO对象
     */
    public OrderReportVO getOrderStatistics(LocalDate begin, LocalDate end) {
        //存放从begin到end的每天对应的日期列表
        List<LocalDate> dateList = new ArrayList<>();
        dateList.add(begin);
        while (!begin.equals(end)) {
            begin = begin.plusDays(1);
            dateList.add(begin);
        }
        List<Integer> orderCountList = new ArrayList<>();
        List<Integer> validOrderCountList = new ArrayList<>();

        //存放从begin到end的每天对应的订单数
        for (LocalDate date : dateList) {
            //查询每天订单数据
            LocalDateTime beginTime = LocalDateTime.of(date, LocalTime.MIN);
            LocalDateTime endTime = LocalDateTime.of(date, LocalTime.MAX);
            Integer orderCount = getOrderCount(beginTime, endTime, null);

            Integer validOrderCount = getOrderCount(beginTime, endTime, Orders.COMPLETED);

            orderCountList.add(orderCount);
            validOrderCountList.add(validOrderCount);
        }
        Integer totalOrderCount = orderCountList.stream().reduce(Integer::sum).get();
        Integer validOrderCount = validOrderCountList.stream().reduce(Integer::sum).get();
        Double orderCompletionRate = 0.0;
        if (totalOrderCount != 0) {
            orderCompletionRate = validOrderCount.doubleValue() / totalOrderCount;
        }
        return OrderReportVO.builder()
                .dateList(StringUtils.join(dateList, ","))
                .orderCountList(StringUtils.join(orderCountList, ","))
                .validOrderCountList(StringUtils.join(validOrderCountList, ","))
                .totalOrderCount(totalOrderCount)
                .validOrderCount(validOrderCount)
                .orderCompletionRate(orderCompletionRate)
                .build();

    }


    public SalesTop10ReportVO getSalesTop10(LocalDate begin, LocalDate end) {
        LocalDateTime beginTime = LocalDateTime.of(begin, LocalTime.MIN);
        LocalDateTime endTime = LocalDateTime.of(end, LocalTime.MAX);

        List<GoodsSalesDTO> salesTop10 = orderMapper.getSalesTop10(beginTime, endTime);
        List<String> names = salesTop10.stream().map(GoodsSalesDTO::getName).collect(Collectors.toList());
        String nameList = StringUtils.join(names, ",");

        List<Integer> numbers = salesTop10.stream().map(GoodsSalesDTO::getNumber).collect(Collectors.toList());
        String numberList = StringUtils.join(numbers, ",");

        return SalesTop10ReportVO.builder()
                .nameList(nameList)
                .numberList(numberList)
                .build();


    }

    public void exportBusinessData(HttpServletResponse response) {
        //获取业务数据
        LocalDate dateBegin = LocalDate.now().minusDays(30);
        LocalDate dateEnd = LocalDate.now().minusDays(1);

        LocalDateTime begin = LocalDateTime.of(dateBegin, LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(dateEnd, LocalTime.MAX);

        BusinessDataVO businessDataVO =workspaceService.getBusinessData(begin, end);

        //将数据写入
        InputStream in = this.getClass().getClassLoader().getResourceAsStream("templates/运营数据报表模板.xlsx");
        try {
            XSSFWorkbook excel = new XSSFWorkbook(in);

            //填充 数据
           XSSFSheet sheet = excel.getSheet("Sheet1");
           sheet.getRow(1).getCell(1).setCellValue("时间:"+dateBegin+"至"+dateEnd);

           XSSFRow row = sheet.getRow(3);
            row.getCell(2).setCellValue(businessDataVO.getTurnover());
            row.getCell(4).setCellValue(businessDataVO.getValidOrderCount());
            row.getCell(6).setCellValue(businessDataVO.getNewUsers());

            row = sheet.getRow(4);
            row.getCell(2).setCellValue(businessDataVO.getValidOrderCount());
            row.getCell(4).setCellValue(businessDataVO.getUnitPrice());

            for(int i=0;i<30;i++){
                LocalDate date = dateBegin.plusDays(i);
                BusinessDataVO businessData = workspaceService.getBusinessData(LocalDateTime.of(date, LocalTime.MIN), LocalDateTime.of(date, LocalTime.MAX));
                row=sheet.getRow(7+i);
                row.getCell(1).setCellValue(date.toString());
                row.getCell(2).setCellValue(businessData.getTurnover());
                row.getCell(3).setCellValue(businessData.getValidOrderCount());
                row.getCell(4).setCellValue(businessData.getOrderCompletionRate());
                row.getCell(5).setCellValue(businessData.getUnitPrice());
                row.getCell(6).setCellValue(businessData.getNewUsers());
            }

            ServletOutputStream out = response.getOutputStream();
            excel.write(out);

            out.close();
            excel.close();
        } catch (Exception e) {
            e.printStackTrace();
        }



        //通过输出流将数据写入到浏览器，完成文件下载


    }

    private Integer getOrderCount(LocalDateTime begin, LocalDateTime end,Integer status) {
            Map map = new HashMap<>();
            map.put("begin", begin);
            map.put("end", end);
            map.put("status", status);
            return orderMapper.countByMap(map);

    }
        /**
     * 获取数据概览
     * @param begin 开始日期
     * @param end 结束日期
     * @return 数据概览VO
     */
    @Override
    public BusinessDataVO getDataOverView(LocalDate begin, LocalDate end) {
        LocalDateTime beginTime = LocalDateTime.of(begin, LocalTime.MIN);
        LocalDateTime endTime = LocalDateTime.of(end, LocalTime.MAX);
        return workspaceService.getBusinessData(beginTime, endTime);
    }


}