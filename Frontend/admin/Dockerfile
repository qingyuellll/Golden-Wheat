# syntax=docker/dockerfile:1
# 管理后台前端：Node 构建 -> Nginx 托管静态文件
# 反向代理：/admin -> 后端 8080，/ws -> 后端 WebSocket
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

COPY package.json package-lock.json ./
# 挂载 npm 缓存目录，重复构建不用重新下载依赖
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund --maxsockets=50

COPY . .
RUN npm run build

# ------------------------------------------------------------
FROM nginx:1.27-alpine

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
