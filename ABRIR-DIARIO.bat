@echo off
chcp 65001 >nul
title Diario Financeiro
cd /d "%~dp0"
call "%~dp0Iniciar-Diario-Financeiro.bat"
