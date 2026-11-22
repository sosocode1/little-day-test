@echo off
chcp 65001 >nul
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=1
"C:\Users\배소예\AppData\Local\Programs\antigravity\Antigravity.exe" ".\node_modules\vite\bin\vite.js" --host --port 5173
pause
