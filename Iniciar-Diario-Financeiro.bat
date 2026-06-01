@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Diario Financeiro
cd /d "%~dp0"

set "PORT=8786"
set "URL=http://127.0.0.1:%PORT%/"

echo.
echo  Diario Financeiro
echo  URL: %URL%
echo  (porta 8765 = FREEDOM - nao usar)
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)

where python >nul 2>&1
if errorlevel 1 (
  echo Python nao encontrado. Usando servidor PowerShell...
  start "Diario Financeiro Servidor" cmd /k "cd /d "%~dp0" && powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Servidor-local.ps1""
) else (
  echo Iniciando servidor Python na porta %PORT%...
  start "Diario Financeiro Servidor" cmd /k "cd /d "%~dp0" && python -m http.server %PORT% --bind 127.0.0.1"
)

set /a _t=0
:aguarda
timeout /t 1 /nobreak >nul
set /a _t+=1
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri '%URL%' -TimeoutSec 2; if ($r.Content -match 'Diário Financeiro|Diario Financeiro') { exit 0 } else { exit 2 } } catch { exit 1 }" >nul 2>&1
if !errorlevel!==0 goto abrir
if !_t! lss 15 goto aguarda

echo.
echo  Nao conectou em %URL%
echo  Veja a janela "Diario Financeiro Servidor" (erro la).
echo  Ou abra manualmente depois que aparecer "Serving HTTP".
echo.
pause
exit /b 1

:abrir
start "" "%URL%"
echo  Aberto no navegador.
timeout /t 2 /nobreak >nul
endlocal
