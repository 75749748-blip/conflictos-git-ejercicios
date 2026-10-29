@echo off
title GITCAP07 - cherry-pick
mode con: cols=95 lines=40
cd /d C:\Users\gambo\Documents\Git-Conflictos
cls
set CAPTURE_MODE=1
set CAPTURE_DIR=C:/Users/gambo/Documents/Git-Conflictos/build/real-captures/flags
set CAPTURE_TAG=07
set CAPTURE_LIMIT=36
set LOG=C:\Users\gambo\Documents\Git-Conflictos/ejercicios/logs/07-cherry-pick.log
"C:\Program Files\Git\bin\bash.exe" -c "bash ejercicios/07-cherry-pick.sh"
echo %ERRORLEVEL% > "C:\Users\gambo\Documents\Git-Conflictos\build\real-captures\done-07.txt"
for /L %%i in (1,1,900) do (
  if exist "C:\Users\gambo\Documents\Git-Conflictos\build\real-captures\close-07.flag" goto :end
  timeout /t 1 /nobreak >nul
)
:end