@echo off
chcp 65001 >nul
title StudyOS - Push to GitHub
cd /d "%~dp0"

set "GIT=C:\Users\16379\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"
if not exist "%GIT%" set "GIT=git"

type "%~dp0github-help.txt"
echo.
echo   ------------------------------------------------------------
"%GIT%" remote -v
echo   ------------------------------------------------------------
echo.
echo   pushing ...  (a GitHub sign-in window may pop up; just follow it)
echo.
"%GIT%" push -u origin main
set "RC=%ERRORLEVEL%"
echo.
if not "%RC%"=="0" goto fail

echo   [ OK ] pushed successfully.
echo.
echo   Last step - turn on the web page:
echo     GitHub  -^>  Settings  -^>  Pages
echo     Source: "Deploy from a branch"
echo     Branch: main   /   folder: / (root)   -^>  Save
echo.
echo   About one minute later your page is live at:
echo     https://mia-ywf.github.io/study-plan/
echo.
goto end

:fail
echo   [ FAILED ] read the red text above.
echo.
echo   - "Repository not found" = the repo name in the URL is wrong.
echo     Copy the HTTPS url from the green "Code" button on GitHub, then run:
echo        "%GIT%" remote set-url origin PASTE_URL_HERE
echo        "%GIT%" push -u origin main
echo.
echo   - "Authentication failed" = sign in again when the window pops up.
echo   - nothing happens / no window = GitHub may be unreachable; check your network.
echo.

:end
pause
