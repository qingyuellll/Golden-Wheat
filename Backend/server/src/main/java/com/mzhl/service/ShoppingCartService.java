package com.mzhl.service;

import com.mzhl.dto.ShoppingCartDTO;
import com.mzhl.entity.ShoppingCart;

import java.util.List;

public interface ShoppingCartService {

    /**
     * 添加购物车
     * @param shoppingCartDTO 购物车数据传输对象
     */
    void addShopingCart(ShoppingCartDTO shoppingCartDTO);

    /**
     * 查看购物车列表
     * @return 购物车列表
     */
    List<ShoppingCart> showShoppingCart();

    /**
     * 清空购物车
     */
    void cleanShoppingCart();

    /**
     * 删除购物车中一个商品
     * @param shoppingCartDTO 购物车数据传输对象
     */
    void subShoppingCart(ShoppingCartDTO shoppingCartDTO);
}