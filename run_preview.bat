@echo off
chcp 65001 >nul
cd /d "%~dp0"
title LITTLE DAY - Preview Server
echo ====================================================
echo   LITTLE DAY Production Preview Server Starting...
echo ====================================================
where node >nul 2>&1
if %errorlevel% equ 0 (
    npm run preview -- --host
) else (
    set ELECTRON_RUN_AS_NODE=1
    "C:\Users\배소예\AppData\Local\Programs\antigravity\Antigravity.exe" ".\node_modules\vite\bin\vite.js" preview --host
)
pause
