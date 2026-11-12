# syntax=docker/dockerfile:1
# ============================================================
# 麦子黄了 - 后端服务镜像（多阶段构建）
# 阶段1：容器内用 Maven 编译打包，不依赖宿主机 JDK/Maven
# 阶段2：只带 JRE + 可执行 jar，镜像体积小
# ============================================================

FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# 使用阿里云 Maven 镜像加速依赖下载（国内直连中央仓库很慢）
COPY docker/maven-settings.xml /root/.m2/settings.xml

# 先复制 pom，单独解析依赖，让这一层能被 Docker 缓存
COPY pom.xml ./
COPY common/pom.xml  common/pom.xml
COPY pojo/pom.xml    pojo/pom.xml
COPY server/pom.xml  server/pom.xml
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn -B -q -pl server -am dependency:resolve -DskipTests || true

# 再复制源码编译
COPY . .
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn -B -DskipTests clean package \
 && cp server/target/server-1.0-SNAPSHOT.jar /build/app.jar

# ------------------------------------------------------------
FROM eclipse-temurin:17-jre

ENV TZ=Asia/Shanghai \
    JAVA_OPTS="-Xms256m -Xmx512m"

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
COPY --from=builder /build/app.jar /app/app.jar

EXPOSE 8080

# 容器健康检查：能连上 8080 就认为进程已起来
HEALTHCHECK --interval=15s --timeout=5s --start-period=90s --retries=8 \
  CMD bash -c 'exec 3<>/dev/tcp/127.0.0.1/8080' || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Duser.timezone=Asia/Shanghai -jar /app/app.jar"]
