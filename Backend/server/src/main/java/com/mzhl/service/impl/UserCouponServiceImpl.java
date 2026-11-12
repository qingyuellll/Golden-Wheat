package com.mzhl.service.impl;

import com.mzhl.constant.MessageConstant;
import com.mzhl.context.BaseContext;
import com.mzhl.dto.CouponCalculateDTO;
import com.mzhl.entity.Coupon;
import com.mzhl.entity.CouponScope;
import com.mzhl.entity.Dish;
import com.mzhl.entity.ExchangeCode;
import com.mzhl.entity.Setmeal;
import com.mzhl.entity.UserCoupon;
import com.mzhl.exception.BaseException;
import com.mzhl.mapper.CouponMapper;
import com.mzhl.mapper.CouponScopeMapper;
import com.mzhl.mapper.DishMapper;
import com.mzhl.mapper.ExchangeCodeMapper;
import com.mzhl.mapper.SetmealMapper;
import com.mzhl.mapper.UserCouponMapper;
import com.mzhl.service.UserCouponService;
import com.mzhl.service.strategy.DiscountStrategy;
import com.mzhl.service.strategy.DiscountStrategyFactory;
import com.mzhl.vo.AvailableCouponVO;
import com.mzhl.vo.CouponPreviewVO;
import com.mzhl.vo.CouponVO;
import com.mzhl.vo.OptimalCouponVO;
import com.mzhl.vo.UserCouponVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserCouponServiceImpl implements UserCouponService {

    @Autowired
    private UserCouponMapper userCouponMapper;

    @Autowired
    private CouponMapper couponMapper;

    @Autowired
    private CouponScopeMapper couponScopeMapper;

    @Autowired
    private ExchangeCodeMapper exchangeCodeMapper;

    @Autowired
    private DishMapper dishMapper;

    @Autowired
    private SetmealMapper setmealMapper;

    @Autowired
    private DiscountStrategyFactory strategyFactory;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String COUPON_STOCK_KEY_PREFIX = "coupon:stock:";
    private static final String COUPON_USER_LIMIT_KEY_PREFIX = "coupon:user:limit:";

    /** 最优券组合枚举上限：组合数为2^n，券多时指数爆炸，只取单券优惠最大的前N张参与枚举 */
    private static final int MAX_COMBINATION_COUPONS = 10;

    /** 单笔订单最多叠加使用的优惠券张数（业务规则，需写进用户协议）：
     *  2^n=1023个全组合收敛为 C(n,1)+C(n,2)，且"最优"有了唯一解——把指数问题消灭在定义域里，
     *  而不是在算法里硬扛。全行业电商平台普遍限制叠加张数，复杂叠加规则也会直接催生客诉 */
    private static final int MAX_STACKED_COUPONS = 2;

    /**
     * 领券原子脚本：限领额度自增校验 + 库存扣减 + 不足回补，一段Lua内执行
     * Redis单线程只保证单条命令原子，DECR与回补INCR分开两条命令中间崩溃会漏回补，必须脚本化
     * KEYS[1]=库存key KEYS[2]=限领额度key ARGV[1]=每人同时持有上限 ARGV[2]=限领key过期秒数 ARGV[3]=DB当前持有数基准
     * 限领key丢失（Redis重启/淘汰）时以DB计数自愈，避免额度清零导致可无限领取
     * 返回：1-领取成功 2-超过持有上限 3-库存不足
     */
    private static final DefaultRedisScript<Long> CLAIM_SCRIPT = new DefaultRedisScript<>(
        "if redis.call('EXISTS', KEYS[2]) == 0 then " +
        "  redis.call('SET', KEYS[2], ARGV[3]) " +
        "  if tonumber(ARGV[2]) > 0 then " +
        "    redis.call('EXPIRE', KEYS[2], ARGV[2]) " +
        "  end " +
        "end " +
        "local claimed = tonumber(redis.call('INCR', KEYS[2])) " +
        "if claimed > tonumber(ARGV[1]) then " +
        "  redis.call('DECR', KEYS[2]) " +
        "  return 2 " +
        "end " +
        "local stock = tonumber(redis.call('DECR', KEYS[1])) " +
        "if stock < 0 then " +
        "  redis.call('INCR', KEYS[1]) " +
        "  redis.call('DECR', KEYS[2]) " +
        "  return 3 " +
        "end " +
        "return 1",
        Long.class);

    /**
     * 查询可领取的优惠券列表
     * @return 返回可领取的优惠券列表
     */
    @Override
    public List<CouponVO> getAvailableCoupons() {
        log.debug("查询可领取的优惠券列表");

        List<Coupon> coupons = couponMapper.findActiveCoupons();
        Long userId = BaseContext.getCurrentId();

        return coupons.stream().map(coupon -> {
            CouponVO vo = new CouponVO();
            BeanUtils.copyProperties(coupon, vo);

            vo.setRemainNum(coupon.getTotalNum() - coupon.getIssueNum());
            vo.setTypeDesc(getTypeDescription(coupon.getType()));
            vo.setRuleDesc(generateRuleDescription(coupon));

            int receivedCount = userCouponMapper.countByUserAndCoupon(userId, coupon.getId());
            vo.setReceived(receivedCount > 0);
            vo.setStatusDesc("进行中");
            vo.setValidityDesc(generateValidityDescription(coupon));

            String scopeDesc = generateScopeDescription(coupon.getId(), coupon.getSpecific());
            vo.setScopeDesc(scopeDesc);

            return vo;
        }).collect(Collectors.toList());
    }

    /**
     * 用户领取优惠券
     * @param couponId 优惠券模板ID
     * @param userId 用户ID
     */
    @Override
    @Transactional
    public void receiveCoupon(Long couponId, Long userId) {
        log.info("开始领取优惠券，用户ID：{}，优惠券ID：{}", userId, couponId);

        Coupon coupon = couponMapper.getById(couponId);

        if (coupon == null) {
            throw new BaseException(MessageConstant.COUPON_NOT_FOUND);
        }

        if (coupon.getStatus() != 1) {
            throw new BaseException("优惠券未开始或已结束");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getIssueBeginTime()) || now.isAfter(coupon.getIssueEndTime())) {
            throw new BaseException("不在可领取时间范围内");
        }

        String stockKey = COUPON_STOCK_KEY_PREFIX + couponId;
        String stockStr = redisTemplate.opsForValue().get(stockKey);

        if (stockStr == null) {
            int dbStock = coupon.getTotalNum() - coupon.getIssueNum();
            redisTemplate.opsForValue().set(stockKey, String.valueOf(dbStock));

            long expireSeconds = ChronoUnit.SECONDS.between(now, coupon.getIssueEndTime());
            if (expireSeconds > 0) {
                redisTemplate.expire(stockKey, expireSeconds, TimeUnit.SECONDS);
            }

            stockStr = String.valueOf(dbStock);
        }

        int remainStock = Integer.parseInt(stockStr);
        if (remainStock <= 0) {
            throw new BaseException(MessageConstant.COUPON_OUT_OF_STOCK);
        }

        String limitKey = COUPON_USER_LIMIT_KEY_PREFIX + couponId + ":" + userId;
        int userLimit = (coupon.getUserLimit() != null && coupon.getUserLimit() > 0) ? coupon.getUserLimit() : 1;

        int receivedCount = userCouponMapper.countByUserAndCoupon(userId, couponId);
        if (receivedCount >= userLimit) {
            // 语义是"同时持有上限"：只数未使用(1)/锁定中(4)，已使用(2)不占额度，用完可再领
            throw new BaseException("该券同时持有数量已达上限，使用后可再领");
        }

        // Lua脚本原子执行：额度校验+库存扣减+不足回补；额度key丢失时以DB持有数自愈
        long limitExpireSeconds = Math.max(0, ChronoUnit.SECONDS.between(now, coupon.getIssueEndTime()));
        Long claimResult = redisTemplate.execute(CLAIM_SCRIPT,
                List.of(stockKey, limitKey),
                String.valueOf(userLimit), String.valueOf(limitExpireSeconds), String.valueOf(receivedCount));

        if (claimResult != null && claimResult == 2L) {
            throw new BaseException("该券同时持有数量已达上限，使用后可再领");
        }
        if (claimResult != null && claimResult == 3L) {
            throw new BaseException(MessageConstant.COUPON_OUT_OF_STOCK);
        }

        try {
            UserCoupon userCoupon = new UserCoupon();
            userCoupon.setUserId(userId);
            userCoupon.setCouponId(couponId);
            //第 receivedCount+1 张：与 (user_id, coupon_id, copy_no) 唯一索引配套，
            //既支持限领 N 张（N>1），又能在并发/Redis计数丢失时由唯一索引兜底
            userCoupon.setCopyNo(receivedCount + 1);

            if (coupon.getTermDays() != null && coupon.getTermDays() > 0) {
                userCoupon.setTermBeginTime(now);
                userCoupon.setTermEndTime(now.plusDays(coupon.getTermDays()));
            } else {
                userCoupon.setTermBeginTime(coupon.getTermBeginTime());
                userCoupon.setTermEndTime(coupon.getTermEndTime());
            }

            userCoupon.setStatus(1);
            userCoupon.setCreateTime(now);
            userCoupon.setUpdateTime(now);

            userCouponMapper.insert(userCoupon);
            int rows = couponMapper.increaseIssueNum(couponId, 1);
            if (rows == 0) {
                throw new BaseException(MessageConstant.COUPON_OUT_OF_STOCK);
            }

            log.info("用户 {} 领取优惠券 {} 成功", userId, couponId);

        } catch (DuplicateKeyException e) {
            // (user_id, coupon_id, copy_no) 唯一索引拦截并发写入同一序号：
            // 正常限领场景由 Redis Lua 先拦，走到这里说明计数与库不一致（如 Redis 重启清零）
            redisTemplate.opsForValue().increment(stockKey);
            redisTemplate.opsForValue().decrement(limitKey);
            throw new BaseException("领取繁忙，请稍后重试");
        } catch (Exception e) {
            // DB写入失败，回补Redis预占（Lua保证脚本内原子，此处补偿的是脚本与DB之间的窗口）
            redisTemplate.opsForValue().increment(stockKey);
            redisTemplate.opsForValue().decrement(limitKey);
            log.error("领取优惠券失败", e);
            throw e;
        }
    }

    /**
     * 通过兑换码领取优惠券
     * @param code 兑换码字符串
     * @param userId 用户ID
     */
    @Override
    @Transactional
    public void receiveCouponByCode(String code, Long userId) {
        log.info("开始兑换优惠券，用户ID：{}，兑换码：{}", userId, code);

        ExchangeCode exchangeCode = exchangeCodeMapper.findByCode(code);

        if (exchangeCode == null) {
            throw new BaseException("兑换码不存在");
        }

        if (exchangeCode.getStatus() == 1) {
            throw new BaseException("兑换码已被使用");
        }
        if (exchangeCode.getStatus() == 2) {
            throw new BaseException("兑换码已失效");
        }

        if (exchangeCode.getExpiredTime().isBefore(LocalDateTime.now())) {
            throw new BaseException("兑换码已过期");
        }

        exchangeCodeMapper.useCode(code, userId);

        Long couponId = exchangeCode.getExchangeTarget();

        Coupon coupon = couponMapper.getById(couponId);
        if (coupon == null) {
            throw new BaseException(MessageConstant.COUPON_NOT_FOUND);
        }

        UserCoupon userCoupon = new UserCoupon();
        userCoupon.setUserId(userId);
        userCoupon.setCouponId(couponId);

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getTermDays() != null && coupon.getTermDays() > 0) {
            userCoupon.setTermBeginTime(now);
            userCoupon.setTermEndTime(now.plusDays(coupon.getTermDays()));
        } else {
            userCoupon.setTermBeginTime(coupon.getTermBeginTime());
            userCoupon.setTermEndTime(coupon.getTermEndTime());
        }

        userCoupon.setStatus(1);
        userCoupon.setCreateTime(now);
        userCoupon.setUpdateTime(now);

        userCouponMapper.insert(userCoupon);

        int rows = couponMapper.increaseIssueNum(couponId, 1);
        if (rows == 0) {
            throw new BaseException(MessageConstant.COUPON_OUT_OF_STOCK);
        }

        log.info("用户 {} 通过兑换码 {} 领取优惠券 {} 成功", userId, code, couponId);
    }

    /**
     * 查询用户的优惠券列表
     * @param userId 用户ID
     * @param status 状态筛选（null表示全部）
     * @return 返回用户优惠券列表
     */
    @Override
    public List<UserCouponVO> getMyCoupons(Long userId, Integer status) {
        log.debug("查询用户优惠券列表，用户ID：{}，状态：{}", userId, status);

        List<UserCoupon> userCoupons = userCouponMapper.findByUserId(userId, status);

        return userCoupons.stream().map(userCoupon -> {
            UserCouponVO vo = new UserCouponVO();
            BeanUtils.copyProperties(userCoupon, vo);

            Coupon coupon = couponMapper.getById(userCoupon.getCouponId());
            if (coupon != null) {
                vo.setCouponName(coupon.getName());
                vo.setRuleDesc(generateRuleDescription(coupon));
                vo.setDiscountValue(coupon.getDiscountValue());
                vo.setThresholdAmount(coupon.getThresholdAmount());
                vo.setMaxDiscountAmount(coupon.getMaxDiscountAmount());
            }

            vo.setStatusDesc(getUserCouponStatusDescription(userCoupon.getStatus()));

            if (userCoupon.getTermEndTime() != null) {
                LocalDate endDate = userCoupon.getTermEndTime().toLocalDate();
                LocalDate today = LocalDate.now();
                long days = ChronoUnit.DAYS.between(today, endDate);
                vo.setRemainDays((int) days);
                vo.setExpiringSoon(days <= 3 && days >= 0);
            }

            return vo;
        }).collect(Collectors.toList());
    }

    /**
     * 计算订单可用优惠券
     * @param calculateDTO 订单信息
     * @return 返回可用优惠券列表
     */
    @Override
    public List<AvailableCouponVO> calculateAvailableCoupons(CouponCalculateDTO calculateDTO) {
        log.debug("计算可用优惠券，用户ID：{}", calculateDTO.getUserId());

        Long userId = calculateDTO.getUserId();
        List<UserCoupon> userCoupons = userCouponMapper.findUnusedByUserId(userId);

        if (calculateDTO.getItems() == null || calculateDTO.getItems().isEmpty()) {
            return new ArrayList<>();
        }

        fillMissingCategoryIds(calculateDTO.getItems());

        BigDecimal orderAmount = calculateDTO.getItems().stream()
            .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Set<Long> categoryIds = calculateDTO.getItems().stream()
            .map(CouponCalculateDTO.OrderItemDTO::getCategoryId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        boolean hasCategoryInfo = !categoryIds.isEmpty();

        List<AvailableCouponVO> result = new ArrayList<>();

        for (UserCoupon userCoupon : userCoupons) {
            Coupon coupon = couponMapper.getById(userCoupon.getCouponId());
            if (coupon == null) {
                continue;
            }

            AvailableCouponVO vo = new AvailableCouponVO();
            vo.setUserCouponId(userCoupon.getId());
            vo.setName(coupon.getName());
            vo.setThresholdAmount(coupon.getThresholdAmount());

            boolean inScope = !hasCategoryInfo || checkCouponScope(coupon, categoryIds);

            if (!inScope) {
                vo.setCanUse(false);
                vo.setUnavailableReason("不适用于当前商品");
                vo.setDiscountAmount(BigDecimal.ZERO);
                result.add(vo);
                continue;
            }

            DiscountStrategy strategy = strategyFactory.getStrategy(coupon.getDiscountType());
            boolean canUse = strategy.canUse(orderAmount, coupon);

            if (!canUse) {
                vo.setCanUse(false);
                vo.setUnavailableReason("未达到使用门槛");
                vo.setDiscountAmount(BigDecimal.ZERO);
                vo.setRuleDesc(strategy.getRuleDescription(coupon));
                result.add(vo);
                continue;
            }

            BigDecimal discountAmount = strategy.calculateDiscount(orderAmount, coupon);

            vo.setCanUse(true);
            vo.setDiscountAmount(discountAmount);
            vo.setRuleDesc(strategy.getRuleDescription(coupon));

            result.add(vo);
        }

        result.sort((a, b) -> {
            if (!a.getCanUse().equals(b.getCanUse())) {
                return a.getCanUse() ? -1 : 1;
            }
            return b.getDiscountAmount().compareTo(a.getDiscountAmount());
        });

        return result;
    }

    /**
     * 优惠券组合试算：与下单锁定（lockCouponsForOrder）完全同一核销口径——
     * 按传入顺序逐张核销，余额递减，不满足门槛的跳过（优惠记 0）。
     * 归属/状态/过期校验与锁定一致，券不可用直接抛错，防止前端展示与实付不符。
     * 身份从 Token 取（BaseContext），不信任 DTO 里的 userId。
     */
    @Override
    public CouponPreviewVO previewCombination(CouponCalculateDTO calculateDTO) {
        Long userId = BaseContext.getCurrentId();

        if (calculateDTO.getItems() == null || calculateDTO.getItems().isEmpty()) {
            return CouponPreviewVO.builder()
                    .orderAmount(BigDecimal.ZERO).coupons(new ArrayList<>())
                    .totalDiscount(BigDecimal.ZERO).payAmount(BigDecimal.ZERO).build();
        }

        fillMissingCategoryIds(calculateDTO.getItems());

        BigDecimal orderAmount = calculateDTO.getItems().stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = orderAmount;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        List<CouponPreviewVO.CouponDiscount> detail = new ArrayList<>();

        List<Long> ids = calculateDTO.getUserCouponIds();
        if (ids != null) {
            // 叠加张数与下单锁定、最优组合算法保持同一业务口径
            if (ids.size() > MAX_STACKED_COUPONS) {
                throw new BaseException("单笔订单最多叠加" + MAX_STACKED_COUPONS + "张优惠券");
            }
            for (Long userCouponId : ids) {
                UserCoupon userCoupon = userCouponMapper.findById(userCouponId);

                // 归属与状态校验：与 lockCouponsForOrder 一致，券不可用直接抛错
                if (userCoupon == null || !userId.equals(userCoupon.getUserId())
                        || userCoupon.getStatus() == null || userCoupon.getStatus() != 1) {
                    throw new BaseException("优惠券不可用");
                }
                if (userCoupon.getTermEndTime() != null && userCoupon.getTermEndTime().isBefore(LocalDateTime.now())) {
                    throw new BaseException("优惠券已过期");
                }

                Coupon coupon = couponMapper.getById(userCoupon.getCouponId());
                if (coupon == null) {
                    throw new BaseException("优惠券不可用");
                }

                DiscountStrategy strategy = strategyFactory.getStrategy(coupon.getDiscountType());
                BigDecimal discount = BigDecimal.ZERO;
                boolean skipped = false;
                if (!strategy.canUse(remaining, coupon)) {
                    // 不满足门槛：与锁定口径一致，跳过该券，优惠记 0
                    skipped = true;
                } else {
                    discount = strategy.calculateDiscount(remaining, coupon);
                    if (discount.compareTo(BigDecimal.ZERO) < 0) {
                        discount = BigDecimal.ZERO;
                    }
                }

                detail.add(CouponPreviewVO.CouponDiscount.builder()
                        .userCouponId(userCouponId)
                        .name(coupon.getName())
                        .discount(discount)
                        .skipped(skipped)
                        .build());

                totalDiscount = totalDiscount.add(discount);
                remaining = remaining.subtract(discount).max(BigDecimal.ZERO);
            }
        }

        BigDecimal payAmount = orderAmount.subtract(totalDiscount).max(BigDecimal.ZERO);

        return CouponPreviewVO.builder()
                .orderAmount(orderAmount)
                .coupons(detail)
                .totalDiscount(totalDiscount)
                .payAmount(payAmount)
                .build();
    }

    /**
     * 查找最优优惠券组合
     * @param calculateDTO 订单信息
     * @return 返回最优组合方案
     */
    @Override
    public OptimalCouponVO findOptimalCoupons(CouponCalculateDTO calculateDTO) {
        log.debug("查找最优优惠券组合，用户ID：{}", calculateDTO.getUserId());

        Long userId = calculateDTO.getUserId();
        List<UserCoupon> userCoupons = userCouponMapper.findUnusedByUserId(userId);

        // 批量捞券模板放Map，全程查内存：组合枚举若逐张getById，1023组合×平均5张≈5000次DB，一次in查询收敛为1次
        List<Long> couponIds = userCoupons.stream()
            .map(UserCoupon::getCouponId)
            .distinct()
            .collect(Collectors.toList());
        Map<Long, Coupon> couponMap = couponIds.isEmpty()
            ? Collections.emptyMap()
            : couponMapper.getByIds(couponIds).stream()
                .collect(Collectors.toMap(Coupon::getId, c -> c));

        if (calculateDTO.getItems() == null || calculateDTO.getItems().isEmpty()) {
            return OptimalCouponVO.builder()
                .userCouponIds(Collections.emptyList())
                .couponNames(Collections.emptyList())
                .totalDiscount(BigDecimal.ZERO)
                .originalAmount(BigDecimal.ZERO)
                .payAmount(BigDecimal.ZERO)
                .savedAmount(BigDecimal.ZERO)
                .build();
        }

        fillMissingCategoryIds(calculateDTO.getItems());

        BigDecimal orderAmount = calculateDTO.getItems().stream()
            .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Set<Long> categoryIds = calculateDTO.getItems().stream()
            .map(CouponCalculateDTO.OrderItemDTO::getCategoryId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        boolean hasCategoryInfo = !categoryIds.isEmpty();

        List<UserCoupon> availableCoupons = userCoupons.stream().filter(userCoupon -> {
            Coupon coupon = couponMap.get(userCoupon.getCouponId());
            if (coupon == null) {
                return false;
            }

            boolean inScope = !hasCategoryInfo || checkCouponScope(coupon, categoryIds);
            if (!inScope) {
                return false;
            }

            DiscountStrategy strategy = strategyFactory.getStrategy(coupon.getDiscountType());
            return strategy.canUse(orderAmount, coupon);
        }).collect(Collectors.toList());

        if (availableCoupons.isEmpty()) {
            return OptimalCouponVO.builder()
                .userCouponIds(Collections.emptyList())
                .totalDiscount(BigDecimal.ZERO)
                .originalAmount(orderAmount)
                .payAmount(orderAmount)
                .savedAmount(BigDecimal.ZERO)
                .build();
        }

        if (availableCoupons.size() > MAX_COMBINATION_COUPONS) {
            log.warn("用户 {} 可用优惠券 {} 张，超过枚举上限 {}，仅取单券优惠最大的前 {} 张计算最优组合",
                userId, availableCoupons.size(), MAX_COMBINATION_COUPONS, MAX_COMBINATION_COUPONS);
            availableCoupons.sort(Comparator.comparing((UserCoupon uc) -> {
                Coupon coupon = couponMap.get(uc.getCouponId());
                DiscountStrategy strategy = strategyFactory.getStrategy(coupon.getDiscountType());
                return strategy.calculateDiscount(orderAmount, coupon);
            }).reversed());
            availableCoupons = availableCoupons.subList(0, MAX_COMBINATION_COUPONS);
        }

        List<List<UserCoupon>> combinations = generateCombinations(availableCoupons);

        // 归约求最优组合：组合数已被上限保护限制在2^10以内，顺序归约足够快，
        // 不用parallelStream——commonPool全JVM共享，且并行写共享累加器需要加锁，本身就是错误用法
        List<UserCoupon> bestCombination = new ArrayList<>();
        BigDecimal maxDiscount = BigDecimal.ZERO;

        for (List<UserCoupon> combination : combinations) {
            BigDecimal totalDiscount = calculateCombinationDiscount(combination, orderAmount, couponMap);
            if (totalDiscount.compareTo(maxDiscount) > 0) {
                maxDiscount = totalDiscount;
                bestCombination = combination;
            }
        }

        final List<UserCoupon> finalBest = bestCombination;
        List<Long> userCouponIds = finalBest.stream()
            .map(UserCoupon::getId)
            .collect(Collectors.toList());

        List<String> couponNames = finalBest.stream()
            .map(uc -> {
                Coupon coupon = couponMap.get(uc.getCouponId());
                return coupon != null ? coupon.getName() : "未知";
            })
            .collect(Collectors.toList());

        BigDecimal payAmount = orderAmount.subtract(maxDiscount);

        if (payAmount.compareTo(BigDecimal.ZERO) < 0) {
            payAmount = BigDecimal.ZERO;
        }

        return OptimalCouponVO.builder()
            .userCouponIds(userCouponIds)
            .couponNames(couponNames)
            .totalDiscount(maxDiscount)
            .originalAmount(orderAmount)
            .payAmount(payAmount)
            .savedAmount(maxDiscount)
            .build();
    }

    /**
     * 使用优惠券
     * @param userCouponId 用户优惠券ID
     * @param orderId 订单ID
     * @param discountAmount 优惠金额
     */
    @Override
    @Transactional
    public void useCoupon(Long userCouponId, Long orderId, BigDecimal discountAmount) {
        log.info("使用优惠券，用户优惠券ID：{}，订单ID：{}", userCouponId, orderId);

        UserCoupon userCoupon = userCouponMapper.findById(userCouponId);

        if (userCoupon == null) {
            throw new BaseException(MessageConstant.COUPON_NOT_FOUND);
        }

        // 锁券带状态条件，影响0行说明券已被用/已锁（并发或重复提交），直接失败
        int rows = userCouponMapper.lockCoupon(userCouponId, orderId);
        if (rows == 0) {
            throw new BaseException("优惠券状态异常，无法使用");
        }

        log.info("用户 {} 在订单 {} 中使用优惠券 {}，优惠金额: {}",
                userCoupon.getUserId(), orderId, userCouponId, discountAmount);
    }

    /**
     * 下单锁券：服务端校验并重算优惠，逐张锁定，返回总优惠金额
     */
    @Override
    @Transactional
    public BigDecimal lockCouponsForOrder(Long userId, List<Long> userCouponIds, Long orderId, BigDecimal orderAmount) {
        if (userCouponIds == null || userCouponIds.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // 叠加张数与最优组合算法（MAX_STACKED_COUPONS）保持同一业务口径
        if (userCouponIds.size() > MAX_STACKED_COUPONS) {
            throw new BaseException("单笔订单最多叠加" + MAX_STACKED_COUPONS + "张优惠券");
        }

        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal remaining = orderAmount;

        for (Long userCouponId : userCouponIds) {
            UserCoupon userCoupon = userCouponMapper.findById(userCouponId);

            // 归属与状态校验：不是自己的券、已使用/已锁定/已过期一律拒绝，不信任前端传参
            if (userCoupon == null || !userId.equals(userCoupon.getUserId())
                    || userCoupon.getStatus() == null || userCoupon.getStatus() != 1) {
                throw new BaseException("优惠券不可用");
            }
            if (userCoupon.getTermEndTime() != null && userCoupon.getTermEndTime().isBefore(LocalDateTime.now())) {
                throw new BaseException("优惠券已过期");
            }

            Coupon coupon = couponMapper.getById(userCoupon.getCouponId());
            if (coupon == null) {
                throw new BaseException("优惠券不可用");
            }

            DiscountStrategy strategy = strategyFactory.getStrategy(coupon.getDiscountType());
            if (!strategy.canUse(remaining, coupon)) {
                // 不满足门槛的券绝不能锁——锁定后在支付成功时会被核销，等于白白烧掉一张券；
                // 跳过继续尝试下一张，该券保持"未使用"状态可正常使用
                log.info("订单 {} 优惠券 {} 不满足使用门槛（当前订单金额 {}），跳过锁定", orderId, userCouponId, remaining);
                continue;
            }
            BigDecimal discount = strategy.calculateDiscount(remaining, coupon);
            if (discount.compareTo(BigDecimal.ZERO) < 0) {
                discount = BigDecimal.ZERO;
            }

            useCoupon(userCouponId, orderId, discount);

            totalDiscount = totalDiscount.add(discount);
            remaining = remaining.subtract(discount).max(BigDecimal.ZERO);
        }

        log.info("订单 {} 锁定 {} 张优惠券，服务端核算总优惠 {}", orderId, userCouponIds.size(), totalDiscount);
        return totalDiscount;
    }

    /**
     * 按订单解锁券
     */
    @Override
    public int unlockCouponsByOrder(Long orderId) {
        int rows = userCouponMapper.unlockByOrderId(orderId);
        if (rows > 0) {
            log.info("订单 {} 取消，解锁 {} 张优惠券", orderId, rows);
        }
        return rows;
    }

    /**
     * 按订单核销券（锁定转已使用），并累加模板的已使用数量
     */
    @Override
    @Transactional
    public void useCouponsByOrder(Long orderId) {
        int rows = userCouponMapper.useByOrderId(orderId);
        if (rows == 0) {
            return;
        }
        for (UserCoupon userCoupon : userCouponMapper.findByOrderId(orderId, 2)) {
            couponMapper.increaseUsedNum(userCoupon.getCouponId());
        }
        log.info("订单 {} 支付成功，核销 {} 张优惠券", orderId, rows);
    }

    /**
     * 解锁超时锁定券（下单后既不支付也不取消，靠定时任务兜底释放）
     */
    @Override
    @Transactional
    public int unlockTimeoutCoupons(int timeoutMinutes) {
        List<UserCoupon> timeoutList = userCouponMapper.findTimeoutLocked(timeoutMinutes);
        if (timeoutList.isEmpty()) {
            return 0;
        }
        for (UserCoupon userCoupon : timeoutList) {
            userCouponMapper.unlockCoupon(userCoupon.getId());
            log.info("解锁超时锁定券 userCouponId: {}，orderId: {}", userCoupon.getId(), userCoupon.getOrderId());
        }
        return timeoutList.size();
    }

    /**
     * 解锁优惠券
     * @param userCouponId 用户优惠券ID
     */
    @Override
    @Transactional
    public void unlockCoupon(Long userCouponId) {
        log.debug("解锁优惠券，ID：{}", userCouponId);

        userCouponMapper.unlockCoupon(userCouponId);

        log.info("解锁优惠券成功，ID: {}", userCouponId);
    }

    /**
     * 定时任务：标记过期优惠券
     */
    @Override
    @Transactional
    public void expireCoupons() {
        log.info("开始执行优惠券过期定时任务...");

        List<UserCoupon> expiredCoupons = userCouponMapper.findExpiredCoupons();

        if (expiredCoupons.isEmpty()) {
            log.info("没有过期的优惠券");
            return;
        }

        List<Long> ids = expiredCoupons.stream()
            .map(UserCoupon::getId)
            .collect(Collectors.toList());

        userCouponMapper.batchUpdateToExpired(ids);

        log.info("优惠券过期定时任务执行完成，共处理 {} 张优惠券", ids.size());
    }

    /**
     * 检查优惠券是否在适用范围内
     * @param coupon 优惠券模板
     * @param orderCategoryIds 订单商品分类ID集合
     * @return true-在范围内 false-不在范围内
     */
    private boolean checkCouponScope(Coupon coupon, Set<Long> orderCategoryIds) {
        if (coupon.getSpecific() == null || coupon.getSpecific() == 0) {
            return true;
        }

        List<CouponScope> scopes = couponScopeMapper.findByCouponId(coupon.getId());

        Set<Long> scopeCategoryIds = scopes.stream()
            .filter(scope -> CouponScope.TYPE_CATEGORY.equals(scope.getType()))
            .map(CouponScope::getBizId)
            .collect(Collectors.toSet());

        // 标了定向却没有配置任何范围，等同于不限范围：
        // 与 generateScopeDescription 的口径保持一致，避免这类券在结算页永远"不适用于当前商品"
        if (scopeCategoryIds.isEmpty()) {
            return true;
        }

        return orderCategoryIds.stream().anyMatch(scopeCategoryIds::contains);
    }

    /**
     * 补齐订单项缺失的商品分类。
     * <p>
     * 购物车只存了商品id和单价，前端拿不到分类，只能把分类留空；
     * 这里按 itemId + itemType 回到菜品/套餐表取分类，
     * 让"指定分类可用"的券能被正确判定，而不是被一律判成"不适用于当前商品"。
     * 调用方显式传入的有效分类优先，不覆盖。
     */
    private void fillMissingCategoryIds(List<CouponCalculateDTO.OrderItemDTO> items) {
        for (CouponCalculateDTO.OrderItemDTO item : items) {
            if (item.getCategoryId() != null && item.getCategoryId() > 0) {
                continue;
            }
            if (item.getItemId() == null) {
                continue;
            }

            Long categoryId = null;
            if (Integer.valueOf(2).equals(item.getItemType())) {
                Setmeal setmeal = setmealMapper.getById(item.getItemId());
                if (setmeal != null) {
                    categoryId = setmeal.getCategoryId();
                }
            } else {
                Dish dish = dishMapper.getById(item.getItemId());
                if (dish != null) {
                    categoryId = dish.getCategoryId();
                }
            }
            item.setCategoryId(categoryId);
        }
    }

    /**
     * 生成所有可能的组合
     * @param coupons 优惠券列表
     * @return 所有组合的列表
     */
    private List<List<UserCoupon>> generateCombinations(List<UserCoupon> coupons) {
        List<List<UserCoupon>> result = new ArrayList<>();
        int n = coupons.size();

        for (int mask = 1; mask < (1 << n); mask++) {
            List<UserCoupon> combination = new ArrayList<>();

            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    combination.add(coupons.get(i));
                }
            }

            // 业务上限制单笔订单最多叠加 MAX_STACKED_COUPONS 张：全组合2^n收敛为C(n,1)+C(n,2)
            if (combination.size() <= MAX_STACKED_COUPONS) {
                result.add(combination);
            }
        }

        return result;
    }

    /**
     * 计算优惠券组合的总优惠金额
     * 组合内核销顺序固定：折扣券(discountType=2)先算、每满减/立减后算——
     * "满100减50"与"9折"先后不同结果不同（200元可差5元），顺序是业务规则需写进用户协议，
     * 保证"最优"有唯一解，而不是"组合×顺序"下的偶然最大值
     * @param combination 优惠券组合
     * @param orderAmount 订单总金额
     * @param couponMap 券模板缓存（调用方已批量加载，本方法内禁止逐张查DB）
     * @return 总优惠金额
     */
    private BigDecimal calculateCombinationDiscount(List<UserCoupon> combination, BigDecimal orderAmount,
                                                    Map<Long, Coupon> couponMap) {
        // 固定核销顺序：折扣券在前，其余在后；同类按id稳定排序保证结果可复现
        List<UserCoupon> ordered = new ArrayList<>(combination);
        ordered.sort(Comparator
            .comparing((UserCoupon uc) -> couponMap.get(uc.getCouponId()) != null
                && couponMap.get(uc.getCouponId()).getDiscountType() != null
                && couponMap.get(uc.getCouponId()).getDiscountType() == 2 ? 0 : 1)
            .thenComparing(UserCoupon::getId));

        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal remainingAmount = orderAmount;

        for (UserCoupon userCoupon : ordered) {
            Coupon coupon = couponMap.get(userCoupon.getCouponId());
            if (coupon == null) {
                continue;
            }

            DiscountStrategy strategy = strategyFactory.getStrategy(coupon.getDiscountType());

            if (strategy.canUse(remainingAmount, coupon)) {
                BigDecimal discount = strategy.calculateDiscount(remainingAmount, coupon);
                totalDiscount = totalDiscount.add(discount);
                remainingAmount = remainingAmount.subtract(discount);

                if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }
            }
        }

        if (totalDiscount.compareTo(orderAmount) > 0) {
            totalDiscount = orderAmount;
        }

        return totalDiscount;
    }

    /**
     * 获取优惠券类型描述
     * @param type 类型代码
     * @return 类型描述
     */
    private String getTypeDescription(Integer type) {
        return switch (type) {
            case 1 -> "代金券";
            case 2 -> "折扣券";
            case 3 -> "赠品券";
            default -> "未知类型";
        };
    }

    /**
     * 生成优惠规则描述
     * @param coupon 优惠券对象
     * @return 规则描述
     */
    private String generateRuleDescription(Coupon coupon) {
        StringBuilder sb = new StringBuilder();

        if (coupon.getDiscountType() == 1) {
            sb.append("每满").append(coupon.getThresholdAmount())
              .append("减").append(coupon.getDiscountValue());
        } else if (coupon.getDiscountType() == 2) {
            BigDecimal discountRate = coupon.getDiscountValue()
                .divide(new BigDecimal(10), 1, java.math.RoundingMode.HALF_UP);
            sb.append(discountRate).append("折");
        } else if (coupon.getDiscountType() == 3) {
            if (coupon.getThresholdAmount().compareTo(BigDecimal.ZERO) > 0) {
                sb.append("满").append(coupon.getThresholdAmount());
            }
            sb.append("减").append(coupon.getDiscountValue());
        }

        if (coupon.getMaxDiscountAmount() != null
            && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("，上限").append(coupon.getMaxDiscountAmount());
        }

        return sb.toString();
    }

    /**
     * 获取用户优惠券状态描述
     * @param status 状态代码
     * @return 状态描述
     */
    private String getUserCouponStatusDescription(Integer status) {
        return switch (status) {
            case 1 -> "未使用";
            case 2 -> "已使用";
            case 3 -> "已过期";
            case 4 -> "已锁定";
            default -> "未知状态";
        };
    }

    /**
     * 生成有效期描述
     * @param coupon 优惠券对象
     * @return 有效期描述
     */
    private String generateValidityDescription(Coupon coupon) {
        if (coupon.getTermDays() != null && coupon.getTermDays() > 0) {
            return "领取后" + coupon.getTermDays() + "天有效";
        }

        if (coupon.getTermBeginTime() != null && coupon.getTermEndTime() != null) {
            return coupon.getTermBeginTime().toLocalDate() + "至"
                 + coupon.getTermEndTime().toLocalDate() + "有效";
        }

        return "长期有效";
    }

    /**
     * 生成适用范围描述
     * @param couponId 优惠券ID
     * @param specific 是否指定商品
     * @return 适用范围描述
     */
    private String generateScopeDescription(Long couponId, Integer specific) {
        if (specific == null || specific == 0) {
            return "全场通用";
        }

        List<CouponScope> scopes = couponScopeMapper.findByCouponId(couponId);

        if (scopes.isEmpty()) {
            return "全场通用";
        }

        return "指定商品可用";
    }
}
