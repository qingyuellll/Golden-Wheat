package com.mzhl.task;

import com.mzhl.entity.Orders;
import com.mzhl.mapper.OrderMapper;
import com.mzhl.service.UserCouponService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
public class OrderTask {
    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private UserCouponService userCouponService;

    /**
     * 处理超时订单的方法
     * 该方法用于检查和处理系统中已经超时的订单，可能包括取消订单、释放库存等操作
     */
    @Scheduled(cron = "0 * * * * ?")
    public  void processTimeoutOrder(){
        log.info("定时任务执行：处理超时订单，当前时间：{}", LocalDateTime.now());
        LocalDateTime time = LocalDateTime.now().minusMinutes(15);

        List<Orders> ordersList = orderMapper.getByStatusAndOrderTimeLT(Orders.PENDING_PAYMENT,time);

       if (ordersList != null && ordersList.size()>0) {
           for (Orders orders : ordersList) {
               //状态守卫：仅当订单仍是待付款才取消。
               //查询与更新之间用户可能已支付成功，无守卫会把已支付订单覆盖成已取消
               int rows = orderMapper.updateStatusGuarded(
                       orders.getId(), Orders.PENDING_PAYMENT, Orders.CANCELLED,
                       "超时未支付", LocalDateTime.now());

               //只有真正取消成功才解锁优惠券，避免误释放已支付订单的锁
               if (rows > 0) {
                   // 超时取消，解锁下单时锁定的优惠券
                   userCouponService.unlockCouponsByOrder(orders.getId());
               }
           }
       }

    }

    /**
     * 定时任务方法，用于处理配送订单
     * 使用@Scheduled注解实现定时执行，cron表达式设置为"0 0 1 * * ?"
     * 表示每天凌晨1点执行一次
     *
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void processDeliveryOrder(){
        log.info("定时任务执行：处理配送订单，当前时间：{}", LocalDateTime.now());
        // 调用OrderMapper中的方法查询待配送的订单
        LocalDateTime time = LocalDateTime.now().minusMinutes(60);
        List<Orders> ordersList = orderMapper.getByStatusAndOrderTimeLT(Orders.DELIVERY_IN_PROGRESS,time);
        if (ordersList != null && ordersList.size()>0) {
            for (Orders orders : ordersList) {
                //状态守卫：仅当订单仍是配送中才置为完成；
                //完成订单不应写取消原因/取消时间（原实现误赋了"超时未支付"）
                orderMapper.updateStatusGuarded(
                        orders.getId(), Orders.DELIVERY_IN_PROGRESS, Orders.COMPLETED,
                        null, null);
            }
        }


    }


}
