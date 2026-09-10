@echo off
chcp 65001 >nul
title StudyOS - Phone Access
cd /d "%~dp0"
echo.
type "%~dp0phone-help.txt"
echo.
echo   [1]  ------------------------------
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr "192.168."') do (
  for /f "tokens=* delims= " %%b in ("%%a") do echo        http://%%b:8000/outputs/study_os.html
)
echo   [2]  ------------------------------
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "192.168."') do (
  for /f "tokens=* delims= " %%b in ("%%a") do echo        http://%%b:8000/outputs/study_os.html
)
echo        ------------------------------
echo.
start "" "http://127.0.0.1:8000/outputs/study_os.html"
py -3 -m http.server 8000
if errorlevel 1 python -m http.server 8000
pause
