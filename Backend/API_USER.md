# 金麦（mzhl）C端用户接口文档

> 版本：v2.0  
> 适用对象：前端开发团队  
> 后端服务：Spring Boot 3.x（Jakarta）  
> 服务端口：`8080`，无 context-path（接口根路径为 `http://<host>:8080`）  
> 默认 Profile：`dev`

---

## 目录

- [全局约定](#全局约定)
- [1. 用户模块](#1-用户模块)
  - [1.1 微信用户登录](#11-微信用户登录)
- [2. 商铺模块](#2-商铺模块)
  - [2.1 获取营业状态](#21-获取营业状态)
- [3. 分类模块](#3-分类模块)
  - [3.1 查询分类列表](#31-查询分类列表)
- [4. 菜品模块](#4-菜品模块)
  - [4.1 根据ID查询菜品](#41-根据id查询菜品)
  - [4.2 根据分类ID查询菜品列表](#42-根据分类id查询菜品列表)
  - [4.3 测试接口](#43-测试接口)
- [5. 套餐模块](#5-套餐模块)
  - [5.1 根据分类ID查询套餐](#51-根据分类id查询套餐)
  - [5.2 根据套餐ID查询包含的菜品列表](#52-根据套餐id查询包含的菜品列表)
- [6. 购物车模块](#6-购物车模块)
  - [6.1 添加购物车](#61-添加购物车)
  - [6.2 查询购物车列表](#62-查询购物车列表)
  - [6.3 删除购物车中一个商品](#63-删除购物车中一个商品)
  - [6.4 清空购物车](#64-清空购物车)
- [7. 地址簿模块](#7-地址簿模块)
  - [7.1 查询当前用户的所有地址](#71-查询当前用户的所有地址)
  - [7.2 新增地址](#72-新增地址)
  - [7.3 根据ID查询地址](#73-根据id查询地址)
  - [7.4 根据ID修改地址](#74-根据id修改地址)
  - [7.5 设置默认地址](#75-设置默认地址)
  - [7.6 根据ID删除地址](#76-根据id删除地址)
  - [7.7 查询默认地址](#77-查询默认地址)
- [8. 订单模块](#8-订单模块)
  - [8.1 用户下单](#81-用户下单)
  - [8.2 订单支付](#82-订单支付)
  - [8.3 历史订单分页查询](#83-历史订单分页查询)
  - [8.4 查询订单详情](#84-查询订单详情)
  - [8.5 取消订单](#85-取消订单)
  - [8.6 再来一单](#86-再来一单)
  - [8.7 催单](#87-催单)
- [9. 优惠券模块](#9-优惠券模块)
  - [9.1 查询可领取的优惠券](#91-查询可领取的优惠券)
  - [9.2 领取优惠券](#92-领取优惠券)
  - [9.3 兑换码领取优惠券](#93-兑换码领取优惠券)
  - [9.4 查询我的优惠券](#94-查询我的优惠券)
  - [9.5 计算订单可用优惠券](#95-计算订单可用优惠券)
  - [9.6 查找最优优惠券组合](#96-查找最优优惠券组合)
- [10. 聊天模块（AI 客服）](#10-聊天模块ai-客服)
  - [10.1 流式对话（SSE）](#101-流式对话sse)
- [11. 支付回调模块](#11-支付回调模块)
  - [11.1 微信支付成功回调](#111-微信支付成功回调)
- [附录 A：通用响应结构 Result&lt;T&gt;](#附录-a通用响应结构-resultt)
- [附录 B：分页响应结构 PageResult](#附录-b分页响应结构-pageresult)
- [附录 C：枚举与状态码](#附录-c枚举与状态码)

---

## 全局约定

### 请求 Base URL

```
http://<host>:8080
```

### 鉴权说明（C 端用户）

- 用户端 JWT 通过请求头 `authentication` 传递。
- Token 在登录接口（`POST /user/user/login`）成功后由后端返回。
- 服务端通过 `JwtTokenUserInterceptor` 拦截 `/user/**` 下所有请求进行 Token 校验，**未携带或非法 Token 返回 HTTP 401**。
- **无需鉴权**的白名单路径（即拦截器排除路径）：
  - `POST /user/user/login`（登录）
  - `GET  /user/shop/status`（获取营业状态）
  - `GET  /user/coupon/available`（查询可领取优惠券）

### 鉴权说明（管理端，仅作参考）

- 管理端 JWT 通过请求头 `token` 传递，拦截路径 `/admin/**`。前端 C 端通常不涉及。

### 不走 JWT 拦截器的路由

- `GET /api/chat/stream`（AI 流式对话，路径前缀为 `/api`，不在 `/user/**` 下，**无需 Token**）
- `POST|GET|... /notify/paySuccess`（微信支付回调，路径前缀为 `/notify`，**无需 Token**，仅微信侧调用）

### 统一响应结构

所有接口（除 SSE 流式与支付回调）均返回 `Result<T>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | Integer | 1=成功；0及其它=失败 |
| msg | String | 错误信息（成功时通常为 null） |
| data | T | 业务数据（成功时返回；失败时通常为 null） |

> 详细结构见 [附录 A](#附录-a通用响应结构-resultt)。

### 时间格式

- 后端通过 Jackson 自定义序列化：`LocalDateTime → yyyy-MM-dd HH:mm:ss`。
- `OrdersSubmitDTO.estimatedDeliveryTime` 显式标注 `@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")`，前端按此字符串格式提交。

### 编码与 Content-Type

- 请求体：`Content-Type: application/json;charset=UTF-8`。
- 响应体：`application/json;charset=UTF-8`（除 SSE 流式接口）。

---

## 1. 用户模块

> Controller：`com.mzhl.controller.user.UserController`  
> 根路径：`/user/user`

### 1.1 微信用户登录

- **接口**：`POST /user/user/login`
- **说明**：通过微信 code 换取用户身份，返回 JWT Token。**无需鉴权**。
- **请求头**：无特殊请求头。

#### 请求参数（Body：`UserLoginDTO`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| code | String | 是 | 微信小程序 `wx.login()` 返回的临时登录凭证 code |

#### 请求示例

```json
{
  "code": "0a3xxxXX0xxxxX0"
}
```

#### 响应字段（`Result<UserLoginVO>` → `data`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 用户ID |
| openid | String | 微信用户的 openid |
| token | String | JWT 令牌，后续请求需放入请求头 `authentication` |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 1001,
    "openid": "oAbCdEfGhIjKlMnOpQrStUvWxYz",
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMDAxLCJleHAiOjE5..."
  }
}
```

---

## 2. 商铺模块

> Controller：`com.mzhl.controller.user.ShopController`  
> 根路径：`/user/shop`

### 2.1 获取营业状态

- **接口**：`GET /user/shop/status`
- **说明**：从 Redis（key=`SHOP_STATUS`）读取店铺营业状态。**无需鉴权**。
- **请求头**：无特殊请求头。

#### 请求参数

无。

#### 响应字段（`Result<Integer>` → `data`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| data | Integer | 营业状态：`1` 营业中；其它值（如 0）表示打烊中 |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": 1
}
```

### 2.2 获取店铺公开配置

- **接口**：`GET /user/shop/config`
- **说明**：返回营业状态与每单固定打包费。打包费与下单时服务端实际核算使用的是同一项配置，下单页据此展示金额，**无需鉴权**。
- **请求头**：无特殊请求头。

#### 请求参数

无。

#### 响应字段（`Result<ShopConfigVO>` → `data`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| status | Integer | 营业状态：`1` 营业中；`0` 打烊中 |
| packFee | BigDecimal | 每单固定打包费（元） |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "status": 1,
    "packFee": 3
  }
}
```

---

## 3. 分类模块

> Controller：`com.mzhl.controller.user.CategoryController`  
> 根路径：`/user/category`

### 3.1 查询分类列表

- **接口**：`GET /user/category/list`
- **说明**：根据类型查询启用的分类列表。
- **请求头**：`authentication: <token>`（需登录）

#### 请求参数（Query）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| type | Integer | 否 | 分类类型：`1` 菜品分类；`2` 套餐分类。不传则查全部 |

#### 请求示例

```
GET /user/category/list?type=1
```

#### 响应字段（`Result<List<Category>>` → `data`，数组项结构）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 分类ID |
| type | Integer | 分类类型：1 菜品分类 2 套餐分类 |
| name | String | 分类名称 |
| sort | Integer | 排序序号 |
| status | Integer | 状态：0 禁用 1 启用 |
| createTime | String | 创建时间（`yyyy-MM-dd HH:mm:ss`） |
| updateTime | String | 更新时间 |
| createUser | Long | 创建人ID |
| updateUser | Long | 修改人ID |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 1,
      "type": 1,
      "name": "川菜",
      "sort": 1,
      "status": 1,
      "createTime": "2026-09-01 10:00:00",
      "updateTime": "2026-09-01 10:00:00",
      "createUser": 1,
      "updateUser": 1
    }
  ]
}
```

---

## 4. 菜品模块

> Controller：`com.mzhl.controller.user.DishController`  
> 根路径：`/user/dish`

### 4.1 根据ID查询菜品

- **接口**：`GET /user/dish/{id}`
- **说明**：根据菜品ID查询菜品详情，返回值包含口味列表，供详情页渲染规格选项。**无需鉴权**。
- **请求头**：无特殊请求头。

#### 请求参数（Path）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 菜品ID |

#### 请求示例

```
GET /user/dish/10
```

#### 响应字段（`Result<DishVO>` → `data`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 菜品ID |
| name | String | 菜品名称 |
| categoryId | Long | 所属分类ID |
| price | BigDecimal | 菜品价格 |
| image | String | 图片 URL |
| description | String | 描述信息 |
| status | Integer | 售卖状态：0 停售 1 起售 |
| categoryName | String | 分类名称 |
| flavors | Array | 口味列表，元素含 `name`（口味名）与 `value`（可选值 JSON 数组字符串） |
| createTime | String | 创建时间 |
| updateTime | String | 更新时间 |
| createUser | Long | 创建人ID |
| updateUser | Long | 修改人ID |

> 备注：当菜品不存在或查询异常时，`code=0`、`msg` 为错误描述（如 `"菜品不存在"`）。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 10,
    "name": "宫保鸡丁",
    "categoryId": 1,
    "price": 28.00,
    "image": "https://oss.example.com/dish/10.jpg",
    "description": "经典川菜",
    "status": 1,
    "createTime": "2026-09-01 10:00:00",
    "updateTime": "2026-09-01 10:00:00",
    "createUser": 1,
    "updateUser": 1
  }
}
```

### 4.2 根据分类ID查询菜品列表

- **接口**：`GET /user/dish/list`
- **说明**：根据分类ID查询该分类下所有起售菜品（含口味）。命中 Redis 缓存（key=`dish_<categoryId>`）时直接返回。
- **请求头**：`authentication: <token>`

#### 请求参数（Query）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| categoryId | Long | 是 | 菜品分类ID |

#### 请求示例

```
GET /user/dish/list?categoryId=1
```

#### 响应字段（`Result<List<DishVO>>` → `data`，数组项结构）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 菜品ID |
| name | String | 菜品名称 |
| categoryId | Long | 分类ID |
| price | BigDecimal | 价格 |
| image | String | 图片 URL |
| description | String | 描述信息 |
| status | Integer | 售卖状态：0 停售 1 起售 |
| updateTime | String | 更新时间 |
| categoryName | String | 分类名称 |
| flavors | List&lt;DishFlavor&gt; | 菜品关联的口味列表 |

`DishFlavor` 结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 口味ID |
| dishId | Long | 关联菜品ID |
| name | String | 口味名称（如"甜度"） |
| value | String | 口味可选值（JSON 字符串数组，如 `["全糖","半糖"]`） |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 10,
      "name": "宫保鸡丁",
      "categoryId": 1,
      "price": 28.00,
      "image": "https://oss.example.com/dish/10.jpg",
      "description": "经典川菜",
      "status": 1,
      "updateTime": "2026-09-01 10:00:00",
      "categoryName": "川菜",
      "flavors": [
        {
          "id": 1,
          "dishId": 10,
          "name": "辣度",
          "value": "[\"微辣\",\"中辣\",\"特辣\"]"
        }
      ]
    }
  ]
}
```

### 4.3 测试接口

- **接口**：`GET /user/dish/test`
- **说明**：测试用接口，返回固定字符串。**未标注 `@Operation`，仅供联调测试**。
- **请求头**：`authentication: <token>`

#### 请求参数

无。

#### 响应字段（`Result<String>` → `data`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| data | String | 固定值 `"test ok"` |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": "test ok"
}
```

---

## 5. 套餐模块

> Controller：`com.mzhl.controller.user.SetmealController`  
> 根路径：`/user/setmeal`

### 5.1 根据分类ID查询套餐

- **接口**：`GET /user/setmeal/list`
- **说明**：根据分类ID查询启用状态的套餐列表。结果通过 Spring Cache 缓存（`cacheNames=setmealCache`，`key=#categoryId`）。
- **请求头**：`authentication: <token>`

#### 请求参数（Query）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| categoryId | Long | 是 | 套餐分类ID |

#### 请求示例

```
GET /user/setmeal/list?categoryId=2
```

#### 响应字段（`Result<List<Setmeal>>` → `data`，数组项结构）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 套餐ID |
| categoryId | Long | 分类ID |
| name | String | 套餐名称 |
| price | BigDecimal | 套餐价格 |
| status | Integer | 状态：0 停用 1 启用 |
| description | String | 描述信息 |
| image | String | 图片 URL |
| createTime | String | 创建时间 |
| updateTime | String | 更新时间 |
| createUser | Long | 创建人ID |
| updateUser | Long | 修改人ID |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 100,
      "categoryId": 2,
      "name": "情侣套餐",
      "price": 88.00,
      "status": 1,
      "description": "适合两人用餐",
      "image": "https://oss.example.com/setmeal/100.jpg",
      "createTime": "2026-09-01 10:00:00",
      "updateTime": "2026-09-01 10:00:00",
      "createUser": 1,
      "updateUser": 1
    }
  ]
}
```

### 5.2 根据套餐ID查询包含的菜品列表

- **接口**：`GET /user/setmeal/dish/{id}`
- **说明**：根据套餐ID查询该套餐包含的菜品列表。
- **请求头**：`authentication: <token>`

#### 请求参数（Path）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 套餐ID |

#### 请求示例

```
GET /user/setmeal/dish/100
```

#### 响应字段（`Result<List<DishItemVO>>` → `data`，数组项结构）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | String | 菜品名称 |
| copies | Integer | 份数 |
| image | String | 菜品图片 URL |
| description | String | 菜品描述 |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "name": "宫保鸡丁",
      "copies": 1,
      "image": "https://oss.example.com/dish/10.jpg",
      "description": "经典川菜"
    },
    {
      "name": "米饭",
      "copies": 2,
      "image": "https://oss.example.com/dish/20.jpg",
      "description": "东北大米"
    }
  ]
}
```

### 5.3 根据套餐ID查询套餐详情

- **接口**：`GET /user/setmeal/{id}`
- **说明**：查询套餐基本信息，供 C 端套餐详情页展示。停售或不存在时返回 `code=0`。**无需鉴权**。
- **请求头**：无特殊请求头。

#### 请求参数（Path）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 套餐ID |

#### 请求示例

```
GET /user/setmeal/100
```

#### 响应字段（`Result<Setmeal>` → `data`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 套餐ID |
| categoryId | Long | 分类ID |
| name | String | 套餐名称 |
| price | BigDecimal | 套餐价格（元） |
| status | Integer | 状态：1 起售；0 停售 |
| description | String | 套餐描述 |
| image | String | 套餐图片 URL |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 100,
    "categoryId": 2,
    "name": "双人商务套餐",
    "price": 68.00,
    "status": 1,
    "description": "两人份荤素搭配",
    "image": "https://oss.example.com/setmeal/100.jpg"
  }
}
```

---

## 6. 购物车模块

> Controller：`com.mzhl.controller.user.ShoppingCartController`  
> 根路径：`/user/shoppingCart`

### 6.1 添加购物车

- **接口**：`POST /user/shoppingCart/add`
- **说明**：将菜品或套餐加入购物车（同菜品同口味数量+1，不存在则新建）。
- **请求头**：`authentication: <token>`，`Content-Type: application/json`

#### 请求参数（Body：`ShoppingCartDTO`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| dishId | Long | 否 | 菜品ID。添加菜品时传，与 `setmealId` 二选一 |
| setmealId | Long | 否 | 套餐ID。添加套餐时传，与 `dishId` 二选一 |
| dishFlavor | String | 否 | 菜品口味（当选择菜品并指定口味时传） |

#### 请求示例

```json
{
  "dishId": 10,
  "dishFlavor": "中辣"
}
```

#### 响应字段

`Result<Void>`，仅返回标准 `code/msg`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 6.2 查询购物车列表

- **接口**：`GET /user/shoppingCart/list`
- **说明**：查询当前登录用户的购物车列表（按创建时间倒序）。
- **请求头**：`authentication: <token>`

#### 请求参数

无。

#### 响应字段（`Result<List<ShoppingCart>>` → `data`，数组项结构）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 购物车条目ID |
| name | String | 菜品/套餐名称 |
| userId | Long | 用户ID |
| dishId | Long | 菜品ID（套餐时为 null） |
| setmealId | Long | 套餐ID（菜品时为 null） |
| dishFlavor | String | 口味 |
| number | Integer | 数量 |
| amount | BigDecimal | 单价/金额 |
| image | String | 图片 URL |
| createTime | String | 加入购物车时间 |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 1,
      "name": "宫保鸡丁",
      "userId": 1001,
      "dishId": 10,
      "setmealId": null,
      "dishFlavor": "中辣",
      "number": 2,
      "amount": 28.00,
      "image": "https://oss.example.com/dish/10.jpg",
      "createTime": "2026-09-17 12:00:00"
    }
  ]
}
```

### 6.3 删除购物车中一个商品

- **接口**：`POST /user/shoppingCart/sub`
- **说明**：将购物车中指定菜品/套餐的数量减 1；数量减到 0 时删除该条目。
- **请求头**：`authentication: <token>`，`Content-Type: application/json`

#### 请求参数（Body：`ShoppingCartDTO`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| dishId | Long | 否 | 菜品ID |
| setmealId | Long | 否 | 套餐ID |
| dishFlavor | String | 否 | 口味（用于唯一定位同菜品不同口味的条目） |

#### 请求示例

```json
{
  "dishId": 10,
  "dishFlavor": "中辣"
}
```

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 6.4 清空购物车

- **接口**：`DELETE /user/shoppingCart/clean`
- **说明**：清空当前用户的购物车。
- **请求头**：`authentication: <token>`

#### 请求参数

无。

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

---

## 7. 地址簿模块

> Controller：`com.mzhl.controller.user.AddressBookController`  
> 根路径：`/user/addressBook`

### 7.1 查询当前用户的所有地址

- **接口**：`GET /user/addressBook/list`
- **说明**：查询当前登录用户的所有收货地址。
- **请求头**：`authentication: <token>`

#### 请求参数

无。

#### 响应字段（`Result<List<AddressBook>>` → `data`，数组项结构）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 地址ID |
| userId | Long | 用户ID |
| consignee | String | 收货人（注意：JSON 字段名为 `consignee`；前端如传 `name` 会被 `getName()/setName()` 别名映射到 `consignee`） |
| phone | String | 手机号 |
| sex | String | 性别：`0` 女 `1` 男 |
| provinceCode | String | 省级编码 |
| provinceName | String | 省名 |
| cityCode | String | 市级编码 |
| cityName | String | 市名 |
| districtCode | String | 区级编码 |
| districtName | String | 区名 |
| detail | String | 详细地址 |
| label | String | 标签（如"家"、"公司"） |
| isDefault | Integer | 是否默认：0 否 1 是 |
| createTime | String | 创建时间 |
| updateTime | String | 更新时间 |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 5,
      "userId": 1001,
      "consignee": "张三",
      "phone": "13800138000",
      "sex": "1",
      "provinceCode": "110000",
      "provinceName": "北京市",
      "cityCode": "110100",
      "cityName": "北京市",
      "districtCode": "110105",
      "districtName": "朝阳区",
      "detail": "xx路xx号",
      "label": "家",
      "isDefault": 1,
      "createTime": "2026-09-01 10:00:00",
      "updateTime": "2026-09-01 10:00:00"
    }
  ]
}
```

### 7.2 新增地址

- **接口**：`POST /user/addressBook`
- **说明**：新增一条收货地址。
- **请求头**：`authentication: <token>`，`Content-Type: application/json`

#### 请求参数（Body：`AddressBook`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| consignee | String | 是 | 收货人（也可用别名 `name` 传） |
| phone | String | 是 | 手机号 |
| sex | String | 否 | 性别：0 女 1 男 |
| provinceCode | String | 否 | 省级编码 |
| provinceName | String | 否 | 省名 |
| cityCode | String | 否 | 市级编码 |
| cityName | String | 否 | 市名 |
| districtCode | String | 否 | 区级编码 |
| districtName | String | 否 | 区名 |
| detail | String | 是 | 详细地址 |
| label | String | 否 | 标签 |
| isDefault | Integer | 否 | 是否默认：0 否 1 是 |

#### 请求示例

```json
{
  "consignee": "李四",
  "phone": "13900139000",
  "sex": "0",
  "provinceCode": "110000",
  "provinceName": "北京市",
  "cityCode": "110100",
  "cityName": "北京市",
  "districtCode": "110105",
  "districtName": "朝阳区",
  "detail": "yy路yy号",
  "label": "公司",
  "isDefault": 0
}
```

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 7.3 根据ID查询地址

- **接口**：`GET /user/addressBook/{id}`
- **说明**：根据地址ID查询单条地址详情。
- **请求头**：`authentication: <token>`

#### 请求参数（Path）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 地址ID |

#### 请求示例

```
GET /user/addressBook/5
```

#### 响应字段（`Result<AddressBook>` → `data`）

字段同 [7.1 响应字段](#71-查询当前用户的所有地址) 中的数组项。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 5,
    "userId": 1001,
    "consignee": "张三",
    "phone": "13800138000",
    "sex": "1",
    "provinceCode": "110000",
    "provinceName": "北京市",
    "cityCode": "110100",
    "cityName": "北京市",
    "districtCode": "110105",
    "districtName": "朝阳区",
    "detail": "xx路xx号",
    "label": "家",
    "isDefault": 1,
    "createTime": "2026-09-01 10:00:00",
    "updateTime": "2026-09-01 10:00:00"
  }
}
```

### 7.4 根据ID修改地址

- **接口**：`PUT /user/addressBook`
- **说明**：根据请求体中的 `id` 修改地址信息。
- **请求头**：`authentication: <token>`，`Content-Type: application/json`

#### 请求参数（Body：`AddressBook`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 地址ID |
| 其他字段 | - | 否 | 同新增接口，需要修改的字段 |

#### 请求示例

```json
{
  "id": 5,
  "consignee": "张三",
  "phone": "13800138001",
  "detail": "xx路xx号3栋",
  "isDefault": 1
}
```

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 7.5 设置默认地址

- **接口**：`PUT /user/addressBook/default`
- **说明**：将指定地址设为默认（同时取消原默认地址）。
- **请求头**：`authentication: <token>`，`Content-Type: application/json`

#### 请求参数（Body：`AddressBook`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 需设为默认的地址ID |
| userId | Long | 否 | 用户ID（一般由后端补全） |

#### 请求示例

```json
{
  "id": 5
}
```

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 7.6 根据ID删除地址

- **接口**：`DELETE /user/addressBook?id={id}`
- **说明**：根据地址ID删除一条地址。
- **请求头**：`authentication: <token>`

#### 请求参数（Query）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 地址ID |

#### 请求示例

```
DELETE /user/addressBook?id=5
```

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 7.7 查询默认地址

- **接口**：`GET /user/addressBook/default`
- **说明**：查询当前用户的默认收货地址。无默认地址时返回 `code=0`、`msg="没有查询到默认地址"`。
- **请求头**：`authentication: <token>`

#### 请求参数

无。

#### 响应字段（`Result<AddressBook>` → `data`）

字段同 [7.1 响应字段](#71-查询当前用户的所有地址) 中的数组项。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 5,
    "userId": 1001,
    "consignee": "张三",
    "phone": "13800138000",
    "sex": "1",
    "provinceCode": "110000",
    "provinceName": "北京市",
    "cityCode": "110100",
    "cityName": "北京市",
    "districtCode": "110105",
    "districtName": "朝阳区",
    "detail": "xx路xx号",
    "label": "家",
    "isDefault": 1,
    "createTime": "2026-09-01 10:00:00",
    "updateTime": "2026-09-01 10:00:00"
  }
}
```

无默认地址时：

```json
{
  "code": 0,
  "msg": "没有查询到默认地址",
  "data": null
}
```

---

## 8. 订单模块

> Controller：`com.mzhl.controller.user.OrderController`  
> 根路径：`/user/order`

### 8.1 用户下单

- **接口**：`POST /user/order/submit`
- **说明**：用户提交订单，返回订单ID、订单号、订单金额、下单时间。
- **请求头**：`authentication: <token>`，`Content-Type: application/json`

#### 请求参数（Body：`OrdersSubmitDTO`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| addressBookId | Long | 是 | 地址簿ID |
| payMethod | int | 是 | 支付方式：1 微信 2 支付宝 |
| remark | String | 否 | 订单备注 |
| estimatedDeliveryTime | String | 否 | 预计送达时间（`yyyy-MM-dd HH:mm:ss`）。当 `deliveryStatus=0` 时必填 |
| deliveryStatus | Integer | 是 | 配送状态：1 立即送出 0 选择具体时间 |
| tablewareNumber | Integer | 是 | 餐具数量 |
| tablewareStatus | Integer | 是 | 餐具状态：1 按餐量提供 0 选择具体数量 |
| packAmount | Integer | 是 | 打包费（元） |
| amount | BigDecimal | 是 | 总金额（元） |
| userCouponIds | List&lt;Long&gt; | 否 | 使用的用户优惠券ID列表（支持多张叠加） |
| discountAmount | BigDecimal | 否 | 优惠金额（元） |

#### 请求示例

```json
{
  "addressBookId": 5,
  "payMethod": 1,
  "remark": "少放辣",
  "estimatedDeliveryTime": "2026-09-17 12:30:00",
  "deliveryStatus": 0,
  "tablewareNumber": 2,
  "tablewareStatus": 0,
  "packAmount": 3,
  "amount": 59.00,
  "userCouponIds": [201, 202],
  "discountAmount": 10.00
}
```

#### 响应字段（`Result<OrderSubmitVO>` → `data`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 订单ID |
| orderNumber | String | 订单号 |
| orderAmount | BigDecimal | 订单金额 |
| orderTime | String | 下单时间（`yyyy-MM-dd HH:mm:ss`） |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 9001,
    "orderNumber": "2026091712000001",
    "orderAmount": 59.00,
    "orderTime": "2026-09-17 12:00:00"
  }
}
```

### 8.2 订单支付

- **接口**：`PUT /user/order/payment`
- **说明**：根据订单号生成预支付交易单并立即触发支付成功逻辑（演示环境直接调用了 `paySuccess`）。
- **请求头**：`authentication: <token>`，`Content-Type: application/json`

#### 请求参数（Body：`OrdersPaymentDTO`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| orderNumber | String | 是 | 订单号 |
| payMethod | Integer | 否 | 付款方式：1 微信 2 支付宝 |

#### 请求示例

```json
{
  "orderNumber": "2026091712000001",
  "payMethod": 1
}
```

#### 响应字段（`Result<OrderPaymentVO>` → `data`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| nonceStr | String | 随机字符串 |
| paySign | String | 签名 |
| timeStamp | String | 时间戳（秒） |
| signType | String | 签名算法（如 `RSA`） |
| packageStr | String | 统一下单返回的 `prepay_id` 参数值 |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "nonceStr": "abc123",
    "paySign": "xxxxSIGN",
    "timeStamp": "1692331200",
    "signType": "RSA",
    "packageStr": "prepay_id=wx202609171200"
  }
}
```

### 8.3 历史订单分页查询

- **接口**：`GET /user/order/historyOrders`
- **说明**：分页查询当前用户的历史订单，可按状态过滤。
- **请求头**：`authentication: <token>`

#### 请求参数（Query）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | int | 是 | 当前页码（从 1 开始） |
| pageSize | int | 是 | 每页大小 |
| status | Integer | 否 | 订单状态：1 待付款 2 待接单 3 已接单 4 派送中 5 已完成 6 已取消。不传则查询全部 |

#### 请求示例

```
GET /user/order/historyOrders?page=1&pageSize=10&status=5
```

#### 响应字段（`Result<PageResult>` → `data`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| total | Long | 总记录数 |
| records | List&lt;OrderVO&gt; | 当前页数据（结构见下） |

`OrderVO`（继承自 `Orders`，扩展字段）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 订单ID |
| number | String | 订单号 |
| status | Integer | 订单状态：1 待付款 2 待接单 3 已接单 4 派送中 5 已完成 6 已取消 7 退款 |
| userId | Long | 下单用户ID |
| addressBookId | Long | 地址簿ID |
| orderTime | String | 下单时间 |
| checkoutTime | String | 结账时间 |
| payMethod | Integer | 支付方式：1 微信 2 支付宝 |
| payStatus | Integer | 支付状态：0 未支付 1 已支付 2 退款 |
| amount | BigDecimal | 实收金额 |
| remark | String | 备注 |
| userName | String | 用户名 |
| phone | String | 手机号 |
| address | String | 地址 |
| consignee | String | 收货人 |
| cancelReason | String | 取消原因 |
| rejectionReason | String | 拒单原因 |
| cancelTime | String | 取消时间 |
| estimatedDeliveryTime | String | 预计送达时间 |
| deliveryStatus | Integer | 配送状态：1 立即送出 0 选择具体时间 |
| deliveryTime | String | 送达时间 |
| packAmount | int | 打包费 |
| tablewareNumber | int | 餐具数量 |
| tablewareStatus | Integer | 餐具状态 |
| orderDishes | String | 订单菜品概览文本 |
| orderDetailList | List&lt;OrderDetail&gt; | 订单详情列表 |

`OrderDetail` 结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 详情ID |
| name | String | 菜品/套餐名称 |
| orderId | Long | 订单ID |
| dishId | Long | 菜品ID |
| setmealId | Long | 套餐ID |
| dishFlavor | String | 口味 |
| number | Integer | 数量 |
| amount | BigDecimal | 金额 |
| image | String | 图片 URL |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 25,
    "records": [
      {
        "id": 9001,
        "number": "2026091712000001",
        "status": 5,
        "userId": 1001,
        "addressBookId": 5,
        "orderTime": "2026-09-17 12:00:00",
        "checkoutTime": "2026-09-17 12:05:00",
        "payMethod": 1,
        "payStatus": 1,
        "amount": 59.00,
        "remark": "少放辣",
        "userName": "张三",
        "phone": "13800138000",
        "address": "北京市朝阳区xx路xx号",
        "consignee": "张三",
        "cancelReason": null,
        "rejectionReason": null,
        "cancelTime": null,
        "estimatedDeliveryTime": "2026-09-17 12:30:00",
        "deliveryStatus": 0,
        "deliveryTime": "2026-09-17 12:35:00",
        "packAmount": 3,
        "tablewareNumber": 2,
        "tablewareStatus": 0,
        "orderDishes": "宫保鸡丁 x2",
        "orderDetailList": [
          {
            "id": 1,
            "name": "宫保鸡丁",
            "orderId": 9001,
            "dishId": 10,
            "setmealId": null,
            "dishFlavor": "中辣",
            "number": 2,
            "amount": 28.00,
            "image": "https://oss.example.com/dish/10.jpg"
          }
        ]
      }
    ]
  }
}
```

### 8.4 查询订单详情

- **接口**：`GET /user/order/orderDetail/{id}`
- **说明**：根据订单ID查询订单详情（含订单明细列表）。
- **请求头**：`authentication: <token>`

#### 请求参数（Path）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 订单ID |

#### 请求示例

```
GET /user/order/orderDetail/9001
```

#### 响应字段（`Result<OrderVO>` → `data`）

字段同 [8.3 响应字段](#83-历史订单分页查询) 中的 `OrderVO` 单条结构。

#### 响应示例

同 [8.3 响应示例](#83-历史订单分页查询) 中 `records` 数组的第一项。

### 8.5 取消订单

- **接口**：`PUT /user/order/cancel/{id}`
- **说明**：用户取消订单（仅可由用户本人发起）。
- **请求头**：`authentication: <token>`

#### 请求参数（Path）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 订单ID |

#### 请求示例

```
PUT /user/order/cancel/9001
```

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 8.6 再来一单

- **接口**：`POST /user/order/repetition/{id}`
- **说明**：复制原订单的菜品/套餐到购物车（再次下单的快捷入口）。
- **请求头**：`authentication: <token>`

#### 请求参数（Path）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 原订单ID |

#### 请求示例

```
POST /user/order/repetition/9001
```

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 8.7 催单

- **接口**：`GET /user/order/reminder/{id}`
- **说明**：对指定订单发起催单，后端会向管理端推送催单提醒（WebSocket）。
- **请求头**：`authentication: <token>`

#### 请求参数（Path）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Long | 是 | 订单ID |

#### 请求示例

```
GET /user/order/reminder/9001
```

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

---

## 9. 优惠券模块

> Controller：`com.mzhl.controller.user.UserCouponController`  
> 根路径：`/user/coupon`

### 9.1 查询可领取的优惠券

- **接口**：`GET /user/coupon/available`
- **说明**：查询当前可领取（进行中且未领完）的优惠券模板列表。**无需鉴权**（白名单）。
- **请求头**：无特殊请求头。

#### 请求参数

无。

#### 响应字段（`Result<List<CouponVO>>` → `data`，数组项结构）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 优惠券ID |
| name | String | 优惠券名称 |
| typeDesc | String | 类型描述："代金券"、"折扣券" |
| ruleDesc | String | 优惠规则描述："满100减20"、"8折" |
| discountType | Integer | 优惠计算方式：1 每满减 2 阶梯折扣 3 固定折扣 |
| discountValue | BigDecimal | 优惠值（代金券为元，折扣券为折扣率如 80 表示 8 折） |
| thresholdAmount | BigDecimal | 使用门槛金额（0 表示无门槛） |
| maxDiscountAmount | BigDecimal | 最大优惠金额（null 表示不限） |
| issueBeginTime | String | 可领取开始时间 |
| issueEndTime | String | 可领取结束时间 |
| validityDesc | String | 有效期说明，如"领取后7天有效" |
| totalNum | Integer | 发行总量 |
| issueNum | Integer | 已领取数量 |
| remainNum | Integer | 剩余数量（= totalNum - issueNum） |
| userLimit | Integer | 每人限领数量（0 表示不限） |
| status | Integer | 状态：1 进行中 2 已停止 |
| statusDesc | String | 状态描述："进行中"、"已停止" |
| received | Boolean | 当前用户是否已领取（未登录时通常为 false） |
| scopeDesc | String | 适用范围描述："全场通用"、"仅限川菜" |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 1,
      "name": "新人专享券",
      "typeDesc": "代金券",
      "ruleDesc": "满100减20",
      "discountType": 1,
      "discountValue": 20.00,
      "thresholdAmount": 100.00,
      "maxDiscountAmount": null,
      "issueBeginTime": "2026-09-01 00:00:00",
      "issueEndTime": "2026-09-30 23:59:59",
      "validityDesc": "领取后7天有效",
      "totalNum": 1000,
      "issueNum": 320,
      "remainNum": 680,
      "userLimit": 1,
      "status": 1,
      "statusDesc": "进行中",
      "received": false,
      "scopeDesc": "全场通用"
    }
  ]
}
```

### 9.2 领取优惠券

- **接口**：`POST /user/coupon/receive/{couponId}`
- **说明**：用户主动领取一张优惠券（受 `userLimit`、`remainNum` 等限制）。
- **请求头**：`authentication: <token>`

#### 请求参数（Path）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| couponId | Long | 是 | 优惠券模板ID |

#### 请求示例

```
POST /user/coupon/receive/1
```

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 9.3 兑换码领取优惠券

- **接口**：`POST /user/coupon/exchange/{code}`
- **说明**：通过兑换码领取一张优惠券。
- **请求头**：`authentication: <token>`

#### 请求参数（Path）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| code | String | 是 | 兑换码 |

#### 请求示例

```
POST /user/coupon/exchange/NEWUSER2026
```

#### 响应字段

`Result<Void>`，`data` 为 `null`。

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 9.4 查询我的优惠券

- **接口**：`GET /user/coupon/my`
- **说明**：查询当前用户持有的优惠券列表，可按状态过滤。
- **请求头**：`authentication: <token>`

#### 请求参数（Query）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| status | Integer | 否 | 状态：1 未使用 2 已使用 3 已过期。不传则查询全部 |

#### 请求示例

```
GET /user/coupon/my?status=1
```

#### 响应字段（`Result<List<UserCouponVO>>` → `data`，数组项结构）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Long | 用户优惠券ID（实例ID，下单用） |
| couponId | Long | 优惠券模板ID |
| couponName | String | 优惠券名称 |
| ruleDesc | String | 优惠规则描述 |
| discountValue | BigDecimal | 优惠值 |
| thresholdAmount | BigDecimal | 使用门槛 |
| maxDiscountAmount | BigDecimal | 最大优惠金额 |
| status | Integer | 状态：1 未使用 2 已使用 3 已过期 |
| statusDesc | String | 状态描述："未使用"、"已使用" |
| termBeginTime | String | 有效期开始时间 |
| termEndTime | String | 有效期结束时间 |
| remainDays | Integer | 剩余天数（计算字段） |
| expiringSoon | Boolean | 是否即将过期（≤3 天） |
| usedTime | String | 使用时间（未使用时为 null） |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 201,
      "couponId": 1,
      "couponName": "新人专享券",
      "ruleDesc": "满100减20",
      "discountValue": 20.00,
      "thresholdAmount": 100.00,
      "maxDiscountAmount": null,
      "status": 1,
      "statusDesc": "未使用",
      "termBeginTime": "2026-09-17 12:00:00",
      "termEndTime": "2026-09-24 12:00:00",
      "remainDays": 7,
      "expiringSoon": false,
      "usedTime": null
    }
  ]
}
```

### 9.5 计算订单可用优惠券

- **接口**：`POST /user/coupon/calculate`
- **说明**：根据订单商品列表，计算每张用户优惠券的可用性与预估优惠金额。
- **请求头**：`authentication: <token>`，`Content-Type: application/json`

#### 请求参数（Body：`CouponCalculateDTO`）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| items | List&lt;OrderItemDTO&gt; | 是 | 订单商品列表 |

`OrderItemDTO` 结构：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| itemId | Long | 是 | 商品ID（菜品或套餐ID） |
| itemType | Integer | 是 | 商品类型：1 菜品 2 套餐 |
| categoryId | Long | 是 | 商品分类ID（用于判断是否在优惠券范围内） |
| price | BigDecimal | 是 | 商品单价（元） |
| quantity | Integer | 是 | 购买数量 |

> 注：`userId` 字段无需前端传递，后端从登录上下文自动注入。

#### 请求示例

```json
{
  "items": [
    {
      "itemId": 10,
      "itemType": 1,
      "categoryId": 1,
      "price": 28.00,
      "quantity": 2
    },
    {
      "itemId": 100,
      "itemType": 2,
      "categoryId": 2,
      "price": 88.00,
      "quantity": 1
    }
  ]
}
```

#### 响应字段（`Result<List<AvailableCouponVO>>` → `data`，数组项结构）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| userCouponId | Long | 用户优惠券ID |
| name | String | 优惠券名称 |
| discountAmount | BigDecimal | 预估优惠金额 |
| ruleDesc | String | 优惠规则描述 |
| thresholdAmount | BigDecimal | 使用门槛 |
| canUse | Boolean | 是否满足使用条件 |
| unavailableReason | String | 不可用原因（`canUse=false` 时返回） |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "userCouponId": 201,
      "name": "新人专享券",
      "discountAmount": 20.00,
      "ruleDesc": "满100减20",
      "thresholdAmount": 100.00,
      "canUse": true,
      "unavailableReason": null
    },
    {
      "userCouponId": 205,
      "name": "川菜8折券",
      "discountAmount": 0.00,
      "ruleDesc": "8折",
      "thresholdAmount": 0.00,
      "canUse": false,
      "unavailableReason": "仅限指定分类商品"
    }
  ]
}
```

### 9.6 查找最优优惠券组合

- **接口**：`POST /user/coupon/optimal`
- **说明**：通过全排列 + CompletableFuture 并行计算，找出最省钱的优惠券组合方案。
- **请求头**：`authentication: <token>`，`Content-Type: application/json`

#### 请求参数（Body：`CouponCalculateDTO`）

同 [9.5 请求参数](#95-计算订单可用优惠券)。

#### 请求示例

同 [9.5 请求示例](#95-计算订单可用优惠券)。

#### 响应字段（`Result<OptimalCouponVO>` → `data`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| userCouponIds | List&lt;Long&gt; | 推荐使用的用户优惠券ID列表 |
| couponNames | List&lt;String&gt; | 优惠券名称列表（与 `userCouponIds` 一一对应） |
| totalDiscount | BigDecimal | 总优惠金额 |
| originalAmount | BigDecimal | 原价 |
| payAmount | BigDecimal | 实付金额 |
| savedAmount | BigDecimal | 节省金额 |

#### 响应示例

```json
{
  "code": 1,
  "msg": null,
  "data": {
    "userCouponIds": [201, 202],
    "couponNames": ["新人专享券", "川菜8折券"],
    "totalDiscount": 35.60,
    "originalAmount": 144.00,
    "payAmount": 108.40,
    "savedAmount": 35.60
  }
}
```

---

## 10. 聊天模块（AI 客服）

> Controller：`com.mzhl.controller.chat.ChatController`  
> 根路径：`/api/chat`

> 说明：该模块基于 Spring AI（默认模型 `deepseek-chat`），使用 `InMemoryChatMemoryRepository` + 滑动窗口保留最近 20 条对话。  
> 路径前缀为 `/api`，不在 `/user/**` 拦截范围内，**无需登录 Token**。

### 10.1 流式对话（SSE）

- **接口**：`GET /api/chat/stream`
- **说明**：以 Server-Sent Events 流式返回大模型回答（"打字机效果"）。前端使用 `EventSource` 连接。
- **请求头**：无特殊请求头（建议 `Accept: text/event-stream`）。

#### 请求参数（Query）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| message | String | 是 | 用户发送的消息内容 |
| sessionId | String | 否 | 会话ID，用于区分不同用户对话上下文。不传时默认为 `"default"`。前端可用 `crypto.randomUUID()` 生成 |

#### 请求示例

```
GET /api/chat/stream?message=如何下单&sessionId=client-abc123
```

#### 响应说明

- **Content-Type**：`text/event-stream`
- **超时**：`SseEmitter` 超时时间 180 秒（180000 ms）。
- **数据格式**：每个 `data:` 事件承载一段 token 文本，前端按需拼接到对话气泡。
- **失败重试**：后端对可重试错误（连接重置/超时/拒绝）自动重试最多 2 次；认证类错误（401/402）不重试，直接推送提示文案。
- **错误文案**：
  - 认证类：`[AI服务暂时不可用，请联系人工客服：400-123-4567]`
  - 其他：`[网络异常，请稍后重试]`

#### 响应示例（SSE 流）

```
data:下
data:单
data:步
data:骤
data:如下
data:：
data:1
data:.
data:选
data:择
data:菜
data:品
...
data:[DONE]
```

> 说明：实际 token 由后端清洗（去除 JSON 引号包裹、unicode 转义、零宽字符、CJK 间多余空格）后逐段推送；事件结尾的 `[DONE]` 仅为示意，前端应通过 SSE `onComplete` 判断结束。

---

## 11. 支付回调模块

> Controller：`com.mzhl.controller.nofity.PayNotifyController`  
> 根路径：`/notify`

> 说明：该模块供微信支付侧调用，**前端不直接调用**。路径前缀为 `/notify`，不在 `/user/**` 拦截范围内。以下文档仅作前端联调理解之用。

### 11.1 微信支付成功回调

- **接口**：`POST|GET|... /notify/paySuccess`（`@RequestMapping`，无方法限制）
- **说明**：微信支付成功后由微信侧回调，后端解密 `resource.ciphertext`（AES-GCM，密钥为 `apiV3Key`），提取 `out_trade_no` 后调用 `orderService.paySuccess(outTradeNo)` 完成订单状态更新与来单提醒，最后返回 `{"code":"SUCCESS","message":"SUCCESS"}`。
- **请求头**：由微信侧设置（通常 `Content-Type: application/json`）。

#### 请求参数（Body：微信支付通知 JSON）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| resource.ciphertext | String | 是 | AES-GCM 加密的资源密文 |
| resource.nonce | String | 是 | 随机串 |
| resource.associated_data | String | 是 | 附加数据 |

> 完整字段以微信支付 V3 文档为准，本接口仅使用上述三项。

#### 请求示例

```json
{
  "id": "EV-2026091712000001",
  "event_type": "TRANSACTION.SUCCESS",
  "resource": {
    "algorithm": "AEAD_AES_256_GCM",
    "ciphertext": "...base64...",
    "nonce": "abc123",
    "associated_data": "transaction"
  }
}
```

#### 响应（直接写入 HttpServletResponse）

- HTTP 状态：`200`
- 响应头：`Content-Type: application/json`
- 响应体：

```json
{
  "code": "SUCCESS",
  "message": "SUCCESS"
}
```

---

## 附录 A：通用响应结构 Result&lt;T&gt;

> 源码：`com.mzhl.result.Result`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | Integer | 1 成功；0 及其它数字 失败 |
| msg | String | 错误信息（成功时为 null） |
| data | T | 业务数据 |

**成功（无 data）**：

```json
{ "code": 1, "msg": null, "data": null }
```

**成功（带 data）**：

```json
{ "code": 1, "msg": null, "data": { ... } }
```

**失败**：

```json
{ "code": 0, "msg": "错误描述", "data": null }
```

> 鉴权失败（JWT 校验未通过）：HTTP 401，无响应体（由拦截器直接设置状态码）。

---

## 附录 B：分页响应结构 PageResult

> 源码：`com.mzhl.result.PageResult`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| total | Long | 总记录数 |
| records | List | 当前页数据集合 |

示例：

```json
{
  "total": 25,
  "records": [ ... ]
}
```

---

## 附录 C：枚举与状态码

### 订单状态（`Orders.status`）

| 值 | 说明 |
| --- | --- |
| 1 | 待付款 |
| 2 | 待接单 |
| 3 | 已接单 |
| 4 | 派送中 |
| 5 | 已完成 |
| 6 | 已取消 |
| 7 | 退款 |

### 支付状态（`Orders.payStatus`）

| 值 | 说明 |
| --- | --- |
| 0 | 未支付 |
| 1 | 已支付 |
| 2 | 退款 |

### 支付方式（`Orders.payMethod` / `OrdersSubmitDTO.payMethod` / `OrdersPaymentDTO.payMethod`）

| 值 | 说明 |
| --- | --- |
| 1 | 微信 |
| 2 | 支付宝 |

### 菜品 / 套餐状态

| 值 | 说明 |
| --- | --- |
| 0 | 停售 / 停用 |
| 1 | 起售 / 启用 |

### 分类类型（`Category.type`）

| 值 | 说明 |
| --- | --- |
| 1 | 菜品分类 |
| 2 | 套餐分类 |

### 配送状态（`Orders.deliveryStatus`）

| 值 | 说明 |
| --- | --- |
| 1 | 立即送出 |
| 0 | 选择具体时间 |

### 餐具状态（`Orders.tablewareStatus`）

| 值 | 说明 |
| --- | --- |
| 1 | 按餐量提供 |
| 0 | 选择具体数量 |

### 用户优惠券状态（`UserCoupon.status` / `UserCouponVO.status`）

| 值 | 说明 |
| --- | --- |
| 1 | 未使用 |
| 2 | 已使用 |
| 3 | 已过期 |
| 4 | 已锁定（下单但未支付） |

### 优惠券模板状态（`Coupon.status`）

| 值 | 说明 |
| --- | --- |
| 0 | 草稿 |
| 1 | 进行中 |
| 2 | 已停止 |
| 3 | 已过期 |

### 优惠券类型（`Coupon.type`）

| 值 | 说明 |
| --- | --- |
| 1 | 代金券（直接减钱） |
| 2 | 折扣券（打几折） |
| 3 | 赠品券 |

### 优惠计算方式（`Coupon.discountType`）

| 值 | 说明 |
| --- | --- |
| 1 | 每满减（可叠加） |
| 2 | 阶梯折扣 |
| 3 | 固定折扣 |

### 性别（`User.sex` / `AddressBook.sex`）

| 值 | 说明 |
| --- | --- |
| 0 | 女 |
| 1 | 男 |

### 是否默认地址（`AddressBook.isDefault`）

| 值 | 说明 |
| --- | --- |
| 0 | 否 |
| 1 | 是 |
