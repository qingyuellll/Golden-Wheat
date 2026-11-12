package com.mzhl.mapper;

import com.mzhl.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.Map;

@Mapper
public interface UserMapper {

    @Select("select * from user where openid=#{openid}")
    User getByOpenid(String openid);

    @Select("select * from user where phone=#{phone}")
    User getByPhone(String phone);

    void insert(User user);

    User getById(Long userId);

    Integer countByMap(Map map);
}
