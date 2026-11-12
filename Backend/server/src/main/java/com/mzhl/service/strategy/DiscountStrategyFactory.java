package com.mzhl.service.strategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 优惠策略工厂
 * 作用：根据优惠类型返回对应的策略实现
 *
 * 设计模式：工厂模式（Factory Pattern）
 * - 目的：解耦策略的创建和使用
 * - 优点：
 *   1. 客户端不需要知道具体策略类的类名
 *   2. 新增策略时只需注册，无需修改工厂代码
 *
 * 工作原理：
 * 1. Spring启动时，自动注入所有DiscountStrategy实现类
 * 2. 工厂将它们注册到Map中（key=strategyType, value=strategy）
 * 3. 调用时根据type从Map中获取对应策略
 */
@Component // Spring组件，自动注册
public class DiscountStrategyFactory {

    /**
     * 策略注册表
     * key：策略类型（1-每满减 2-折扣 3-固定金额）
     * value：对应的策略实现对象
     *
     * 为什么用ConcurrentHashMap？
     * - 线程安全：支持并发读取
     * - 高性能：分段锁机制，比Hashtable快
     */
    private final Map<Integer, DiscountStrategy> strategyMap = new ConcurrentHashMap<>();

    /**
     * 构造函数注入所有策略实现
     *
     * @param strategies Spring自动注入的所有DiscountStrategy实现类
     *
     * Spring的依赖注入机制：
     * - 扫描所有实现了DiscountStrategy接口的Bean
     * - 将它们打包成List传入构造函数
     */
    @Autowired
    public DiscountStrategyFactory(List<DiscountStrategy> strategies) {
        // 遍历所有策略实现，注册到Map中
        for (DiscountStrategy strategy : strategies) {
            // 获取策略类型标识
            Integer type = strategy.getStrategyType();

            // 注册到Map中
            // 例如：strategyMap.put(1, PerPriceDiscountStrategy实例)
            strategyMap.put(type, strategy);
        }
    }

    /**
     * 根据策略类型获取对应的策略实现
     *
     * @param strategyType 策略类型（1/2/3）
     * @return 对应的策略对象
     * @throws RuntimeException 如果找不到对应策略
     *
     * 使用示例：
     * DiscountStrategy strategy = factory.getStrategy(1);
     * BigDecimal discount = strategy.calculateDiscount(amount, coupon);
     */
    public DiscountStrategy getStrategy(Integer strategyType) {
        // 从Map中获取策略
        DiscountStrategy strategy = strategyMap.get(strategyType);

        // 如果找不到，抛出异常
        // 这是一种快速失败（Fail-Fast）策略
        if (strategy == null) {
            throw new RuntimeException("不支持的优惠类型: " + strategyType);
        }

        return strategy;
    }

    /**
     * 注册新策略（运行时动态扩展）
     *
     * @param strategyType 策略类型
     * @param strategy 策略对象
     *
     * 使用场景：
     * - 插件化架构：运行时加载新策略
     * - 热更新：不停服添加新优惠类型
     */
    public void registerStrategy(Integer strategyType, DiscountStrategy strategy) {
        strategyMap.put(strategyType, strategy);
    }
}