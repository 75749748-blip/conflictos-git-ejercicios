@echo off
title GITCAP03 - modificar y eliminar
mode con: cols=95 lines=40
cd /d C:\Users\gambo\Documents\Git-Conflictos
cls
set CAPTURE_MODE=1
set CAPTURE_DIR=C:/Users/gambo/Documents/Git-Conflictos/build/real-captures/flags
set CAPTURE_TAG=03
set CAPTURE_LIMIT=36
set LOG=C:\Users\gambo\Documents\Git-Conflictos/ejercicios/logs/03-modificar-eliminar.log
"C:\Program Files\Git\bin\bash.exe" -c "bash ejercicios/03-modificar-eliminar.sh"
echo %ERRORLEVEL% > "C:\Users\gambo\Documents\Git-Conflictos\build\real-captures\done-03.txt"
for /L %%i in (1,1,900) do (
  if exist "C:\Users\gambo\Documents\Git-Conflictos\build\real-captures\close-03.flag" goto :end
  timeout /t 1 /nobreak >nul
)
:end