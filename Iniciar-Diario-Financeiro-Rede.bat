@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Diario Financeiro (rede Wi-Fi)
cd /d "%~dp0"

set "PORT=8790"

where python >nul 2>&1
if errorlevel 1 (
  echo Precisa do Python instalado para acesso pelo celular.
  pause
  exit /b 1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Servidor na rede local, porta %PORT%
echo No celular (mesma Wi-Fi), use um destes:
echo.

for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "ip=%%i"
  set "ip=!ip:~1!"
  echo   http://!ip!:%PORT%/
)

echo.
start "Diario Financeiro Rede" cmd /k "cd /d "%~dp0" && python -m http.server %PORT% --bind 0.0.0.0"
pause
endlocal
