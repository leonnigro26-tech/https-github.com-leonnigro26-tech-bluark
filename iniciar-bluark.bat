@echo off
cd /d "%~dp0"
python server.py
if errorlevel 1 (
  echo.
  echo No se pudo iniciar Bluark porque falta Python.
  echo Instalalo desde https://www.python.org/downloads/ y volve a abrir este archivo.
  pause
)
