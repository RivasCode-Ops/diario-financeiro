@echo off
chcp 65001 >nul
title Diario Financeiro - Celular na mesma Wi-Fi
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Publicar-Celular.ps1"
pause
