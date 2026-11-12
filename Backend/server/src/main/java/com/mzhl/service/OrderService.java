package com.mzhl.service;

import com.mzhl.dto.*;
import com.mzhl.result.PageResult;
import com.mzhl.vo.OrderPaymentVO;
import com.mzhl.vo.OrderStatisticsVO;
import com.mzhl.vo.OrderSubmitVO;
import com.mzhl.vo.OrderVO;

public interface OrderService {


    /**
     * 用户下单
     * @param ordersSubmitDTO
     * @return
     */
    OrderSubmitVO submitOrder(OrdersSubmitDTO ordersSubmitDTO);

    /**
     * 订单支付
     * @param ordersPaymentDTO
     * @return
     */
    OrderPaymentVO payment(OrdersPaymentDTO ordersPaymentDTO) throws Exception;

    /**
     * 支付成功，修改订单状态
     * @param outTradeNo
     */
    void paySuccess(String outTradeNo);

    /**
     * 支付成功，修改订单状态（带微信回调金额校验）
     * @param outTradeNo 商户订单号
     * @param callbackTotalFen 微信回调金额（单位：分）
     */
    void paySuccessWithAmountCheck(String outTradeNo, Integer callbackTotalFen);

    /**
     * 用户端订单分页查询
     * @param page
     * @param pageSize
     * @param status
     * @return
     */
    PageResult pageQuery4User(int page, int pageSize, Integer status);

    /**
     * 查询订单详情（管理端：可查看全部订单）
     * @param id
     * @return
     */
    OrderVO details(Long id);

    /**
     * 用户端查询订单详情：身份从 Token 取并校验订单归属，他人订单按不存在处理
     * @param id
     * @return
     */
    OrderVO details4User(Long id);

    /**
     * 用户取消订单
     * @param id
     */
    void userCancelById(Long id) throws Exception;

    /**
     * 再来一单
     *
     * @param id
     */
    void repetition(Long id);

    /**
     * 条件搜索订单
     * @param ordersPageQueryDTO
     * @return
     */
    PageResult conditionSearch(OrdersPageQueryDTO ordersPageQueryDTO);

    /**
     * 各个状态的订单数量统计
     * @return
     */
    OrderStatisticsVO statistics();

    /**
     * 接单
     *
     * @param ordersConfirmDTO
     */
    void confirm(OrdersConfirmDTO ordersConfirmDTO);

    /**
     * 拒单
     *
     * @param ordersRejectionDTO
     */
    void rejection(OrdersRejectionDTO ordersRejectionDTO) throws Exception;

    /**
     * 商家取消订单
     *
     * @param ordersCancelDTO
     */
    void cancel(OrdersCancelDTO ordersCancelDTO) throws Exception;

    /**
     * 派送订单
     *
     * @param id
     */
    void delivery(Long id);

    /**
     * 完成订单
     *
     * @param id
     */
    void complete(Long id);

    /**
     * 提醒功能方法
     * 该方法用于处理与提醒相关的逻辑，接收一个Long类型的id参数
     * 目前方法体为空，具体实现待开发
     *
     * @param id 提醒对象的唯一标识符，用于确定需要提醒的具体目标
     */
    void reminder(Long id);

}