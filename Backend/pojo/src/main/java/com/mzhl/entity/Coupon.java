package com.mzhl.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券模板实体类
 * 作用：定义优惠券的基本规则和使用条件
 * 数据库表：coupon
 */
@Data // Lombok注解，自动生成getter/setter/toString等方法
@Builder // 构建者模式，方便链式创建对象
@NoArgsConstructor // 无参构造
@AllArgsConstructor // 全参构造
public class Coupon implements Serializable {

    // 序列化版本号，用于网络传输和持久化时的版本校验
    private static final long serialVersionUID = 1L;

    // 主键ID，自增
    private Long id;

    // 优惠券名称，如"新人专享券"、"满100减20"
    private String name;

    // 优惠券类型：1-代金券（直接减钱） 2-折扣券（打几折） 3-赠品券
    private Integer type;

    // 优惠计算方式：1-每满减（可叠加） 2-阶梯折扣 3-固定折扣
    private Integer discountType;

    // 是否指定商品：0-全场通用 1-指定商品/分类
    private Integer specific;

    // 优惠值：代金券表示金额（元），折扣券表示折扣率（如80=8折）
    private BigDecimal discountValue;

    // 使用门槛金额（元），0表示无门槛
    private BigDecimal thresholdAmount;

    // 最大优惠金额（元），防止折扣过高，null表示不限制
    private BigDecimal maxDiscountAmount;

    // 获取方式：1-用户主动领取 2-兑换码兑换 3-系统自动发放
    private Integer obtainWay;

    // 可领取开始时间
    private LocalDateTime issueBeginTime;

    // 可领取结束时间
    private LocalDateTime issueEndTime;

    // 有效期天数（从领取日起算），0表示使用固定有效期
    private Integer termDays;

    // 固定有效期开始时间（当termDays=0时使用）
    private LocalDateTime termBeginTime;

    // 固定有效期结束时间（当termDays=0时使用）
    private LocalDateTime termEndTime;

    // 优惠券状态：0-草稿 1-进行中 2-已停止 3-已过期
    private Integer status;

    // 发行总量，控制库存
    private Integer totalNum;

    // 已发放数量（已领取的数量）
    private Integer issueNum;

    // 已使用数量
    private Integer usedNum;

    // 每人同时持有上限（未使用+锁定中计入，已使用不计），0表示不限制；用完可再领
    private Integer userLimit;

    // 扩展参数，JSON格式存储额外配置
    // 例如：{"can_stack": true, "exclude_items": [1,2,3]}
    private String extParam;

    // 记录创建时间
    private LocalDateTime createTime;

    // 记录更新时间
    private LocalDateTime updateTime;

    // 创建人（管理员账号）
    private String creator;

    // 更新人（管理员账号）
    private String updater;
}
