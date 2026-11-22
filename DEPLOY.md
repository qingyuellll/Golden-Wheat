# 麦子黄了 · Docker 打包部署指南

> 面向本机 / 单机服务器的一键部署。全套 6 个容器：MySQL、Redis、RabbitMQ、后端、管理后台、用户端。

---

## 一、先搞清楚：Docker 登录不是部署的前提

你卡住的「登录不上」和「不知道怎么打包部署」其实是两件不相干的事，先说清楚：

| 你以为 | 实际情况 |
|---|---|
| 必须登录 Docker 账号才能用 Docker | ❌ 不用。`build`、`run`、`compose` 全部不需要登录 |
| 登录失败 = Docker 坏了 | ❌ 不是。你的 Docker 引擎本身是健康的（`docker version` 正常返回 Server 信息） |
| 登录失败 = 拉不了镜像 | ✅ 这部分对，但**根因是网络**，不是账号 |

**为什么登录失败**：Docker Desktop 点登录时，客户端要访问 `https://hub.docker.com` 换取 token。实测你机器上：

```
registry-1.docker.io   → 连接失败（000）
hub.docker.com         → 连接失败（000）
```

两个域名都不通，所以登录 100% 会失败/转圈。

**结论**：登录只在你需要 `docker push` 到 Docker Hub 时才有用。你自己打包发布，完全可以跳过登录（Docker Desktop 登录框上点 *Continue without signing in* / 关掉即可）。

**已经帮你做了什么**：在本机 Docker 配置文件（Windows：`%USERPROFILE%\.docker\daemon.json`，macOS/Linux：`~/.docker/daemon.json`）里配了 4 个国内镜像加速器并重启了 Docker Desktop，现在 `docker pull mysql:8.0`、`redis:7-alpine` 都能正常拉下来，**这就是打包部署真正需要的能力**。

> 注意：加速器只解决「拉镜像」。如果你仍然想登进 Docker Hub 账号，还是得让 `hub.docker.com` 可达（公司代理 / 科学上网工具），否则照样登不上。这不影响部署。

---

## 二、快速开始

在项目根目录 `D:\Golden Wheat` 下：

```bash
# 1. 构建三个业务镜像（后端首次会下载 Maven 依赖，约 3-8 分钟）
docker compose build

# 2. 启动全套服务（数据库首次启动会自动建表 + 灌种子数据）
docker compose up -d

# 3. 看状态，等所有服务变成 healthy
docker compose ps
```

打开浏览器：

| 入口 | 地址 | 账号 |
|---|---|---|
| 管理后台 | http://localhost:8082 | `admin` / `123456` |
| 用户点餐端 | http://localhost:8000 | 见文末「已知限制」 |
| 后端接口直连 | http://localhost:8080 | — |

常用运维命令：

```bash
docker compose logs -f backend    # 跟后端日志
docker compose restart backend    # 只重启后端
docker compose down               # 停止（数据保留）
docker compose down -v            # 停止并清空数据库/Redis/MQ 数据
```

---

## 三、这次新增了哪些文件

```
D:\Golden Wheat\
├── docker-compose.yml                    # 总编排（6 个服务）
├── .env.example                          # 配置模板，复制成 .env 后改这里
├── deploy/
│   └── mysql-init/
│       ├── 01_schema.sql                 # 建表脚本（复制自 Backend/sql/coffee_schema.sql）
│       └── 02_seed.sql                   # 种子数据：管理员账号 + 分类 + 菜品
├── Backend/
│   ├── Dockerfile                        # 多阶段构建：Maven 编译 → JRE 运行
│   ├── .dockerignore
│   ├── docker/maven-settings.xml         # 阿里云 Maven 镜像（否则容器内拉依赖极慢）
│   └── server/src/main/resources/
│       └── application-docker.yml        # docker profile：主机名从 localhost 改成服务名
└── Frontend/
    ├── admin/
    │   ├── Dockerfile                    # Node 构建 → Nginx 托管
    │   ├── nginx.conf                    # /admin、/ws 反向代理到 backend:8080
    │   └── .dockerignore
    └── user-web/
        ├── Dockerfile
        ├── nginx.conf                    # /user、/api、/notify 反向代理
        └── .dockerignore
```

**关键改动点**：`application-dev.yml` 里数据库、Redis、MQ 的地址全是 `localhost`。容器之间 `localhost` 指向自己，所以必须有 `application-docker.yml` 把它们改成服务名 `mysql` / `redis` / `rabbitmq`。这是「本地能跑、Docker 跑不起来」最常见的坑。

---

## 四、要改配置怎么改

```bash
# 复制模板
cp .env.example .env
```

然后在 `.env` 里改，改完 `docker compose up -d` 生效（改镜像内部配置则需要 `--build`）：

| 变量 | 作用 | 默认 |
|---|---|---|
| `ADMIN_PORT` / `USER_WEB_PORT` / `BACKEND_PORT` | 对外端口 | 8082 / 8000 / 8080 |

> 管理端默认用 8082 而不是 8081，是因为**你这台机器上 8081 已经被别的程序占着**（实测监听中），换掉可以避免启动失败。如果你的机器空闲，`.env` 里改成 8081 即可。
| `MYSQL_ROOT_PASSWORD` | 数据库 root 密码 | 123456 |
| `MYSQL_DATABASE` | 库名 | coffee |
| `RABBITMQ_USER` / `RABBITMQ_PASSWORD` | MQ 账号（**不能用 guest**，见下） | mzhl / mzhl123456 |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` | AI 客服（DeepSeek） | 仓库里原有的 key |
| `ALIOSS_*` | 菜品图片上传 | 仓库里原有的 OSS 配置 |
| `JAVA_OPTS` | JVM 内存 | -Xms256m -Xmx512m |

> **RabbitMQ 为什么要自定义账号**：官方镜像的 `guest` 账号只允许从 `localhost` 登录。后端在另一个容器里连过来会被拒（`ACCESS_REFUSED - user 'guest' can only connect via localhost`），所以这里必须用 `RABBITMQ_DEFAULT_USER` 建独立账号。

---

## 五、数据库初始化规则（重要）

`deploy/mysql-init/*.sql` 只在**数据卷为空**（第一次启动）时执行。

- 想重新初始化：`docker compose down -v` 再 `up -d` → 数据全清、重新建表灌数据。
- 改了 `02_seed.sql` 但不想清库：手动执行
  ```bash
  docker compose exec -T mysql mysql -uroot -p123456 coffee < deploy/mysql-init/02_seed.sql
  ```
- `Backend/sql/migrations/` 里那些 `ALTER` 脚本**不要**再跑，`coffee_schema.sql` 已经是最新结构（含 `salt` 字段），重复执行会报字段已存在。

---

## 六、打包发布到另一台服务器

### 方式 A：有代码仓库（推荐）

服务器装好 Docker 后，拉代码，执行第二节的三条命令即可。

### 方式 B：离线搬运镜像（目标机器无法联网构建）

```bash
# 本机导出
docker save golden-wheat/backend:latest golden-wheat/admin-web:latest golden-wheat/user-web:latest -o gw-images.tar
docker save mysql:8.0 redis:7-alpine rabbitmq:3.13-management-alpine -o gw-base.tar

# 拷到服务器后导入
docker load -i gw-base.tar
docker load -i gw-images.tar

# 服务器上只带 compose + 初始化 SQL，不要带 build 段
docker compose up -d --no-build
```

### 方式 C：推到自己的私有仓库

```bash
# 例如阿里云容器镜像服务（免费个人版，且自带加速地址）
docker login registry.cn-hangzhou.aliyuncs.com
docker tag golden-wheat/backend:latest registry.cn-hangzhou.aliyuncs.com/<你的命名空间>/gw-backend:1.0
docker push registry.cn-hangzhou.aliyuncs.com/<你的命名空间>/gw-backend:1.0
```

> 这条路不需要 Docker Hub 账号，也不受墙影响，是公司内网/国内服务器最省心的做法。

---

## 七、常见问题

**1. 后端容器起来了但马上退出**
看日志，九成是连不上 MySQL / Redis / MQ 或配置缺失：
```bash
docker compose logs backend | tail -50
```
`backend` 已经配了 `depends_on: condition: service_healthy`，等前面三个 healthy 才会启动，如果一直不启动就是前置服务没起来，先 `docker compose ps` 看谁 unhealthy。

**2. 本机 3306 / 6379 / 5672 / 8080 被占用**
本机如果已经装了 MySQL/Redis 在跑，会冲突。compose 里数据库和 MQ 的端口默认**不映射到宿主机**（只在内网互通），就是为了避开这个坑；如果 8080 被占，改 `.env` 里的 `BACKEND_PORT`。

**3. 拉镜像失败 `failed to resolve reference`**
确认加速器还生效：
```bash
docker info | grep -A5 "Registry Mirrors"
```
如果列表为空，说明 `daemon.json` 没被读到，重启 Docker Desktop 再看。

**4. 前端页面 404 或白屏**
- 404：nginx 的 `try_files` 已配 SPA 回退，若仍 404 说明构建产物没进镜像，重建：`docker compose build --no-cache admin-web`。
- 白屏 + 控制台 502：后端没起来，nginx 转发失败。

**5. 前端 TS 报错导致构建失败**
`npm run build` 会先跑 `tsc --noEmit`。本机已验证能编译通过；如果你改了代码引入类型错误，构建会中断，先本地 `npm run build` 修好。

**6. 镜像加速器失效**
第三方加速器会不定期挂。换一个写进 `daemon.json` 的 `registry-mirrors`，重启 Docker Desktop。当前可用的备选：`https://docker.1panel.live`、`https://docker.m.daocloud.io`、`https://docker.1ms.run`。

---

## 八、已知限制（项目本身的问题，不是部署问题）

1. **用户端登录需要微信凭据**：`/user/user/login` 走的是小程序 `code` 换 `openid`，必须有真实 `appid` + `secret` 且从小程序发起。容器里没有这个条件，所以**用户端登录会失败**。验收请先用管理后台（`admin`/`123456`）。
2. **菜品图片为空**：种子数据里 `image` 留空，因为图片存在你自己的阿里云 OSS 上。在后台「菜品管理」上传图片即可（需 `ALIOSS_*` 配置有效）。
3. **微信支付是占位配置**：`mchId`、证书路径等都是假值，下单支付环节不会真的拉起支付。走「跳过支付」流程验收订单流转。
4. **OSS Access Key 目前明文写在 `application-dev.yml` 和 `.env.example` 里**。这是个安全隐患，建议尽快在阿里云控制台轮换该密钥，改成只通过 `.env` 注入。
