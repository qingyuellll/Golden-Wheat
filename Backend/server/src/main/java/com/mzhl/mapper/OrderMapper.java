package com.mzhl.mapper;

import com.github.pagehelper.Page;
import com.mzhl.dto.GoodsSalesDTO;
import com.mzhl.dto.OrdersPageQueryDTO;
import com.mzhl.entity.Orders;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface OrderMapper {
    /**
     * 插入订单数据
     *
     * @param order
     */
    void insert(Orders order);

    /**
     * 根据订单号查询订单
     *
     * @param orderNumber
     */
    @Select("select * from orders where number = #{orderNumber}")
    Orders getByNumber(String orderNumber);

    /**
     * 修改订单信息
     *
     * @param orders
     */
    void update(Orders orders);

    /**
     * 支付成功推进订单状态，带幂等守卫（status = 1 即待付款）：
     * 微信回调 24h 内最多重推 8 次，重复回调因状态已不是待付款而影响行数为 0，
     * 调用方据此识别"已处理过"，避免重复核销优惠券/重复推送
     */
    @Update("update orders set status = #{status}, pay_status = #{payStatus}, " +
            "checkout_time = #{checkoutTime}, update_time = now() " +
            "where id = #{id} and status = 1") // 1 = 待付款 Orders.PENDING_PAYMENT
    int updateToPaid(Orders orders);

    /**
     * 下单后回写服务端核算的应付金额与打包费。
     * 不走通用 update：Orders.packAmount 是原始类型 int，@Builder 默认 0，
     * 通用 update 的 <if test="packAmount != null"> 对原始类型恒为真，会把打包费误覆盖成 0
     */
    @Update("update orders set amount = #{amount}, pack_amount = #{packAmount}, update_time = now() " +
            "where id = #{id}")
    int updateOrderAmount(@Param("id") Long id,
                          @Param("amount") java.math.BigDecimal amount,
                          @Param("packAmount") int packAmount);

    /**
     * 带状态守卫的订单状态流转：仅当当前状态等于 fromStatus 时才推进。
     * 定时任务（超时取消/自动完成）与用户并发操作之间存在竞态，
     * 查询后直接 update 会把刚支付/刚取消的订单覆盖掉，必须在 SQL 层加状态守卫
     *
     * @param id           订单id
     * @param fromStatus   期望的当前状态
     * @param targetStatus 目标状态
     * @param cancelReason 取消原因（非取消场景传 null）
     * @param cancelTime   取消时间（非取消场景传 null）
     * @return 影响行数，0 表示状态已变化（他人先处理），调用方应跳过后续联动
     */
    @Update("update orders set status = #{targetStatus}, " +
            "cancel_reason = #{cancelReason}, cancel_time = #{cancelTime}, update_time = now() " +
            "where id = #{id} and status = #{fromStatus}")
    int updateStatusGuarded(@Param("id") Long id,
                            @Param("fromStatus") Integer fromStatus,
                            @Param("targetStatus") Integer targetStatus,
                            @Param("cancelReason") String cancelReason,
                            @Param("cancelTime") LocalDateTime cancelTime);

    /**
     * 分页条件查询并按下单时间排序
     * @param ordersPageQueryDTO
     */
    Page<Orders> pageQuery(OrdersPageQueryDTO ordersPageQueryDTO);

    /**
     * 根据id查询订单
     * @param id
     */
    @Select("select * from orders where id=#{id}")
    Orders getById(Long id);

    /**
     * 根据状态统计订单数量
     * @param status
     */
    @Select("select count(id) from orders where status = #{status}")
    Integer countStatus(Integer status);

    /**
     * 根据订单状态和下单时间查询订单列表
     * @param status 订单状态
     * @param orderTime 下单时间，查询下单时间早于该时间的订单
     * @return 返回符合条件的订单列表
     */
    @Select("select * from orders where status = #{status} and order_time < #{orderTime}")
    List<Orders> getByStatusAndOrderTimeLT(Integer status, LocalDateTime orderTime); // 使用MyBatis的@Select注解执行SQL查询

    /**
     * 通过Map计算数值总和的方法
     * 该方法接收一个Map参数，其中应包含数值类型的键值对
     *
     * @param map 包含数值数据的Map集合，键和值都应该是可转换为数值的类型
     * @return 返回Map中所有值的总和，以Double类型返回
     */
    Double sumByMap(Map map);

    /**
     * 通过Map集合计算相关数量
     * @param map 需要计算的Map集合
     * @return 返回计算后的数量结果
     */
    Integer countByMap(Map map);

    /**
     * 获取指定时间范围内的销售排行榜数据
     *
     * @param begin 查询开始时间，包含该时间点
     * @param end 查询结束时间，包含该时间点
     * @return 返回商品销售数据传输对象列表，按销量从高到低排序
     *         每个GoodsSalesDTO对象包含商品ID、商品名称和销售数量等信息
     */
    List<GoodsSalesDTO> getSalesTop10(LocalDateTime begin, LocalDateTime end);
}