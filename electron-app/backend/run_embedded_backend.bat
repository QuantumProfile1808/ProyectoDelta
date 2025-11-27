@echo off
cd /d "%~dp0"

REM Agregar backend al PYTHONPATH
set PYTHONPATH=%~dp0

REM Ejecutar Django con Python embedded
..\python-embed\python.exe manage.py runserver 127.0.0.1:8000