package com.mzhl.mapper;

import com.mzhl.entity.ExchangeCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ExchangeCodeMapper {

    /**
     * 插入兑换码
     * @param exchangeCode 需要插入的兑换码对象，包含兑换码的基本信息
     */
    void insert(ExchangeCode exchangeCode);

    /**
     * 根据兑换码查询
     * @param code 兑换码字符串
     * @return 返回对应兑换码的ExchangeCode对象
     */
    @Select("select * from exchange_code where code = #{code}")
    ExchangeCode findByCode(String code);

    /**
     * 使用兑换码
     * @param code 兑换码
     * @param userId 用户ID
     */
    @Update("update exchange_code set status = 1, user_id = #{userId}, update_time = now() " +
            "where code = #{code} and status = 0 and expired_time > now()")
    void useCode(@Param("code") String code, @Param("userId") Long userId);

    /**
     * 使兑换码失效
     * @param code 兑换码
     */
    @Update("update exchange_code set status = 2, update_time = now() where code = #{code}")
    void invalidateCode(String code);
}
