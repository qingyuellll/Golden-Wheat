package com.mzhl.mapper;

import com.github.pagehelper.Page;
import com.mzhl.dto.CouponPageQueryDTO;
import com.mzhl.entity.Coupon;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface CouponMapper {

    /**
     * 插入优惠券
     * @param coupon 需要插入的优惠券对象，包含优惠券的基本信息
     */
    void insert(Coupon coupon);

    /**
     * 更新优惠券信息
     * @param coupon 需要更新的优惠券对象，包含优惠券ID和需要更新的字段
     */
    void update(Coupon coupon);

    /**
     * 删除优惠券（逻辑删除）
     * @param id 优惠券ID
     */
    @Update("update coupon set status = 2, update_time = now() where id = #{id}")
    void delete(Long id);

    /**
     * 根据ID查询优惠券
     * @param id 优惠券ID
     * @return 返回对应ID的Coupon对象
     */
    @Select("select * from coupon where id = #{id}")
    Coupon getById(Long id);

    /**
     * 批量按ID查询优惠券（一次DB替代N次getById，用于最优组合计算的模板加载）
     * @param ids 优惠券模板ID列表
     * @return 返回对应的Coupon列表
     */
    @Select("<script>select * from coupon where id in " +
            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>#{id}</foreach>" +
            "</script>")
    List<Coupon> getByIds(@Param("ids") List<Long> ids);

    /**
     * 分页查询优惠券
     * @param couponPageQueryDTO 优惠券分页查询条件对象，包含页码、每页大小、查询条件等
     * @return 返回一个包含优惠券信息的Page对象，分页结果集
     */
    Page<Coupon> pageQuery(CouponPageQueryDTO couponPageQueryDTO);

    /**
     * 查询进行中的优惠券列表
     * @return 返回所有进行中的优惠券列表
     */
    List<Coupon> findActiveCoupons();

    /**
     * 增加已发放数量（带库存校验）
     * @param id 优惠券ID
     * @param increment 增加的数量
     * @return 影响行数，0表示库存不足未发放
     */
    @Update("update coupon set issue_num = issue_num + #{increment}, update_time = now() " +
            "where id = #{id} and issue_num < total_num")
    int increaseIssueNum(@Param("id") Long id, @Param("increment") int increment);

    /**
     * 增加已使用数量
     * @param id 优惠券ID
     */
    @Update("update coupon set used_num = used_num + 1, update_time = now() where id = #{id}")
    void increaseUsedNum(Long id);

    /**
     * 减少已发放数量
     * @param id 优惠券ID
     * @param decrement 减少的数量
     */
    @Update("update coupon set issue_num = issue_num - #{decrement}, update_time = now() " +
            "where id = #{id} and issue_num >= #{decrement}")
    void decreaseIssueNum(@Param("id") Long id, @Param("decrement") int decrement);

    /**
     * 批量删除优惠券（逻辑删除，设置状态为已停止）
     * @param ids 优惠券ID列表
     */
    void deleteByIds(@Param("ids") List<Long> ids);
}
