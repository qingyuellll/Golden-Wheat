package com.mzhl.task;

import com.mzhl.service.UserCouponService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 优惠券定时任务
 * 作用：定期处理过期的优惠券
 *
 * Spring Scheduled工作原理：
 * 1. @EnableScheduling启用定时任务支持（在启动类配置）
 * 2. @Scheduled标注定时方法
 * 3. Spring创建线程池定期执行
 *
 * Cron表达式格式：
 * 秒 分 时 日 月 周
 * 例如：0 0 2 * * ? 表示每天凌晨2点执行
 */
@Slf4j // 日志对象
@Component // Spring组件，自动注册
@RequiredArgsConstructor // 构造函数注入
public class CouponTask {

    // 注入用户优惠券服务
    private final UserCouponService userCouponService;

    /**
     * 定时标记过期优惠券
     *
     * 执行时机：
     * - 每天凌晨2点执行
     * - Cron表达式解析：
     *   0    - 第0秒
     *   0    - 第0分
     *   2    - 第2时（凌晨2点）
     *   *    - 每日
     *   *    - 每月
     *   ?    - 不关心星期几
     *
     * 为什么选凌晨2点？
     * - 用户活跃度低，系统负载小
     * - 避开业务高峰期
     * - 便于第二天查看处理结果
     */
    @Scheduled(cron = "0 0 2 * * ?") // 定时任务注解
    public void expireCoupons() {
        // 记录开始日志
        log.info("========== 开始执行优惠券过期定时任务 ==========");

        try {
            // 调用Service处理过期优惠券
            userCouponService.expireCoupons();

            // 记录成功日志
            log.info("========== 优惠券过期定时任务执行成功 ==========");

        } catch (Exception e) {
            // 记录错误日志
            log.error("========== 优惠券过期定时任务执行失败 ==========", e);

            // 注意：定时任务中捕获异常，避免影响后续执行
            // 不抛出异常，否则会导致任务停止
        }
    }

    /**
     * 定时解锁超时的锁定券
     * 下单锁券后既不支付也不取消（如进程异常、订单状态流转遗漏），券会停留在status=4被永久锁住，
     * 每5分钟扫一次，超过15分钟的锁定券直接释放
     */
    @Scheduled(cron = "0 */5 * * * ?")
    public void unlockTimeoutCoupons() {
        try {
            int count = userCouponService.unlockTimeoutCoupons(15);
            if (count > 0) {
                log.info("定时任务解锁超时锁定券 {} 张", count);
            }
        } catch (Exception e) {
            log.error("解锁超时锁定券定时任务执行失败", e);
        }
    }
}