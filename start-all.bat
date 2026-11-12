@echo off
setlocal
title Golden Wheat - One Click Start

set ROOT=D:\Golden Wheat
set JAR=%ROOT%\Backend\server\target\server-1.0-SNAPSHOT.jar
set JAVA_EXE=D:\study\jdk17\bin\java.exe
set REDIS_EXE=D:\study\Redis-7.0.13\Redis-7.0.13-Windows-x64-msys2\redis-server.exe
set USERWEB_DIR=%ROOT%\Frontend\user-web
set ADMIN_DIR=%ROOT%\Frontend\admin

echo ============================================
echo   Golden Wheat - One Click Start
echo ============================================
echo.

REM ---------- 0. sanity checks ----------
if not exist "%JAR%" (
    echo [ERROR] Backend jar not found:
    echo         %JAR%
    echo Build it first:
    echo         cd /d "%ROOT%\Backend"  ^&^&  mvn -DskipTests package
    goto :fail
)
if not exist "%JAVA_EXE%" (
    echo [ERROR] Java 17 not found at %JAVA_EXE%
    goto :fail
)
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found in PATH
    goto :fail
)

REM ---------- 1. infrastructure: MySQL / RabbitMQ / Redis ----------
call :port_up 3306
if errorlevel 1 (
    echo [INFO] MySQL not running, starting service MySQL80 ...
    net start MySQL80
) else (
    echo [ OK ] MySQL          :3306 already running
)

call :port_up 5672
if errorlevel 1 (
    echo [INFO] RabbitMQ not running, starting service RabbitMQ ...
    net start RabbitMQ
) else (
    echo [ OK ] RabbitMQ       :5672 already running
)

call :port_up 6379
if errorlevel 1 (
    if exist "%REDIS_EXE%" (
        echo [INFO] Redis not running, starting redis-server ...
        start "GW-Redis" "%REDIS_EXE%"
        call :wait_port 6379 10
    ) else (
        echo [WARN] Redis exe not found at %REDIS_EXE%
        echo        Please start Redis manually, backend needs it.
    )
) else (
    echo [ OK ] Redis          :6379 already running
)

call :port_up 3306
if errorlevel 1 echo [WARN] MySQL STILL DOWN - backend will fail to start
call :port_up 5672
if errorlevel 1 echo [WARN] RabbitMQ STILL DOWN - order push will not work
call :port_up 6379
if errorlevel 1 echo [WARN] Redis STILL DOWN - backend will fail to start

echo.

REM ---------- 2. backend ----------
call :port_up 8080
if errorlevel 1 (
    echo [INFO] Starting backend :8080 - window GW-Backend ...
    start "GW-Backend" /D "%ROOT%\Backend" cmd /k %JAVA_EXE% -jar server\target\server-1.0-SNAPSHOT.jar --spring.profiles.active=dev --server.port=8080
) else (
    echo [ OK ] Backend        :8080 already running
)

REM ---------- 3. frontends ----------
call :port_up 5174
if errorlevel 1 (
    echo [INFO] Starting user-web :5174 - window GW-UserWeb ...
    start "GW-UserWeb" /D "%USERWEB_DIR%" cmd /k npm run dev
) else (
    echo [ OK ] User-web       :5174 already running
)

call :port_up 5173
if errorlevel 1 (
    echo [INFO] Starting admin :5173 - window GW-Admin ...
    start "GW-Admin" /D "%ADMIN_DIR%" cmd /k npm run dev
) else (
    echo [ OK ] Admin          :5173 already running
)

echo.
echo Waiting for services to come up - max 120s ...
call :wait_port 8080 40
call :wait_port 5174 30
call :wait_port 5173 30

echo.
echo ============================================
echo   STATUS
echo ============================================
call :report 3306 "MySQL"
call :report 5672 "RabbitMQ"
call :report 6379 "Redis"
call :report 8080 "Backend API"
call :report 5174 "User Web"
call :report 5173 "Admin Web"
echo.
echo   User Web : http://localhost:5174
echo   Admin Web: http://localhost:5173
echo   Admin login: admin / 123456
echo   Backend health: http://localhost:8080/user/shop/status
echo ============================================
echo.
echo NOTE: backend first start takes ~30s. If a port is still down,
echo       check its window (GW-Backend / GW-UserWeb / GW-Admin) for errors.
echo.
goto :end

REM ---------- helpers ----------
:port_up
netstat -ano | findstr "LISTENING" | findstr /C:":%1 " >nul 2>&1
exit /b %errorlevel%

:wait_port
rem %1=port %2=max loops
set /a TRIES=0
:wait_loop
call :port_up %1
if not errorlevel 1 exit /b 0
set /a TRIES+=1
if %TRIES% geq %2 (
    echo [WARN] Port %1 not up after %2 checks
    exit /b 1
)
timeout /t 3 /nobreak >nul
goto :wait_loop

:report
call :port_up %1
if errorlevel 1 (
    echo   [DOWN] %~2 :%1
) else (
    echo   [ UP ] %~2 :%1
)
exit /b 0

:fail
echo.
echo Start aborted. Fix the problem above and run again.
pause
exit /b 1

:end
pause
