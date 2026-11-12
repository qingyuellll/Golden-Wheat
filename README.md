# 🌾 麦子黄了

> 麦穗金黄，食光正好 —— 一站式智慧餐饮管理与点餐全栈平台

## 项目简介

「麦子黄了」是一个完整的餐饮全栈系统，涵盖**管理后台**与**用户点餐端**，支持菜品/套餐管理、购物车、订单流转、优惠券策略、数据报表、AI 智能客服等核心功能。

## 技术栈

### 后端

| 技术 | 说明 |
|------|------|
| Spring Boot 3.2 | 核心框架 |
| Java 17 | 运行环境 |
| MyBatis | ORM 持久层 |
| MySQL + Druid | 数据库与连接池 |
| Redis + Redisson | 缓存 & 分布式锁 |
| RabbitMQ | 异步消息队列 |
| WebSocket | 实时通信 |
| Spring AI (OpenAI) | AI 智能客服 |
| Aliyun OSS | 文件/图片存储 |
| Knife4j (OpenAPI 3) | 接口文档 |
| Apache POI | Excel 报表导出 |
| JWT | 身份认证 |

### 管理端前端

| 技术 | 说明 |
|------|------|
| React 18 + TypeScript | 核心框架 |
| Vite | 构建工具 |
| Tailwind CSS + shadcn/ui | UI 样式 |
| Zustand | 状态管理 |
| ECharts | 数据可视化 |
| React Router v6 | 路由 |
| Axios | HTTP 请求 |

### 用户端前端

| 技术 | 说明 |
|------|------|
| React 18 | 核心框架 |
| Vite | 构建工具 |
| Tailwind CSS | UI 样式 |
| React Router v6 | 路由 |
| Lucide React | 图标库 |

## 项目结构

```
麦子黄了/
├── Backend/                    # 后端服务
│   ├── common/                 # 公共模块（工具类、常量、异常、配置）
│   ├── pojo/                   # 实体模块（DTO / Entity / VO）
│   ├── server/                 # 核心服务（Controller / Service / Mapper）
│   ├── API_ADMIN.md            # 管理端接口文档
│   ├── API_USER.md             # 用户端接口文档
│   └── pom.xml
├── Frontend/
│   ├── admin/                  # 管理后台前端
│   └── user-web/               # 用户点餐端前端
└── README.md
```

## 核心功能

- 🍽️ **菜品与套餐管理** — 分类、口味、上下架、图片上传
- 🛒 **购物车与下单** — 加减菜品、口味选择、地址管理
- 📋 **订单全流程** — 下单 → 支付 → 接单 → 配送 → 完成
- 🎟️ **优惠券系统** — 满减券、折扣券、兑换码、最优券自动匹配
- 📊 **数据报表** — 营业额统计、订单分析、销量 Top10、Excel 导出
- 🤖 **AI 智能客服** — 基于 Spring AI 的实时对话（WebSocket）
- 👨‍💼 **员工管理** — 登录、权限、分页查询
- 🏪 **店铺设置** — 营业状态切换
