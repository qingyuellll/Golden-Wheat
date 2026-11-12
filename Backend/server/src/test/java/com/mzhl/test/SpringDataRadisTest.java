package com.mzhl.test;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.*;

import java.util.concurrent.TimeUnit;

//@SpringBootTest
public class SpringDataRadisTest {
    //@Autowired
    private RedisTemplate redisTemplate;

    @Test
    public void testRedisTemplate(){
        System.out.println(redisTemplate);
        ValueOperations valueOperations = redisTemplate.opsForValue();
        HashOperations hashOperations = redisTemplate.opsForHash();
        ListOperations listOperations = redisTemplate.opsForList();
        SetOperations setOperations = redisTemplate.opsForSet();
        ZSetOperations zSetOperations = redisTemplate.opsForZSet();



    }

    /**
     * 测试字符串相关功能的测试方法
     * 该方法用于验证字符串处理的各种操作和场景
     */
    @Test
    public void testString(){
        //set get setex setnx
        redisTemplate.opsForValue().set("city","北京");
        String city = (String) redisTemplate.opsForValue().get("city");
        System.out.println(city);
        redisTemplate.opsForValue().set("cit","上海",6, TimeUnit.SECONDS);
        redisTemplate.opsForValue().setIfAbsent("lock","1");
        redisTemplate.opsForValue().setIfAbsent("lock","2");
    }
    /**
     * 测试哈希相关功能的测试方法
     * 该方法用于验证哈希算法的正确性和性能
     */
    @Test
    public void testHash(){
        HashOperations hashOperations = redisTemplate.opsForHash();


        redisTemplate.opsForHash().put("user","name","张三");
        redisTemplate.opsForHash().put("user","age","18");

        String name = (String)hashOperations.get("user","name");
        System.out.println(name);


        hashOperations.keys("user");
        System.out.println(hashOperations.keys("user"));

        hashOperations.values("user");
        System.out.println(hashOperations.values("user"));

        hashOperations.delete("user","age");
    }

}