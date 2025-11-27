@echo off
set PYDIR=%~dp0..\python-embed
"%PYDIR%\python.exe" "%~dp0manage.py" runserver 127.0.0.1:8000