# BNFgen: Deployment & Production Hosting Guide
> **Guidelines for Local Deployment, Virtual Environments, and Cloud Hosting**

---

## Table of Contents
- [1. Overview](#1-overview)
- [2. Local Windows Deployment (Recommended)](#2-local-windows-deployment-recommended)
- [3. Manual Command Line Deployment](#3-manual-command-line-deployment)
- [4. Production Cloud Deployment (Render / Railway / Linux VPS)](#4-production-cloud-deployment-render--railway--linux-vps)
  - [Render Deployment](#render-deployment)
  - [Linux Systemd Service Setup](#linux-systemd-service-setup)
- [5. Environment Variables & Port Configuration](#5-environment-variables--port-configuration)
- [6. Health Checks & Verification](#6-health-checks--verification)

---

## 1. Overview

BNFgen is architected as a self-contained, unified single-port application. The Python FastAPI backend serves both:
1. The REST API endpoints (`/health`, `/parse`, `/docs`).
2. The lightweight web interface (`frontend/index.html`, `frontend/css/style.css`, `frontend/js/*.js`).

Because the frontend requires zero Node.js, zero npm modules, and zero build toolchain steps, deployment requires only a standard Python runtime environment (Python 3.8 or newer).

---

## 2. Local Windows Deployment (Recommended)

For classroom demonstrations, project submissions, and oral defense on Windows:

1. Extract or clone the repository to your local folder.
2. Double-click `run_app.bat` in the root directory.
3. The script automatically:
   - Detects Python in your Windows PATH.
   - Validates that `fastapi`, `uvicorn`, and `pydantic` are installed.
   - Clears port 8000 if occupied by a zombie process.
   - Launches your default web browser to `http://localhost:8000`.
   - Starts the Uvicorn web server.

---

## 3. Manual Command Line Deployment

To run manually on any operating system (Windows, macOS, Linux):

### Step 1: Create and Activate Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate on Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Activate on Windows (CMD)
venv\Scripts\activate.bat

# Activate on macOS / Linux
source venv/bin/activate
```

### Step 2: Install Required Dependencies
```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Step 3: Run the Application
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Access the application in your browser at `http://localhost:8000`.

---

## 4. Production Cloud Deployment (Render / Railway / Linux VPS)

### Render Deployment

1. Create a new **Web Service** on [render.com](https://render.com).
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Environment**: Python
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy the service. Render will provide a live public HTTPS URL.

---

### Linux Systemd Service Setup

To run BNFgen as a persistent background service on an Ubuntu/Debian Linux VPS:

Create the systemd service unit file at `/etc/systemd/system/bnfgen.service`:

```ini
[Unit]
Description=BNFgen Compiler Syntax Visualizer Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/BNF/backend
ExecStart=/var/www/BNF/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable bnfgen
sudo systemctl start bnfgen
```

---

## 5. Environment Variables & Port Configuration

The default port is `8000`. To customize the hosting port, pass the `--port` argument when launching Uvicorn:

```bash
uvicorn main:app --host 0.0.0.0 --port 5000
```

The frontend client dynamically uses relative URLs when served on port 8000, and falls back to `http://127.0.0.1:8000` when opened from an alternate host.

---

## 6. Health Checks & Verification

To verify that your deployment is running properly:

```bash
curl http://localhost:8000/health
```

Expected JSON response:
```json
{
  "status": "healthy",
  "engine": "Python 3 FastAPI Compiler Engine",
  "version": "1.0.0"
}
```

Interactive OpenAPI Swagger documentation is available at `http://localhost:8000/docs`.

