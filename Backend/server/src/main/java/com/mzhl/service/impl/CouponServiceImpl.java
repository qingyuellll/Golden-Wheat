package com.mzhl.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.mzhl.constant.MessageConstant;
import com.mzhl.context.BaseContext;
import com.mzhl.dto.CouponDTO;
import com.mzhl.dto.CouponPageQueryDTO;
import com.mzhl.entity.Coupon;
import com.mzhl.entity.CouponScope;
import com.mzhl.exception.BaseException;
import com.mzhl.mapper.CouponMapper;
import com.mzhl.mapper.CouponScopeMapper;
import com.mzhl.result.PageResult;
import com.mzhl.service.CouponService;
import com.mzhl.vo.CouponVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CouponServiceImpl implements CouponService {

    @Autowired
    private CouponMapper couponMapper;

    @Autowired
    private CouponScopeMapper couponScopeMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String COUPON_STOCK_KEY_PREFIX = "coupon:stock:";

    /**
     * 创建优惠券
     * @param couponDTO 优惠券信息传输对象，包含优惠券的基本信息
     */
    @Override
    @Transactional
    public void createCoupon(CouponDTO couponDTO) {
        log.info("开始创建优惠券，参数：{}", couponDTO);

        if (couponDTO.getName() == null || couponDTO.getName().trim().isEmpty()) {
            throw new BaseException("优惠券名称不能为空");
        }

        if (couponDTO.getType() == null || (couponDTO.getType() != 1 && couponDTO.getType() != 2 && couponDTO.getType() != 3)) {
            throw new BaseException("优惠券类型不合法");
        }

        if (couponDTO.getTotalNum() != null && couponDTO.getTotalNum() <= 0) {
            throw new BaseException("发行总量必须大于0");
        }

        Coupon coupon = new Coupon();
        BeanUtils.copyProperties(couponDTO, coupon);

        coupon.setStatus(0);
        coupon.setIssueNum(0);
        coupon.setUsedNum(0);
        coupon.setCreateTime(LocalDateTime.now());
        coupon.setUpdateTime(LocalDateTime.now());

        Long currentId = BaseContext.getCurrentId();
        coupon.setCreator(currentId != null ? String.valueOf(currentId) : "system");
        coupon.setUpdater(currentId != null ? String.valueOf(currentId) : "system");

        couponMapper.insert(coupon);

        if (couponDTO.getSpecific() != null && couponDTO.getSpecific() == 1) {
            List<Long> scopeIds = couponDTO.getScopeIds();

            if (scopeIds != null && !scopeIds.isEmpty()) {
                List<CouponScope> scopeList = new ArrayList<>();

                for (Long scopeId : scopeIds) {
                    CouponScope scope = CouponScope.builder()
                        .couponId(coupon.getId())
                        .bizId(scopeId)
                        //定向券 scopeIds 存的是分类 ID，必须写 TYPE_CATEGORY(2)，
                        //与 checkCouponScope 的查询条件一致（历史上写成 1 导致定向券永远匹配不上）
                        .type(CouponScope.TYPE_CATEGORY)
                        .build();

                    scopeList.add(scope);
                }

                couponScopeMapper.batchInsert(scopeList);
                log.info("优惠券适用范围添加成功，数量：{}", scopeList.size());
            }
        }

        log.info("创建优惠券成功，ID: {}, 名称: {}", coupon.getId(), coupon.getName());
    }

    /**
     * 发布优惠券
     * @param id 优惠券ID
     */
    @Override
    @Transactional
    public void publishCoupon(Long id) {
        log.info("开始发布优惠券，ID：{}", id);

        Coupon coupon = couponMapper.getById(id);

        if (coupon == null) {
            throw new BaseException(MessageConstant.COUPON_NOT_FOUND);
        }

        if (coupon.getStatus() != 0) {
            throw new BaseException("只有草稿状态的优惠券才能发布");
        }

        if (coupon.getIssueBeginTime() == null || coupon.getIssueEndTime() == null) {
            throw new BaseException("请设置可领取时间范围");
        }

        Coupon updateCoupon = new Coupon();
        updateCoupon.setId(id);
        updateCoupon.setStatus(1);
        updateCoupon.setUpdateTime(LocalDateTime.now());

        couponMapper.update(updateCoupon);

        try {
            String stockKey = COUPON_STOCK_KEY_PREFIX + id;
            int remainStock = coupon.getTotalNum() - coupon.getIssueNum();
            redisTemplate.opsForValue().set(stockKey, String.valueOf(remainStock));

            long seconds = java.time.Duration.between(
                LocalDateTime.now(),
                coupon.getIssueEndTime()
            ).getSeconds();

            if (seconds > 0) {
                redisTemplate.expire(stockKey, seconds, TimeUnit.SECONDS);
            }

            log.info("优惠券 {} 已发布，库存已同步到Redis: {}", id, remainStock);

        } catch (Exception e) {
            log.error("同步Redis库存失败", e);
        }

        log.info("发布优惠券成功，ID: {}", id);
    }

    /**
     * 停止优惠券
     * @param id 优惠券ID
     */
    @Override
    @Transactional
    public void stopCoupon(Long id) {
        log.info("开始停止优惠券，ID：{}", id);

        Coupon coupon = couponMapper.getById(id);

        if (coupon == null) {
            throw new BaseException(MessageConstant.COUPON_NOT_FOUND);
        }

        if (coupon.getStatus() != 1) {
            throw new BaseException("只有进行中的优惠券才能停止");
        }

        Coupon updateCoupon = new Coupon();
        updateCoupon.setId(id);
        updateCoupon.setStatus(2);
        updateCoupon.setUpdateTime(LocalDateTime.now());

        couponMapper.update(updateCoupon);

        String stockKey = COUPON_STOCK_KEY_PREFIX + id;
        redisTemplate.delete(stockKey);

        log.info("停止优惠券成功，ID: {}", id);
    }

    /**
     * 分页查询优惠券
     * @param queryDTO 分页查询条件，包含页码、每页大小、查询条件等
     * @return 返回优惠券分页结果
     */
    @Override
    public PageResult pageQuery(CouponPageQueryDTO queryDTO) {
        log.debug("分页查询优惠券，参数：{}", queryDTO);

        PageHelper.startPage(queryDTO.getPage(), queryDTO.getPageSize());

        Page<Coupon> page = couponMapper.pageQuery(queryDTO);

        List<CouponVO> couponVOList = page.stream().map(coupon -> {
            CouponVO vo = new CouponVO();
            BeanUtils.copyProperties(coupon, vo);

            vo.setRemainNum(coupon.getTotalNum() - coupon.getIssueNum());
            vo.setTypeDesc(getTypeDescription(coupon.getType()));
            vo.setRuleDesc(generateRuleDescription(coupon));
            vo.setStatusDesc(getStatusDescription(coupon.getStatus()));
            vo.setValidityDesc(generateValidityDescription(coupon));

            return vo;
        }).collect(Collectors.toList());

        log.debug("分页查询优惠券完成，总数：{}", page.getTotal());
        return new PageResult(page.getTotal(), couponVOList);
    }

    /**
     * 根据ID查询优惠券详情
     * @param id 优惠券ID
     * @return 返回优惠券详情
     */
    @Override
    public CouponVO getById(Long id) {
        log.debug("查询优惠券详情，ID：{}", id);

        Coupon coupon = couponMapper.getById(id);

        if (coupon == null) {
            throw new BaseException(MessageConstant.COUPON_NOT_FOUND);
        }

        CouponVO vo = new CouponVO();
        BeanUtils.copyProperties(coupon, vo);

        vo.setRemainNum(coupon.getTotalNum() - coupon.getIssueNum());
        vo.setTypeDesc(getTypeDescription(coupon.getType()));
        vo.setRuleDesc(generateRuleDescription(coupon));
        vo.setStatusDesc(getStatusDescription(coupon.getStatus()));
        vo.setValidityDesc(generateValidityDescription(coupon));

        return vo;
    }

    /**
     * 删除优惠券
     * @param id 优惠券ID
     */
    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        log.info("开始删除优惠券，ID：{}", id);

        Coupon coupon = couponMapper.getById(id);

        if (coupon == null) {
            throw new BaseException(MessageConstant.COUPON_NOT_FOUND);
        }

        if (coupon.getIssueNum() > 0) {
            throw new BaseException("已有用户领取该优惠券，无法删除");
        }

        couponMapper.delete(id);

        String stockKey = COUPON_STOCK_KEY_PREFIX + id;
        redisTemplate.delete(stockKey);

        log.info("删除优惠券成功，ID: {}", id);
    }

    /**
     * 批量删除优惠券
     * @param ids 优惠券ID列表
     */
    @Override
    @Transactional
    public void deleteBatch(List<Long> ids) {
        log.info("开始批量删除优惠券，ID列表：{}", ids);

        if (ids == null || ids.isEmpty()) {
            throw new BaseException("请选择要删除的优惠券");
        }

        for (Long id : ids) {
            Coupon coupon = couponMapper.getById(id);
            if (coupon != null && coupon.getIssueNum() > 0) {
                throw new BaseException("优惠券【" + coupon.getName() + "】已有用户领取，无法删除");
            }
        }

        couponMapper.deleteByIds(ids);

        for (Long id : ids) {
            String stockKey = COUPON_STOCK_KEY_PREFIX + id;
            redisTemplate.delete(stockKey);
        }

        log.info("批量删除优惠券成功，数量：{}", ids.size());
    }

    /**
     * 修改优惠券
     * @param couponDTO 优惠券数据传输对象，包含优惠券的修改信息
     */
    @Override
    @Transactional
    public void updateCoupon(CouponDTO couponDTO) {
        log.info("开始修改优惠券，参数：{}", couponDTO);

        if (couponDTO.getId() == null) {
            throw new BaseException("优惠券ID不能为空");
        }

        Coupon existing = couponMapper.getById(couponDTO.getId());
        if (existing == null) {
            throw new BaseException(MessageConstant.COUPON_NOT_FOUND);
        }

        if (existing.getStatus() != 0) {
            throw new BaseException("只有草稿状态的优惠券才能修改");
        }

        Coupon coupon = new Coupon();
        BeanUtils.copyProperties(couponDTO, coupon);
        coupon.setUpdateTime(LocalDateTime.now());

        Long currentId = BaseContext.getCurrentId();
        coupon.setUpdater(currentId != null ? String.valueOf(currentId) : "system");

        couponMapper.update(coupon);

        couponScopeMapper.deleteByCouponId(couponDTO.getId());

        if (couponDTO.getSpecific() != null && couponDTO.getSpecific() == 1) {
            List<Long> scopeIds = couponDTO.getScopeIds();
            if (scopeIds != null && !scopeIds.isEmpty()) {
                List<CouponScope> scopeList = new ArrayList<>();
                for (Long scopeId : scopeIds) {
                    CouponScope scope = CouponScope.builder()
                        .couponId(couponDTO.getId())
                        .bizId(scopeId)
                        //与查询侧保持一致，存分类类型
                        .type(CouponScope.TYPE_CATEGORY)
                        .build();
                    scopeList.add(scope);
                }
                couponScopeMapper.batchInsert(scopeList);
                log.info("优惠券适用范围更新成功，数量：{}", scopeList.size());
            }
        }

        log.info("修改优惠券成功，ID: {}", couponDTO.getId());
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
     * 获取状态描述
     * @param status 状态代码
     * @return 状态描述
     */
    private String getStatusDescription(Integer status) {
        return switch (status) {
            case 0 -> "草稿";
            case 1 -> "进行中";
            case 2 -> "已停止";
            case 3 -> "已过期";
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
}
