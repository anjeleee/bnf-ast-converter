@echo off
setlocal enabledelayedexpansion

:: Change directory to script root
cd /d "%~dp0"

title BNFgen - Compiler Syntax Analyzer and Tree Visualizer
color 0B

echo ===============================================================================
echo               BNFgen: Compiler Syntax Analyzer and Tree Visualizer            
echo                 Course Final Project - Formal Language Parser               
echo ===============================================================================
echo.

:: 1. Detect Python Environment
echo [*] Checking Python environment...

set "PYTHON_CMD="
if exist "%~dp0backend\bnf\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0backend\bnf\Scripts\python.exe"
) else if exist "%~dp0venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0venv\Scripts\python.exe"
) else if exist "%~dp0backend\venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0backend\venv\Scripts\python.exe"
) else (
    where python >nul 2>nul
    if !errorlevel! equ 0 (
        set "PYTHON_CMD=python"
    )
)

if not defined PYTHON_CMD (
    echo [ERROR] Python 3 was not found in system PATH or virtual environment.
    echo Please install Python 3.8+ from https://www.python.org/
    echo IMPORTANT: Check 'Add python.exe to PATH' during installation.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('"%PYTHON_CMD%" --version 2^>^&1') do set "PYTHON_VER=%%i"
echo [*] Python detected: !PYTHON_VER!

:: 2. Verify Backend Dependencies
echo [*] Verifying backend dependencies (fastapi, uvicorn, pydantic)...
"%PYTHON_CMD%" -m pip install -q -r "%~dp0backend\requirements.txt"

:: 3. Free Port 8000 if occupied
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    if "%%a" neq "0" (
        echo [*] Port 8000 is occupied by PID %%a. Releasing port...
        taskkill /f /t /pid %%a >nul 2>nul
        ping -n 2 127.0.0.1 >nul
    )
)

:: 4. Verify Web Assets
if exist "%~dp0frontend\index.html" (
    echo [*] Frontend web interface verified (pure HTML/CSS/JS mode).
) else (
    echo [WARNING] frontend\index.html not found.
)

echo.
echo ===============================================================================
echo   Web GUI URL   : http://localhost:8000
echo   API Health    : http://localhost:8000/health
echo   API Docs      : http://localhost:8000/docs
echo   To stop server: Press CTRL+C in this window
echo ===============================================================================
echo.

:: 5. Launch Browser
echo [*] Opening browser to http://localhost:8000...
start "" cmd /c "ping -n 3 127.0.0.1 >nul & start http://localhost:8000"

:: 6. Run FastAPI Server
cd /d "%~dp0backend"
echo [*] Starting FastAPI server on port 8000...
"%PYTHON_CMD%" -m uvicorn main:app --host 127.0.0.1 --port 8000

echo.
echo Server stopped.
pause
