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

:: 4. Verify Frontend Assets
if not exist "%~dp0frontend\dist\index.html" (
    echo [*] Frontend production bundle not found in frontend\dist.
    echo [*] Checking for Node.js and npm...
    where npm >nul 2>nul
    if !errorlevel! equ 0 (
        echo [*] Building frontend production bundle...
        cd /d "%~dp0frontend"
        if not exist "node_modules\" (
            echo [*] Installing npm dependencies...
            call npm install
        )
        call npm run build
        cd /d "%~dp0"
    ) else (
        echo [WARNING] Node.js is not installed.
        echo Please install Node.js from https://nodejs.org/
    )
)

if exist "%~dp0frontend\dist\index.html" (
    echo [*] Frontend production bundle verified.
) else (
    echo [WARNING] Frontend dist not found. Web interface may show 404.
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
