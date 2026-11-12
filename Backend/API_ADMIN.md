# 管理端 API 接口文档

> 本文档面向前端团队，覆盖管理端（admin）全部 HTTP 接口的详细规范。
> 接口源码位于 `Backend/server/src/main/.../controller/admin/` 目录下。

---

## 目录

- [通用约定](#通用约定)
  - [服务地址](#服务地址)
  - [统一响应结构 Result](#统一响应结构-result)
  - [分页响应结构 PageResult](#分页响应结构-pageresult)
  - [鉴权与请求头](#鉴权与请求头)
  - [接口路径前缀](#接口路径前缀)
  - [状态码与业务编码](#状态码与业务编码)
- [1. 员工模块](#1-员工模块)
  - [1.1 员工登录](#11-员工登录)
  - [1.2 员工退出](#12-员工退出)
  - [1.3 新增员工](#13-新增员工)
  - [1.4 分页查询员工](#14-分页查询员工)
  - [1.5 启用或禁用员工](#15-启用或禁用员工)
  - [1.6 根据ID查询员工信息](#16-根据id查询员工信息)
  - [1.7 更新员工信息](#17-更新员工信息)
  - [1.8 修改密码](#18-修改密码)
- [2. 菜品模块](#2-菜品模块)
  - [2.1 新增菜品](#21-新增菜品)
  - [2.2 菜品分页查询](#22-菜品分页查询)
  - [2.3 删除菜品](#23-删除菜品)
  - [2.4 根据ID查询菜品信息](#24-根据id查询菜品信息)
  - [2.5 更新菜品信息](#25-更新菜品信息)
  - [2.6 菜品起售停售](#26-菜品起售停售)
  - [2.7 根据分类id查询菜品](#27-根据分类id查询菜品)
- [3. 套餐模块](#3-套餐模块)
  - [3.1 新增套餐](#31-新增套餐)
  - [3.2 套餐分页查询](#32-套餐分页查询)
  - [3.3 批量删除套餐](#33-批量删除套餐)
  - [3.4 根据id查询套餐](#34-根据id查询套餐)
  - [3.5 修改套餐](#35-修改套餐)
  - [3.6 套餐起售停售](#36-套餐起售停售)
- [4. 分类模块](#4-分类模块)
  - [4.1 新增分类](#41-新增分类)
  - [4.2 分类分页查询](#42-分类分页查询)
  - [4.3 删除分类](#43-删除分类)
  - [4.4 修改分类](#44-修改分类)
  - [4.5 启用禁用分类](#45-启用禁用分类)
  - [4.6 根据类型查询分类](#46-根据类型查询分类)
- [5. 订单管理模块](#5-订单管理模块)
  - [5.1 订单搜索](#51-订单搜索)
  - [5.2 各状态订单数量统计](#52-各状态订单数量统计)
  - [5.3 查询订单详情](#53-查询订单详情)
  - [5.4 接单](#54-接单)
  - [5.5 拒单](#55-拒单)
  - [5.6 取消订单](#56-取消订单)
  - [5.7 派送订单](#57-派送订单)
  - [5.8 完成订单](#58-完成订单)
- [6. 优惠券管理模块](#6-优惠券管理模块)
  - [6.1 创建优惠券](#61-创建优惠券)
  - [6.2 发布优惠券](#62-发布优惠券)
  - [6.3 停止优惠券](#63-停止优惠券)
  - [6.4 分页查询优惠券](#64-分页查询优惠券)
  - [6.5 查询优惠券详情](#65-查询优惠券详情)
  - [6.6 删除优惠券](#66-删除优惠券)
  - [6.7 批量删除优惠券](#67-批量删除优惠券)
  - [6.8 修改优惠券](#68-修改优惠券)
- [7. 商铺模块](#7-商铺模块)
  - [7.1 设置营业状态](#71-设置营业状态)
  - [7.2 获取营业状态](#72-获取营业状态)
- [8. 工作台模块](#8-工作台模块)
  - [8.1 工作台今日数据查询](#81-工作台今日数据查询)
  - [8.2 查询订单管理数据](#82-查询订单管理数据)
  - [8.3 查询菜品总览](#83-查询菜品总览)
  - [8.4 查询套餐总览](#84-查询套餐总览)
- [9. 数据统计/报表模块](#9-数据统计报表模块)
  - [9.1 营业额统计](#91-营业额统计)
  - [9.2 用户统计](#92-用户统计)
  - [9.3 订单统计](#93-订单统计)
  - [9.4 销量Top10](#94-销量top10)
  - [9.5 导出报表](#95-导出报表)
- [10. 公共模块-文件上传](#10-公共模块-文件上传)
  - [10.1 上传图片](#101-上传图片)
  - [10.2 文件下载](#102-文件下载)
- [附录A：枚举值速查表](#附录a枚举值速查表)

---

## 通用约定

### 服务地址

| 项目 | 值 |
| --- | --- |
| 服务端口 | `8080` |
| 上下文路径（context-path） | 未配置，直接访问根路径 |
| 示例 BaseUrl | `http://localhost:8080` |

### 统一响应结构 Result

所有接口（除特殊说明的文件流导出/下载）统一返回如下 JSON 结构：

```json
{
  "code": 1,
  "msg": "错误信息（成功时为 null）",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | Integer | 业务编码：`1` 表示成功；`0` 或其它数字表示失败 |
| `msg` | String | 错误信息，成功时为 `null` |
| `data` | Object/T | 业务数据，无数据时为 `null` |

### 分页响应结构 PageResult

所有分页查询接口的 `data` 字段均为 `PageResult`：

```json
{
  "total": 100,
  "records": []
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `total` | Long | 总记录数 |
| `records` | List | 当前页数据集合 |

### 鉴权与请求头

管理端使用 JWT 进行鉴权，由 `JwtTokenAdminInterceptor` 拦截 `/admin/**` 路径下所有请求。

| 请求头 | 是否必填 | 说明 |
| --- | --- | --- |
| `token` | 除登录外必填 | 管理端 JWT 令牌。请求头名称来自 `JwtProperties.adminTokenName`，配置值为 `token` |

**鉴权流程：**
1. 前端调用 `POST /admin/employee/login` 登录成功后，响应体中会返回 `token` 字段。
2. 后续所有 `/admin/**` 请求需在请求头携带 `token: <jwt令牌>`。
3. 拦截器校验令牌：通过则放行；不通过则直接返回 HTTP 状态码 `401`（无响应体）。

**白名单（无需鉴权）：**
- `POST /admin/employee/login`

> 注意：登录接口响应中返回的 `token` 即为后续请求所需的 JWT。前端应妥善保存并在所有受保护请求中附带该请求头。

### 接口路径前缀

所有管理端接口统一以 `/admin` 为前缀，按模块细分：

| 模块 | 路径前缀 |
| --- | --- |
| 员工 | `/admin/employee` |
| 菜品 | `/admin/dish` |
| 套餐 | `/admin/setmeal` |
| 分类 | `/admin/category` |
| 订单 | `/admin/order` |
| 优惠券 | `/admin/coupon` |
| 商铺 | `/admin/shop` |
| 工作台 | `/admin/workspace` |
| 报表 | `/admin/report` |
| 公共 | `/admin/common` |

### 状态码与业务编码

| 场景 | HTTP 状态码 | 说明 |
| --- | --- | --- |
| 请求成功 | 200 | 响应体 `code: 1` |
| 业务失败 | 200 | 响应体 `code: 0`，`msg` 为错误信息 |
| 未登录/Token 失效 | 401 | 拦截器直接返回 401，无响应体 |

---

## 1. 员工模块

源文件：`controller/admin/EmployeeController.java`，路径前缀 `/admin/employee`。

### 1.1 员工登录

- **Method + Path**：`POST /admin/employee/login`
- **简要说明**：员工使用用户名密码登录，成功后下发 JWT 令牌。**此接口无需携带 token。**
- **请求头**：无（无需鉴权）
- **请求参数**（Body - `EmployeeLoginDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | String | 是 | 用户名 |
| `password` | String | 是 | 密码 |

- **请求示例**：
```json
{
  "username": "admin",
  "password": "123456"
}
```
- **响应字段说明**（`Result<EmployeeLoginVO>` 中 `data` 为 `EmployeeLoginVO`）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 员工主键 |
| `userName` | String | 用户名 |
| `name` | String | 姓名 |
| `token` | String | JWT 令牌，后续请求需放入 `token` 请求头 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 1,
    "userName": "admin",
    "name": "管理员",
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 1.2 员工退出

- **Method + Path**：`POST /admin/employee/logout`
- **简要说明**：员工退出登录。当前实现直接返回成功，前端需自行清理本地 token。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：无
- **请求示例**：无 Body
- **响应字段说明**：`Result<String>`，`data` 为 `null`
- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 1.3 新增员工

- **Method + Path**：`POST /admin/employee`
- **简要说明**：新增一名员工。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `EmployeeDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 否 | 新增时不传 |
| `username` | String | 是 | 用户名 |
| `name` | String | 是 | 姓名 |
| `phone` | String | 是 | 手机号 |
| `sex` | String | 是 | 性别 |
| `idNumber` | String | 是 | 身份证号 |

- **请求示例**：
```json
{
  "username": "lisi",
  "name": "李四",
  "phone": "13800138000",
  "sex": "男",
  "idNumber": "110101199001011234"
}
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

### 1.4 分页查询员工

- **Method + Path**：`GET /admin/employee/page`
- **简要说明**：按姓名条件分页查询员工列表。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query - `EmployeePageQueryDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 员工姓名（模糊匹配） |
| `page` | int | 是 | 页码，从 1 开始 |
| `pageSize` | int | 是 | 每页显示记录数 |

- **请求示例**：
```
GET /admin/employee/page?name=李&page=1&pageSize=10
```
- **响应字段说明**：`Result<PageResult>`，`data.records` 中元素为 `Employee`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 员工主键 |
| `username` | String | 用户名 |
| `name` | String | 姓名 |
| `password` | String | 密码（敏感字段，前端忽略） |
| `phone` | String | 手机号 |
| `sex` | String | 性别 |
| `idNumber` | String | 身份证号 |
| `status` | Integer | 状态：`1` 启用，`0` 禁用 |
| `createTime` | LocalDateTime | 创建时间 |
| `updateTime` | LocalDateTime | 更新时间 |
| `createUser` | Long | 创建人 ID |
| `updateUser` | Long | 修改人 ID |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 2,
    "records": [
      {
        "id": 1,
        "username": "admin",
        "name": "管理员",
        "phone": "13800138000",
        "sex": "男",
        "idNumber": "110101199001011234",
        "status": 1,
        "createTime": "2026-09-01 10:00:00",
        "updateTime": "2026-09-01 10:00:00",
        "createUser": null,
        "updateUser": null
      }
    ]
  }
}
```

### 1.5 启用或禁用员工

- **Method + Path**：`POST /admin/employee/status/{status}`
- **简要说明**：启用或禁用指定员工账号。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `status` | Integer | 是 | `1` 启用，`0` 禁用 |
| Query | `id` | Long | 是 | 员工 ID |

- **请求示例**：
```
POST /admin/employee/status/0?id=3
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 1.6 根据ID查询员工信息

- **Method + Path**：`GET /admin/employee/{id}`
- **简要说明**：根据员工 ID 查询员工详情，用于编辑页回显。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `id` | Long | 是 | 员工 ID |

- **请求示例**：
```
GET /admin/employee/3
```
- **响应字段说明**：`Result<Employee>`，字段同 [1.4 响应字段](#14-分页查询员工) 中的 `Employee`。
- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 3,
    "username": "lisi",
    "name": "李四",
    "phone": "13800138000",
    "sex": "男",
    "idNumber": "110101199001011234",
    "status": 1,
    "createTime": "2026-09-01 10:00:00",
    "updateTime": "2026-09-01 10:00:00"
  }
}
```

### 1.7 更新员工信息

- **Method + Path**：`PUT /admin/employee`
- **简要说明**：更新员工基本信息。请求体需带上 `id`。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `EmployeeDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 是 | 员工 ID |
| `username` | String | 是 | 用户名 |
| `name` | String | 是 | 姓名 |
| `phone` | String | 是 | 手机号 |
| `sex` | String | 是 | 性别 |
| `idNumber` | String | 是 | 身份证号 |

- **请求示例**：
```json
{
  "id": 3,
  "username": "lisi",
  "name": "李四更新",
  "phone": "13900000000",
  "sex": "男",
  "idNumber": "110101199001011234"
}
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 1.8 修改密码

- **Method + Path**：`PUT /admin/employee/editPassword`
- **简要说明**：修改当前登录员工的密码。后端通过 JWT 解析当前员工 ID，无需在 Body 中传 `empId`。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - 任意 Map<String,String>，前端传以下两个键）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `oldPassword` | String | 是 | 旧密码 |
| `newPassword` | String | 是 | 新密码 |

> 注意：源码中 `editPassword` 接收 `Map<String,String>`，而非 `PasswordEditDTO`。前端只需传两个字段即可。

- **请求示例**：
```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

---

## 2. 菜品模块

源文件：`controller/admin/DishController.java`，路径前缀 `/admin/dish`。

### 2.1 新增菜品

- **Method + Path**：`POST /admin/dish`
- **简要说明**：新增菜品及其关联口味信息。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `DishDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 否 | 新增不传 |
| `name` | String | 是 | 菜品名称 |
| `categoryId` | Long | 是 | 菜品分类 ID |
| `price` | BigDecimal | 是 | 菜品价格 |
| `image` | String | 是 | 图片 URL（由上传接口返回） |
| `description` | String | 否 | 描述信息 |
| `status` | Integer | 否 | `0` 停售，`1` 起售 |
| `flavors` | List&lt;DishFlavor&gt; | 否 | 口味列表 |

`DishFlavor` 子结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 主键（新增时不传） |
| `dishId` | Long | 菜品 ID（新增时不传） |
| `name` | String | 口味名称，如"甜度" |
| `value` | String | 口味数据，JSON 数组字符串，如`"[\"无糖\",\"半糖\"]"` |

- **请求示例**：
```json
{
  "name": "鱼香肉丝",
  "categoryId": 10,
  "price": 28.00,
  "image": "https://oss.example.com/xxx.jpg",
  "description": "经典川菜",
  "status": 1,
  "flavors": [
    { "name": "辣度", "value": "[\"不辣\",\"微辣\",\"中辣\"]" }
  ]
}
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 2.2 菜品分页查询

- **Method + Path**：`GET /admin/dish/page`
- **简要说明**：根据条件分页查询菜品。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query - `DishPageQueryDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | int | 是 | 页码 |
| `pageSize` | int | 是 | 每页记录数 |
| `name` | String | 否 | 菜品名称（模糊查询） |
| `categoryId` | Integer | 否 | 分类 ID |
| `status` | Integer | 否 | 状态：`0` 禁用，`1` 启用 |

- **请求示例**：
```
GET /admin/dish/page?page=1&pageSize=10&name=鱼&categoryId=10&status=1
```
- **响应字段说明**：`Result<PageResult>`，`data.records` 元素为 `DishVO`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 菜品 ID |
| `name` | String | 菜品名称 |
| `categoryId` | Long | 分类 ID |
| `price` | BigDecimal | 价格 |
| `image` | String | 图片 URL |
| `description` | String | 描述 |
| `status` | Integer | `0` 停售，`1` 起售 |
| `updateTime` | LocalDateTime | 更新时间 |
| `categoryName` | String | 分类名称 |
| `flavors` | List&lt;DishFlavor&gt; | 关联口味列表 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 1,
    "records": [
      {
        "id": 1,
        "name": "鱼香肉丝",
        "categoryId": 10,
        "price": 28.00,
        "image": "https://oss.example.com/xxx.jpg",
        "description": "经典川菜",
        "status": 1,
        "updateTime": "2026-09-01 10:00:00",
        "categoryName": "川菜",
        "flavors": []
      }
    ]
  }
}
```

### 2.3 删除菜品

- **Method + Path**：`DELETE /admin/dish`
- **简要说明**：批量删除菜品（含关联口味）。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query - `ids` 为 `List<Long>`，可重复参数）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ids` | List&lt;Long&gt; | 是 | 待删除的菜品 ID 列表 |

- **请求示例**：
```
DELETE /admin/dish?ids=1&ids=2&ids=3
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 2.4 根据ID查询菜品信息

- **Method + Path**：`GET /admin/dish/{id}`
- **简要说明**：根据菜品 ID 查询菜品（含口味），用于修改页回显。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `id` | Long | 是 | 菜品 ID |

- **请求示例**：
```
GET /admin/dish/1
```
- **响应字段说明**：`Result<DishVO>`，字段同 [2.2 响应字段](#22-菜品分页查询) 中的 `DishVO`。
- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 1,
    "name": "鱼香肉丝",
    "categoryId": 10,
    "price": 28.00,
    "image": "https://oss.example.com/xxx.jpg",
    "description": "经典川菜",
    "status": 1,
    "updateTime": "2026-09-01 10:00:00",
    "categoryName": "川菜",
    "flavors": [
      { "id": 1, "dishId": 1, "name": "辣度", "value": "[\"不辣\",\"微辣\"]" }
    ]
  }
}
```

### 2.5 更新菜品信息

- **Method + Path**：`PUT /admin/dish`
- **简要说明**：更新菜品基本信息及其关联口味（口味会先删除再插入）。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `DishDTO`，需带 `id`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 是 | 菜品 ID |
| `name` | String | 是 | 菜品名称 |
| `categoryId` | Long | 是 | 分类 ID |
| `price` | BigDecimal | 是 | 价格 |
| `image` | String | 是 | 图片 URL |
| `description` | String | 否 | 描述 |
| `status` | Integer | 否 | 状态 |
| `flavors` | List&lt;DishFlavor&gt; | 否 | 新的口味列表 |

- **请求示例**：参考 [2.1 请求示例](#21-新增菜品)，需补充 `id` 字段。
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 2.6 菜品起售停售

- **Method + Path**：`POST /admin/dish/status/{status}`
- **简要说明**：起售或停售指定菜品。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `status` | Integer | 是 | `1` 起售，`0` 停售 |
| Query | `id` | Long | 是 | 菜品 ID |

- **请求示例**：
```
POST /admin/dish/status/0?id=1
```
- **响应字段说明**：`Result<String>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 2.7 根据分类id查询菜品

- **Method + Path**：`GET /admin/dish/list`
- **简要说明**：根据分类 ID 查询该分类下菜品列表（用于套餐菜品选择等场景）。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Query | `categoryId` | Long | 是 | 分类 ID |

- **请求示例**：
```
GET /admin/dish/list?categoryId=10
```
- **响应字段说明**：`Result<List<Dish>>`，元素为 `Dish` 实体：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 菜品 ID |
| `name` | String | 菜品名称 |
| `categoryId` | Long | 分类 ID |
| `price` | BigDecimal | 价格 |
| `image` | String | 图片 URL |
| `description` | String | 描述 |
| `status` | Integer | `0` 停售 `1` 起售 |
| `createTime` | LocalDateTime | 创建时间 |
| `updateTime` | LocalDateTime | 更新时间 |
| `createUser` | Long | 创建人 |
| `updateUser` | Long | 修改人 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 1,
      "name": "鱼香肉丝",
      "categoryId": 10,
      "price": 28.00,
      "image": "https://oss.example.com/xxx.jpg",
      "description": "经典川菜",
      "status": 1,
      "createTime": "2026-09-01 10:00:00",
      "updateTime": "2026-09-01 10:00:00"
    }
  ]
}
```

---

## 3. 套餐模块

源文件：`controller/admin/SetmealController.java`，路径前缀 `/admin/setmeal`。

### 3.1 新增套餐

- **Method + Path**：`POST /admin/setmeal`
- **简要说明**：新增套餐及其包含的菜品关联关系。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `SetmealDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 否 | 新增不传 |
| `categoryId` | Long | 是 | 分类 ID |
| `name` | String | 是 | 套餐名称 |
| `price` | BigDecimal | 是 | 套餐价格 |
| `status` | Integer | 否 | `0` 停用 `1` 启用 |
| `description` | String | 否 | 描述信息 |
| `image` | String | 是 | 图片 URL |
| `setmealDishes` | List&lt;SetmealDish&gt; | 是 | 套餐菜品关系 |

`SetmealDish` 子结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 主键 |
| `setmealId` | Long | 套餐 ID |
| `dishId` | Long | 菜品 ID |
| `name` | String | 菜品名称（冗余字段） |
| `price` | BigDecimal | 菜品原价 |
| `copies` | Integer | 份数 |

- **请求示例**：
```json
{
  "categoryId": 20,
  "name": "双人套餐",
  "price": 88.00,
  "status": 1,
  "description": "适合两人用餐",
  "image": "https://oss.example.com/setmeal.jpg",
  "setmealDishes": [
    { "dishId": 1, "name": "鱼香肉丝", "price": 28.00, "copies": 1 },
    { "dishId": 2, "name": "宫保鸡丁", "price": 30.00, "copies": 1 }
  ]
}
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 3.2 套餐分页查询

- **Method + Path**：`GET /admin/setmeal/page`
- **简要说明**：按条件分页查询套餐。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query - `SetmealPageQueryDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | int | 是 | 页码 |
| `pageSize` | int | 是 | 每页记录数 |
| `name` | String | 否 | 套餐名称（模糊） |
| `categoryId` | Integer | 否 | 分类 ID |
| `status` | Integer | 否 | `0` 禁用，`1` 启用 |

- **请求示例**：
```
GET /admin/setmeal/page?page=1&pageSize=10&name=套餐
```
- **响应字段说明**：`Result<PageResult>`，`data.records` 元素为 `SetmealVO`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 套餐 ID |
| `categoryId` | Long | 分类 ID |
| `name` | String | 套餐名称 |
| `price` | BigDecimal | 价格 |
| `status` | Integer | `0` 停用 `1` 启用 |
| `description` | String | 描述 |
| `image` | String | 图片 URL |
| `updateTime` | LocalDateTime | 更新时间 |
| `categoryName` | String | 分类名称 |
| `setmealDishes` | List&lt;SetmealDish&gt; | 套餐菜品关系 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 1,
    "records": [
      {
        "id": 1,
        "categoryId": 20,
        "name": "双人套餐",
        "price": 88.00,
        "status": 1,
        "description": "适合两人用餐",
        "image": "https://oss.example.com/setmeal.jpg",
        "updateTime": "2026-09-01 10:00:00",
        "categoryName": "套餐",
        "setmealDishes": []
      }
    ]
  }
}
```

### 3.3 批量删除套餐

- **Method + Path**：`DELETE /admin/setmeal`
- **简要说明**：根据 ID 列表批量删除套餐。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query - `ids` 为 `List<Long>`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ids` | List&lt;Long&gt; | 是 | 待删除的套餐 ID 列表 |

- **请求示例**：
```
DELETE /admin/setmeal?ids=1&ids=2
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 3.4 根据id查询套餐

- **Method + Path**：`GET /admin/setmeal/{id}`
- **简要说明**：根据套餐 ID 查询套餐详情（含关联菜品），用于修改页回显。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `id` | Long | 是 | 套餐 ID |

- **请求示例**：
```
GET /admin/setmeal/1
```
- **响应字段说明**：`Result<SetmealVO>`，字段同 [3.2 响应字段](#32-套餐分页查询) 中的 `SetmealVO`。
- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 1,
    "categoryId": 20,
    "name": "双人套餐",
    "price": 88.00,
    "status": 1,
    "description": "适合两人用餐",
    "image": "https://oss.example.com/setmeal.jpg",
    "updateTime": "2026-09-01 10:00:00",
    "categoryName": "套餐",
    "setmealDishes": [
      { "id": 1, "setmealId": 1, "dishId": 1, "name": "鱼香肉丝", "price": 28.00, "copies": 1 }
    ]
  }
}
```

### 3.5 修改套餐

- **Method + Path**：`PUT /admin/setmeal`
- **简要说明**：修改套餐信息（含关联菜品）。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `SetmealDTO`，需带 `id`）：字段同 [3.1 请求参数](#31-新增套餐)，需补充 `id`。
- **请求示例**：参考 [3.1 请求示例](#31-新增套餐)，需补充 `id` 字段。
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 3.6 套餐起售停售

- **Method + Path**：`POST /admin/setmeal/status/{status}`
- **简要说明**：起售或停售指定套餐。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `status` | Integer | 是 | `1` 起售，`0` 停售 |
| Query | `id` | Long | 是 | 套餐 ID |

- **请求示例**：
```
POST /admin/setmeal/status/0?id=1
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

---

## 4. 分类模块

源文件：`controller/admin/CategoryController.java`，路径前缀 `/admin/category`。

### 4.1 新增分类

- **Method + Path**：`POST /admin/category`
- **简要说明**：新增菜品或套餐分类。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `CategoryDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 否 | 新增不传 |
| `type` | Integer | 是 | 类型：`1` 菜品分类，`2` 套餐分类 |
| `name` | String | 是 | 分类名称 |
| `sort` | Integer | 否 | 排序值 |

- **请求示例**：
```json
{
  "type": 1,
  "name": "川菜",
  "sort": 1
}
```
- **响应字段说明**：`Result<String>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 4.2 分类分页查询

- **Method + Path**：`GET /admin/category/page`
- **简要说明**：按条件分页查询分类。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query - `CategoryPageQueryDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | int | 是 | 页码 |
| `pageSize` | int | 是 | 每页记录数 |
| `name` | String | 否 | 分类名称（模糊） |
| `type` | Integer | 否 | 分类类型：`1` 菜品分类，`2` 套餐分类 |

- **请求示例**：
```
GET /admin/category/page?page=1&pageSize=10&type=1
```
- **响应字段说明**：`Result<PageResult>`，`data.records` 元素为 `Category`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 主键 |
| `type` | Integer | 类型：`1` 菜品分类，`2` 套餐分类 |
| `name` | String | 分类名称 |
| `sort` | Integer | 顺序 |
| `status` | Integer | 状态：`0` 禁用，`1` 启用 |
| `createTime` | LocalDateTime | 创建时间 |
| `updateTime` | LocalDateTime | 更新时间 |
| `createUser` | Long | 创建人 |
| `updateUser` | Long | 修改人 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 1,
    "records": [
      {
        "id": 10,
        "type": 1,
        "name": "川菜",
        "sort": 1,
        "status": 1,
        "createTime": "2026-09-01 10:00:00",
        "updateTime": "2026-09-01 10:00:00"
      }
    ]
  }
}
```

### 4.3 删除分类

- **Method + Path**：`DELETE /admin/category`
- **简要说明**：根据 ID 删除分类。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 是 | 分类 ID |

- **请求示例**：
```
DELETE /admin/category?id=10
```
- **响应字段说明**：`Result<String>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 4.4 修改分类

- **Method + Path**：`PUT /admin/category`
- **简要说明**：修改分类信息。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `CategoryDTO`，需带 `id`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 是 | 分类 ID |
| `type` | Integer | 否 | 类型 |
| `name` | String | 否 | 分类名称 |
| `sort` | Integer | 否 | 排序 |

- **请求示例**：
```json
{
  "id": 10,
  "type": 1,
  "name": "川菜改",
  "sort": 2
}
```
- **响应字段说明**：`Result<String>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 4.5 启用禁用分类

- **Method + Path**：`POST /admin/category/status/{status}`
- **简要说明**：启用或禁用分类。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `status` | Integer | 是 | `1` 启用，`0` 禁用 |
| Query | `id` | Long | 是 | 分类 ID |

- **请求示例**：
```
POST /admin/category/status/0?id=10
```
- **响应字段说明**：`Result<String>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 4.6 根据类型查询分类

- **Method + Path**：`GET /admin/category/list`
- **简要说明**：按分类类型查询全部启用分类，用于下拉选择。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Query | `type` | Integer | 是 | 类型：`1` 菜品分类，`2` 套餐分类 |

- **请求示例**：
```
GET /admin/category/list?type=1
```
- **响应字段说明**：`Result<List<Category>>`，元素为 `Category` 实体（字段同 [4.2 响应字段](#42-分类分页查询) 中的 `Category`）。
- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 10,
      "type": 1,
      "name": "川菜",
      "sort": 1,
      "status": 1,
      "createTime": "2026-09-01 10:00:00",
      "updateTime": "2026-09-01 10:00:00"
    }
  ]
}
```

---

## 5. 订单管理模块

源文件：`controller/admin/OrderController.java`，路径前缀 `/admin/order`。

### 5.1 订单搜索

- **Method + Path**：`GET /admin/order/conditionSearch`
- **简要说明**：按条件分页查询订单（条件搜索）。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query - `OrdersPageQueryDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | int | 是 | 页码 |
| `pageSize` | int | 是 | 每页记录数 |
| `number` | String | 否 | 订单号 |
| `phone` | String | 否 | 手机号 |
| `status` | Integer | 否 | 订单状态：`1` 待付款，`2` 待接单，`3` 已接单，`4` 派送中，`5` 已完成，`6` 已取消 |
| `beginTime` | LocalDateTime | 否 | 开始时间，格式 `yyyy-MM-dd HH:mm:ss` |
| `endTime` | LocalDateTime | 否 | 结束时间，格式 `yyyy-MM-dd HH:mm:ss` |
| `userId` | Long | 否 | 用户 ID（管理端通常不传） |

- **请求示例**：
```
GET /admin/order/conditionSearch?page=1&pageSize=10&status=2&beginTime=2026-09-01%2000:00:00&endTime=2026-09-17%2023:59:59
```
- **响应字段说明**：`Result<PageResult>`，`data.records` 元素为 `OrderVO`（继承自 `Orders`）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 订单 ID |
| `number` | String | 订单号 |
| `status` | Integer | 订单状态 |
| `userId` | Long | 下单用户 ID |
| `addressBookId` | Long | 地址 ID |
| `orderTime` | LocalDateTime | 下单时间 |
| `checkoutTime` | LocalDateTime | 结账时间 |
| `payMethod` | Integer | 支付方式：`1` 微信，`2` 支付宝 |
| `payStatus` | Integer | 支付状态：`0` 未支付，`1` 已支付，`2` 退款 |
| `amount` | BigDecimal | 实收金额 |
| `remark` | String | 备注 |
| `userName` | String | 用户名 |
| `phone` | String | 手机号 |
| `address` | String | 地址 |
| `consignee` | String | 收货人 |
| `cancelReason` | String | 取消原因 |
| `rejectionReason` | String | 拒单原因 |
| `cancelTime` | LocalDateTime | 取消时间 |
| `estimatedDeliveryTime` | LocalDateTime | 预计送达时间 |
| `deliveryStatus` | Integer | 配送状态：`1` 立即送出，`0` 选择具体时间 |
| `deliveryTime` | LocalDateTime | 送达时间 |
| `packAmount` | int | 打包费 |
| `tablewareNumber` | int | 餐具数量 |
| `tablewareStatus` | Integer | 餐具数量状态：`1` 按餐量提供，`0` 选择具体数量 |
| `orderDishes` | String | 订单菜品信息（聚合字符串） |
| `orderDetailList` | List&lt;OrderDetail&gt; | 订单详情列表 |

`OrderDetail` 子结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 主键 |
| `name` | String | 名称 |
| `orderId` | Long | 订单 ID |
| `dishId` | Long | 菜品 ID |
| `setmealId` | Long | 套餐 ID |
| `dishFlavor` | String | 口味 |
| `number` | Integer | 数量 |
| `amount` | BigDecimal | 金额 |
| `image` | String | 图片 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 1,
    "records": [
      {
        "id": 100,
        "number": "202609010001",
        "status": 2,
        "userId": 1,
        "addressBookId": 5,
        "orderTime": "2026-09-01 12:00:00",
        "checkoutTime": null,
        "payMethod": 1,
        "payStatus": 1,
        "amount": 88.00,
        "remark": "不要辣",
        "userName": "张三",
        "phone": "13800138000",
        "address": "北京市朝阳区",
        "consignee": "张三",
        "orderDishes": "鱼香肉丝",
        "orderDetailList": [
          {
            "id": 1,
            "name": "鱼香肉丝",
            "orderId": 100,
            "dishId": 1,
            "setmealId": null,
            "dishFlavor": "微辣",
            "number": 1,
            "amount": 28.00,
            "image": "https://oss.example.com/xxx.jpg"
          }
        ]
      }
    ]
  }
}
```

### 5.2 各状态订单数量统计

- **Method + Path**：`GET /admin/order/statistics`
- **简要说明**：查询各关键状态的订单数量，用于管理端状态 Tab。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：无
- **请求示例**：
```
GET /admin/order/statistics
```
- **响应字段说明**：`Result<OrderStatisticsVO>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `toBeConfirmed` | Integer | 待接单数量 |
| `confirmed` | Integer | 待派送数量 |
| `deliveryInProgress` | Integer | 派送中数量 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "toBeConfirmed": 3,
    "confirmed": 5,
    "deliveryInProgress": 2
  }
}
```

### 5.3 查询订单详情

- **Method + Path**：`GET /admin/order/details/{id}`
- **简要说明**：根据订单 ID 查询订单详情（含订单明细）。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `id` | Long | 是 | 订单 ID |

- **请求示例**：
```
GET /admin/order/details/100
```
- **响应字段说明**：`Result<OrderVO>`，字段同 [5.1 响应字段](#51-订单搜索) 中的 `OrderVO`。
- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 100,
    "number": "202609010001",
    "status": 2,
    "userId": 1,
    "orderTime": "2026-09-01 12:00:00",
    "amount": 88.00,
    "orderDetailList": [
      { "id": 1, "name": "鱼香肉丝", "orderId": 100, "dishId": 1, "number": 1, "amount": 28.00 }
    ]
  }
}
```

### 5.4 接单

- **Method + Path**：`PUT /admin/order/confirm`
- **简要说明**：商家确认接单，订单状态由"待接单(2)"变为"已接单(3)"。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `OrdersConfirmDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 是 | 订单 ID |
| `status` | Integer | 否 | 订单状态（接口实际使用传入的 id 处理） |

- **请求示例**：
```json
{ "id": 100, "status": 3 }
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 5.5 拒单

- **Method + Path**：`PUT /admin/order/rejection`
- **简要说明**：商家拒绝接单，需填写拒单原因。会触发退款流程（可能抛出异常）。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `OrdersRejectionDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 是 | 订单 ID |
| `rejectionReason` | String | 是 | 拒单原因 |

- **请求示例**：
```json
{ "id": 100, "rejectionReason": "库存不足" }
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 5.6 取消订单

- **Method + Path**：`PUT /admin/order/cancel`
- **简要说明**：商家主动取消订单，需填写取消原因。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `OrdersCancelDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 是 | 订单 ID |
| `cancelReason` | String | 是 | 取消原因 |

- **请求示例**：
```json
{ "id": 100, "cancelReason": "商家休息" }
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 5.7 派送订单

- **Method + Path**：`PUT /admin/order/delivery/{id}`
- **简要说明**：商家将订单状态由"已接单(3)"变为"派送中(4)"。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `id` | Long | 是 | 订单 ID |

- **请求示例**：
```
PUT /admin/order/delivery/100
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 5.8 完成订单

- **Method + Path**：`PUT /admin/order/complete/{id}`
- **简要说明**：商家将订单状态由"派送中(4)"变为"已完成(5)"。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `id` | Long | 是 | 订单 ID |

- **请求示例**：
```
PUT /admin/order/complete/100
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

---

## 6. 优惠券管理模块

源文件：`controller/admin/AdminCouponController.java`，路径前缀 `/admin/coupon`。

### 6.1 创建优惠券

- **Method + Path**：`POST /admin/coupon`
- **简要说明**：管理员创建一张优惠券模板（创建后处于草稿/未发布状态）。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `CouponDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | Long | 否 | 创建不传，修改时传 |
| `name` | String | 是 | 优惠券名称 |
| `type` | Integer | 是 | 优惠券类型：`1` 代金券，`2` 折扣券，`3` 赠品券 |
| `discountType` | Integer | 是 | 优惠计算方式：`1` 每满减，`2` 阶梯折扣，`3` 固定折扣 |
| `specific` | Integer | 是 | 是否指定商品：`0` 全场通用，`1` 指定商品/分类 |
| `discountValue` | BigDecimal | 是 | 优惠值（代金券为元，折扣券为折扣率如 80=8折） |
| `thresholdAmount` | BigDecimal | 否 | 使用门槛金额，`0` 或 null 表示无门槛 |
| `maxDiscountAmount` | BigDecimal | 否 | 最大优惠金额，null 表示不限制 |
| `obtainWay` | Integer | 是 | 获取方式：`1` 用户领取，`2` 兑换码，`3` 系统发放 |
| `issueBeginTime` | LocalDateTime | 否 | 可领取开始时间 |
| `issueEndTime` | LocalDateTime | 否 | 可领取结束时间 |
| `termDays` | Integer | 否 | 有效期天数（从领取日起算），`0` 表示使用固定有效期 |
| `termBeginTime` | LocalDateTime | 否 | 固定有效期开始时间（`termDays=0` 时使用） |
| `termEndTime` | LocalDateTime | 否 | 固定有效期结束时间（`termDays=0` 时使用） |
| `totalNum` | Integer | 是 | 发行总量 |
| `userLimit` | Integer | 否 | 每人限领数量，`0` 表示不限制 |
| `extParam` | String | 否 | 扩展参数（JSON 字符串） |
| `scopeIds` | List&lt;Long&gt; | 否 | 指定商品/分类 ID 列表（`specific=1` 时使用） |

- **请求示例**：
```json
{
  "name": "满100减20",
  "type": 1,
  "discountType": 1,
  "specific": 0,
  "discountValue": 20,
  "thresholdAmount": 100,
  "maxDiscountAmount": 20,
  "obtainWay": 1,
  "issueBeginTime": "2026-09-17 00:00:00",
  "issueEndTime": "2026-10-17 23:59:59",
  "termDays": 7,
  "totalNum": 1000,
  "userLimit": 1
}
```
- **响应字段说明**：`Result<Void>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 6.2 发布优惠券

- **Method + Path**：`PUT /admin/coupon/publish/{id}`
- **简要说明**：将优惠券状态由草稿变为"进行中"，对外可领。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `id` | Long | 是 | 优惠券 ID |

- **请求示例**：
```
PUT /admin/coupon/publish/1
```
- **响应字段说明**：`Result<Void>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 6.3 停止优惠券

- **Method + Path**：`PUT /admin/coupon/stop/{id}`
- **简要说明**：停止优惠券发放，状态变为"已停止"。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `id` | Long | 是 | 优惠券 ID |

- **请求示例**：
```
PUT /admin/coupon/stop/1
```
- **响应字段说明**：`Result<Void>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 6.4 分页查询优惠券

- **Method + Path**：`GET /admin/coupon/page`
- **简要说明**：按条件分页查询优惠券列表。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query - `CouponPageQueryDTO`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 优惠券名称（模糊） |
| `status` | Integer | 否 | 状态：`1` 进行中，`2` 已停止 |
| `page` | Integer | 是 | 当前页码（从 1 开始） |
| `pageSize` | Integer | 是 | 每页条数 |

- **请求示例**：
```
GET /admin/coupon/page?page=1&pageSize=10&status=1
```
- **响应字段说明**：`Result<PageResult>`，`data.records` 元素为 `CouponVO`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | Long | 优惠券 ID |
| `name` | String | 优惠券名称 |
| `typeDesc` | String | 类型描述（如"代金券"） |
| `ruleDesc` | String | 优惠规则描述（如"满100减20"） |
| `discountType` | Integer | 优惠计算方式 |
| `discountValue` | BigDecimal | 优惠值 |
| `thresholdAmount` | BigDecimal | 使用门槛 |
| `maxDiscountAmount` | BigDecimal | 最大优惠金额 |
| `issueBeginTime` | LocalDateTime | 可领取开始时间 |
| `issueEndTime` | LocalDateTime | 可领取结束时间 |
| `validityDesc` | String | 有效期说明 |
| `totalNum` | Integer | 发行总量 |
| `issueNum` | Integer | 已领取数量 |
| `remainNum` | Integer | 剩余数量 |
| `userLimit` | Integer | 每人限领数量 |
| `status` | Integer | 状态：`1` 进行中，`2` 已停止 |
| `statusDesc` | String | 状态描述 |
| `received` | Boolean | 当前用户是否已领取（管理端通常为 null） |
| `scopeDesc` | String | 适用范围描述 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 1,
    "records": [
      {
        "id": 1,
        "name": "满100减20",
        "typeDesc": "代金券",
        "ruleDesc": "满100减20",
        "discountType": 1,
        "discountValue": 20,
        "thresholdAmount": 100,
        "maxDiscountAmount": 20,
        "issueBeginTime": "2026-09-17 00:00:00",
        "issueEndTime": "2026-10-17 23:59:59",
        "validityDesc": "领取后7天有效",
        "totalNum": 1000,
        "issueNum": 50,
        "remainNum": 950,
        "userLimit": 1,
        "status": 1,
        "statusDesc": "进行中",
        "received": null,
        "scopeDesc": "全场通用"
      }
    ]
  }
}
```

### 6.5 查询优惠券详情

- **Method + Path**：`GET /admin/coupon/{id}`
- **简要说明**：根据优惠券 ID 查询优惠券详情。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `id` | Long | 是 | 优惠券 ID |

- **请求示例**：
```
GET /admin/coupon/1
```
- **响应字段说明**：`Result<CouponVO>`，字段同 [6.4 响应字段](#64-分页查询优惠券) 中的 `CouponVO`。
- **响应示例**：参考 [6.4 响应示例](#64-分页查询优惠券) 中 `records` 内单个对象。

### 6.6 删除优惠券

- **Method + Path**：`DELETE /admin/coupon/{id}`
- **简要说明**：根据 ID 删除单张优惠券。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `id` | Long | 是 | 优惠券 ID |

- **请求示例**：
```
DELETE /admin/coupon/1
```
- **响应字段说明**：`Result<Void>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 6.7 批量删除优惠券

- **Method + Path**：`DELETE /admin/coupon/batch`
- **简要说明**：根据 ID 列表批量删除优惠券。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query - `ids` 为 `List<Long>`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ids` | List&lt;Long&gt; | 是 | 待删除的优惠券 ID 列表 |

- **请求示例**：
```
DELETE /admin/coupon/batch?ids=1&ids=2&ids=3
```
- **响应字段说明**：`Result<Void>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 6.8 修改优惠券

- **Method + Path**：`PUT /admin/coupon`
- **简要说明**：修改优惠券配置（需带上 `id`）。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Body - `CouponDTO`，需带 `id`）：字段同 [6.1 请求参数](#61-创建优惠券)，需补充 `id`。
- **请求示例**：参考 [6.1 请求示例](#61-创建优惠券)，需补充 `id` 字段。
- **响应字段说明**：`Result<Void>`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

---

## 7. 商铺模块

源文件：`controller/admin/ShopController.java`，路径前缀 `/admin/shop`。营业状态存储于 Redis，key 为 `SHOP_STATUS`。

### 7.1 设置营业状态

- **Method + Path**：`PUT /admin/shop/{status}`
- **简要说明**：设置店铺营业状态。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：

| 位置 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Path | `status` | Integer | 是 | `1` 营业中，其它值表示打烊 |

- **请求示例**：
```
PUT /admin/shop/1
```
- **响应字段说明**：`Result`，`data` 为 `null`
- **响应示例**：
```json
{ "code": 1, "msg": null, "data": null }
```

### 7.2 获取营业状态

- **Method + Path**：`GET /admin/shop/status`
- **简要说明**：查询当前店铺营业状态。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：无
- **请求示例**：
```
GET /admin/shop/status
```
- **响应字段说明**：`Result<Integer>`，`data` 为状态值。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | Integer | `1` 营业中，其它值（含 null）表示打烊 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": 1
}
```

---

## 8. 工作台模块

源文件：`controller/admin/WorkSpaceController.java`，路径前缀 `/admin/workspace`。

### 8.1 工作台今日数据查询

- **Method + Path**：`GET /admin/workspace/businessData`
- **简要说明**：查询今日（当天 00:00:00 至 23:59:59）的核心经营数据。后端自动取当天时间范围。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：无
- **请求示例**：
```
GET /admin/workspace/businessData
```
- **响应字段说明**：`Result<BusinessDataVO>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `turnover` | Double | 营业额 |
| `validOrderCount` | Integer | 有效订单数 |
| `orderCompletionRate` | Double | 订单完成率 |
| `unitPrice` | Double | 平均客单价 |
| `newUsers` | Integer | 新增用户数 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "turnover": 4060.5,
    "validOrderCount": 120,
    "orderCompletionRate": 0.95,
    "unitPrice": 33.84,
    "newUsers": 8
  }
}
```

### 8.2 查询订单管理数据

- **Method + Path**：`GET /admin/workspace/overviewOrders`
- **简要说明**：查询订单管理概览数据。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：无
- **请求示例**：
```
GET /admin/workspace/overviewOrders
```
- **响应字段说明**：`Result<OrderOverViewVO>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `waitingOrders` | Integer | 待接单数量 |
| `deliveredOrders` | Integer | 待派送数量 |
| `completedOrders` | Integer | 已完成数量 |
| `cancelledOrders` | Integer | 已取消数量 |
| `allOrders` | Integer | 全部订单数量 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "waitingOrders": 3,
    "deliveredOrders": 5,
    "completedOrders": 80,
    "cancelledOrders": 2,
    "allOrders": 90
  }
}
```

### 8.3 查询菜品总览

- **Method + Path**：`GET /admin/workspace/overviewDishes`
- **简要说明**：查询菜品启售/停售数量统计。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：无
- **请求示例**：
```
GET /admin/workspace/overviewDishes
```
- **响应字段说明**：`Result<DishOverViewVO>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `sold` | Integer | 已启售数量 |
| `discontinued` | Integer | 已停售数量 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": { "sold": 30, "discontinued": 5 }
}
```

### 8.4 查询套餐总览

- **Method + Path**：`GET /admin/workspace/overviewSetmeals`
- **简要说明**：查询套餐启售/停售数量统计。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：无
- **请求示例**：
```
GET /admin/workspace/overviewSetmeals
```
- **响应字段说明**：`Result<SetmealOverViewVO>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `sold` | Integer | 已启售数量 |
| `discontinued` | Integer | 已停售数量 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": { "sold": 10, "discontinued": 2 }
}
```

---

## 9. 数据统计/报表模块

源文件：`controller/admin/ReportController.java`，路径前缀 `/admin/report`。

### 9.1 营业额统计

- **Method + Path**：`GET /admin/report/turnoverStatistics`
- **简要说明**：查询指定日期范围内的每日营业额。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `begin` | LocalDate | 是 | 开始日期，格式 `yyyy-MM-dd` |
| `end` | LocalDate | 是 | 结束日期，格式 `yyyy-MM-dd` |

- **请求示例**：
```
GET /admin/report/turnoverStatistics?begin=2026-09-01&end=2026-09-17
```
- **响应字段说明**：`Result<TurnoverReportVO>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `dateList` | String | 日期列表，以英文逗号分隔，如 `"2026-09-01,2026-09-02"` |
| `turnoverList` | String | 每日营业额，以英文逗号分隔，如 `"406.0,1520.0"` |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "dateList": "2026-09-01,2026-09-02,2026-09-03",
    "turnoverList": "406.0,1520.0,75.0"
  }
}
```

### 9.2 用户统计

- **Method + Path**：`GET /admin/report/userStatistics`
- **简要说明**：查询指定日期范围内的用户总量与每日新增用户。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `begin` | LocalDate | 是 | 开始日期，格式 `yyyy-MM-dd` |
| `end` | LocalDate | 是 | 结束日期，格式 `yyyy-MM-dd` |

- **请求示例**：
```
GET /admin/report/userStatistics?begin=2026-09-01&end=2026-09-17
```
- **响应字段说明**：`Result<UserReportVO>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `dateList` | String | 日期列表（逗号分隔） |
| `totalUserList` | String | 每日用户总量（逗号分隔） |
| `newUserList` | String | 每日新增用户数（逗号分隔） |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "dateList": "2026-09-01,2026-09-02",
    "totalUserList": "200,210",
    "newUserList": "20,10"
  }
}
```

### 9.3 订单统计

- **Method + Path**：`GET /admin/report/ordersStatistics`
- **简要说明**：查询指定日期范围内的每日订单数、有效订单数及完成率。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `begin` | LocalDate | 是 | 开始日期，格式 `yyyy-MM-dd` |
| `end` | LocalDate | 是 | 结束日期，格式 `yyyy-MM-dd` |

- **请求示例**：
```
GET /admin/report/ordersStatistics?begin=2026-09-01&end=2026-09-17
```
- **响应字段说明**：`Result<OrderReportVO>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `dateList` | String | 日期列表（逗号分隔） |
| `orderCountList` | String | 每日订单数（逗号分隔） |
| `validOrderCountList` | String | 每日有效订单数（逗号分隔） |
| `totalOrderCount` | Integer | 订单总数 |
| `validOrderCount` | Integer | 有效订单数 |
| `orderCompletionRate` | Double | 订单完成率 |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "dateList": "2026-09-01,2026-09-02",
    "orderCountList": "260,210",
    "validOrderCountList": "20,21",
    "totalOrderCount": 470,
    "validOrderCount": 41,
    "orderCompletionRate": 0.0872
  }
}
```

### 9.4 销量Top10

- **Method + Path**：`GET /admin/report/top10`
- **简要说明**：查询指定日期范围内销量 Top10 的商品。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `begin` | LocalDate | 是 | 开始日期，格式 `yyyy-MM-dd` |
| `end` | LocalDate | 是 | 结束日期，格式 `yyyy-MM-dd` |

- **请求示例**：
```
GET /admin/report/top10?begin=2026-09-01&end=2026-09-17
```
- **响应字段说明**：`Result<SalesTop10ReportVO>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `nameList` | String | 商品名称列表（逗号分隔），如 `"鱼香肉丝,宫保鸡丁"` |
| `numberList` | String | 销量列表（逗号分隔），如 `"260,215"` |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "nameList": "鱼香肉丝,宫保鸡丁,水煮鱼",
    "numberList": "260,215,200"
  }
}
```

### 9.5 导出报表

- **Method + Path**：`GET /admin/report/export`
- **简要说明**：导出近 30 天经营数据为 Excel 文件，直接以二进制流写入 HTTP 响应。
- **请求头**：`token: <jwt令牌>`
- **请求参数**：无
- **请求示例**：
```
GET /admin/report/export
```
- **响应字段说明**：无 JSON 响应。响应 `Content-Type` 由服务端设置为 Excel 对应类型，响应体为 Excel 文件二进制流。前端需以 `blob` 或 `arraybuffer` 方式接收并触发下载。
- **响应示例**：二进制流，无 JSON 示例。

> 说明：方法签名为 `void export(HttpServletResponse response)`，调用 `reportService.exportBusinessData(response)` 直接通过 response 输出流写入文件数据。

---

## 10. 公共模块-文件上传

源文件：`controller/admin/CommonController.java`，路径前缀 `/admin/common`。

### 10.1 上传图片

- **Method + Path**：`POST /admin/common/upload`
- **简要说明**：上传图片到阿里云 OSS，返回可访问的图片 URL。前端需以 `multipart/form-data` 方式提交。
- **请求头**：`token: <jwt令牌>`；`Content-Type: multipart/form-data`
- **请求参数**（Form Data）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `file` | MultipartFile | 是 | 待上传的图片文件 |

- **请求示例**（cURL）：
```bash
curl -X POST "http://localhost:8080/admin/common/upload" \
  -H "token: eyJhbGciOiJIUzI1NiJ9..." \
  -F "file=@/path/to/image.jpg"
```
- **响应字段说明**：`Result<String>`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | String | 上传成功后图片的可访问 URL |

- **响应示例**：
```json
{
  "code": 1,
  "msg": null,
  "data": "https://bucket.oss-cn-xxx.aliyuncs.com/abc-def-123.jpg"
}
```

> 失败时返回 `Result.error("上传失败")`，即 `{ "code": 0, "msg": "上传失败", "data": null }`。

### 10.2 文件下载

- **Method + Path**：`GET /admin/common/download`
- **简要说明**：根据文件名从 OSS 下载文件，以附件形式返回二进制流。
- **请求头**：`token: <jwt令牌>`
- **请求参数**（Query）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `fileName` | String | 是 | 文件名（URL 编码或原文件名） |

- **请求示例**：
```
GET /admin/common/download?fileName=abc-def-123.jpg
```
- **响应字段说明**：无 JSON 响应。响应头与响应体如下：

| 响应头/体 | 内容 | 说明 |
| --- | --- | --- |
| `Content-Type` | `application/octet-stream` | 二进制流 |
| `Content-Disposition` | `attachment;filename=<URL编码后的fileName>` | 以附件形式下载 |
| 响应体 | byte[] | 文件二进制内容 |

- **响应示例**：二进制流，无 JSON 示例。

> 说明：方法签名为 `void download(String fileName, HttpServletResponse response)`，直接通过 response 输出流写入文件字节。前端需以 `blob` 方式接收并触发下载。

---

## 附录A：枚举值速查表

### 菜品/套餐/分类状态
| 取值 | 含义 |
| --- | --- |
| `0` | 停售 / 禁用 |
| `1` | 起售 / 启用 |

### 员工状态
| 取值 | 含义 |
| --- | --- |
| `0` | 禁用 |
| `1` | 启用 |

### 分类类型
| 取值 | 含义 |
| --- | --- |
| `1` | 菜品分类 |
| `2` | 套餐分类 |

### 订单状态（Orders）
| 取值 | 含义 |
| --- | --- |
| `1` | 待付款 |
| `2` | 待接单 |
| `3` | 已接单 |
| `4` | 派送中 |
| `5` | 已完成 |
| `6` | 已取消 |

### 支付状态（Orders.payStatus）
| 取值 | 含义 |
| --- | --- |
| `0` | 未支付 |
| `1` | 已支付 |
| `2` | 退款 |

### 支付方式（Orders.payMethod）
| 取值 | 含义 |
| --- | --- |
| `1` | 微信 |
| `2` | 支付宝 |

### 配送状态（Orders.deliveryStatus）
| 取值 | 含义 |
| --- | --- |
| `0` | 选择具体时间 |
| `1` | 立即送出 |

### 餐具数量状态（Orders.tablewareStatus）
| 取值 | 含义 |
| --- | --- |
| `0` | 选择具体数量 |
| `1` | 按餐量提供 |

### 商铺营业状态
| 取值 | 含义 |
| --- | --- |
| `1` | 营业中 |
| 其它/null | 打烊中 |

### 优惠券类型（Coupon.type）
| 取值 | 含义 |
| --- | --- |
| `1` | 代金券 |
| `2` | 折扣券 |
| `3` | 赠品券 |

### 优惠计算方式（Coupon.discountType）
| 取值 | 含义 |
| --- | --- |
| `1` | 每满减（可叠加） |
| `2` | 阶梯折扣 |
| `3` | 固定折扣 |

### 是否指定商品（Coupon.specific）
| 取值 | 含义 |
| --- | --- |
| `0` | 全场通用 |
| `1` | 指定商品/分类 |

### 获取方式（Coupon.obtainWay）
| 取值 | 含义 |
| --- | --- |
| `1` | 用户主动领取 |
| `2` | 兑换码兑换 |
| `3` | 系统自动发放 |

### 优惠券状态（Coupon.status）
| 取值 | 含义 |
| --- | --- |
| `0` | 草稿 |
| `1` | 进行中 |
| `2` | 已停止 |
| `3` | 已过期 |

### 用户优惠券状态（UserCouponVO.status）
| 取值 | 含义 |
| --- | --- |
| `1` | 未使用 |
| `2` | 已使用 |
| `3` | 已过期 |

### 兑换码状态（ExchangeCode.status）
| 取值 | 含义 |
| --- | --- |
| `0` | 未使用 |
| `1` | 已使用 |
| `2` | 已失效 |

### 兑换码类型（ExchangeCode.type）
| 取值 | 含义 |
| --- | --- |
| `1` | 兑换指定优惠券 |
| `2` | 兑换积分 |
| `3` | 兑换其他权益 |

### 优惠券适用范围类型（CouponScope.type）
| 取值 | 含义 |
| --- | --- |
| `1` | 指定商品（dish/setmeal） |
| `2` | 指定分类（category） |

### 优惠计算请求-商品类型（CouponCalculateDTO.OrderItemDTO.itemType）
| 取值 | 含义 |
| --- | --- |
| `1` | 菜品 |
| `2` | 套餐 |
