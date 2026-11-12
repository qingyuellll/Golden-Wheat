@echo off
setlocal
title Golden Wheat - Stop

echo Stopping Golden Wheat services (only processes listening on these ports) ...
echo.

call :kill_port 5174 "User Web"
call :kill_port 5173 "Admin Web"
call :kill_port 8080 "Backend"

echo.
echo MySQL / RabbitMQ (Windows services) and Redis are left running.
echo To stop Redis: close the GW-Redis window, or run: taskkill /F /IM redis-server.exe
echo To stop MySQL : net stop MySQL80
echo To stop RabbitMQ: net stop RabbitMQ
echo.
pause
exit /b 0

:kill_port
rem %1=port %2=label
set PIDS=
for /f "tokens=5" %%p in ('netstat -ano ^| findstr "LISTENING" ^| findstr /C:":%1 "') do (
    if not "%%p"=="0" set PIDS=%%p
)
if "%PIDS%"=="" (
    echo   [SKIP] %~2 :%1 not running
) else (
    taskkill /F /PID %PIDS% >nul 2>&1
    echo   [DONE] %~2 :%1 stopped (pid %PIDS%)
)
exit /b 0
