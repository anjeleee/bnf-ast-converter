# BNFgen: Compiler Syntax Analyzer & Tree Synthesizer
> **Formal Languages, Automata & Compiler Design — Course Final Project**

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

**BNFgen** is an educational, full-stack compiler suite designed to demonstrate the theoretical and practical phases of syntax analysis in modern compilers. Given high-level source code statements or blocks, BNFgen validates grammar, constructs formal **Backus–Naur Form (BNF)** derivations, generates detailed **Concrete Parse Trees (CST)**, and synthesizes streamlined **Abstract Syntax Trees (AST)** tailored to academic syllabus specifications.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Environment Setup](#installation--environment-setup)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup (Python Virtual Environment)](#2-backend-setup-python-virtual-environment)
  - [3. Frontend Setup (React & Vite)](#3-frontend-setup-react--vite)
- [Running the Application](#running-the-application)
  - [Method 1: 1-Click Launcher (Windows Recommended)](#method-1-1-click-launcher-windows-recommended)
  - [Method 2: Developer Mode (Live Hot-Reload)](#method-2-developer-mode-live-hot-reload)
  - [Method 3: Production Unified Mode](#method-3-production-unified-mode)
- [REST API Endpoints](#rest-api-endpoints)
- [Supported Language Constructs](#supported-language-constructs)
- [Project Structure](#project-structure)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Documentation Index](#documentation-index)
- [Authors & License](#authors--license)

---

## Project Overview

Compilers bridge human-readable programming languages and machine-executable instructions. Syntax analysis is the compiler phase responsible for verifying that a stream of tokens conforms to a formal Context-Free Grammar (CFG).

BNFgen provides an interactive, visual environment for students and instructors to inspect:
1. **Lexical Analysis**: Instant tokenization with line/column coordinates.
2. **Deterministic LL(1) Predictive Parsing**: 1-token lookahead without backtracking.
3. **BNF Decompositions**: Both canonical input syntax representations and leftmost derivations ($S \implies^* w$).
4. **Dual Tree Synthesis**:
   - **Concrete Parse Tree (CST)**: Complete grammatical hierarchy showing every non-terminal and leaf token.
   - **Abstract Syntax Tree (AST)**: Semantic tree that eliminates delimiters (semicolons, parentheses) and hoists operators into parent nodes for code generation.
5. **Compiler Tree Metrics**: Concrete parse tree node counts, derivation depth, and clean AST operator/operand node counts.

---

## Key Features

- **100% Pure Python Compiler Backend**: Lexical analyzer (`backend/lexer.py`) and recursive-descent parser (`backend/parser.py`) written entirely in Python.
- **Modern Modular React 19 Frontend**: Component-based UI with interactive collapsible trees, single-row preset chips with navigation arrows (`◀` / `▶`), and sticky topbar navigation.
- **Real-Time Syntax Validation**: Instant feedback informing you whether a statement conforms to grammar rules before synthesizing trees.
- **Collapsible Hierarchical Tree Visualizer**: Visual representation with custom terminal/non-terminal badges (`𖣂`), branch connectors, and one-click ASCII export.
- **Custom Neo-Brutalist Aesthetic**: High-contrast borders, pastel accent palettes, and responsive dual-panel layout.
- **Unified Single-Port Hosting**: FastAPI can serve the built React bundle and API endpoints simultaneously from `http://localhost:8000`.

---

## System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               User Input (Source Code)                │
└──────────────────────────┬─────────────────────────────┘
                           │ POST /parse
                           ▼
┌────────────────────────────────────────────────────────┐
│           Python Backend Engine (FastAPI)              │
│                                                        │
│  1. Handcrafted Regex Lexer (backend/lexer.py)         │
│     └── Token Stream: [TYPE, ID, ASSIGN, NUM, SEMI]   │
│                                                        │
│  2. LL(1) Predictive Parser (backend/parser.py)        │
│     ├── Grammatical Verification & Error Tracking      │
│     ├── BNF Canonical Leftmost Derivations             │
│     ├── Concrete Syntax Tree (CST) Builder             │
│     └── Abstract Syntax Tree (AST) Synthesizer         │
└──────────────────────────┬─────────────────────────────┘
                           │ JSON Response (Trees + BNF)
                           ▼
┌────────────────────────────────────────────────────────┐
│            React 19 Frontend (Vite Client)             │
│                                                        │
│  • Header.jsx          - Brand mark & section pills    │
│  • InputConsole.jsx    - Presets strip & code editor   │
│  • BnfCard.jsx         - Segmented BNF derivations     │
│  • CstCard.jsx         - CST derivation visualizer     │
│  • AstCard.jsx         - Syllabus-aligned AST graph    │
│  • TreeView.jsx        - Collapsible interactive nodes │
│  • Footer.jsx          - System status & engine stats  │
└────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before running the project, make sure the following runtimes are installed on your machine:

| Requirement | Minimum Version | Recommended Version | Purpose | Download Link |
| :--- | :--- | :--- | :--- | :--- |
| **Python** | 3.8+ | 3.10 / 3.11 / 3.12 | Core Compiler Backend & API | [python.org/downloads](https://www.python.org/downloads/) |
| **Node.js** | 18.0+ | 20.x or 22.x LTS | React 19 Frontend & Vite Bundler | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0+ | 10.x+ | Package Manager for Frontend | Included with Node.js |
| **Git** | Any | Latest | Source Control | [git-scm.com](https://git-scm.com/) |

> [!IMPORTANT]
> **Windows Users**: When installing Python from python.org, **MUST** check the box:
> **"Add python.exe to PATH"** on the very first installer screen.

---

## Installation & Environment Setup

### 1. Clone Repository

Open your terminal (PowerShell, Command Prompt, or Bash) and clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/ccpglang-bnfgen.git
cd ccpglang-bnfgen
```

---

### 2. Backend Setup (Python Virtual Environment)

It is recommended to isolate Python dependencies in a virtual environment (`venv`).

#### A. Create the Virtual Environment:
```bash
# Windows (PowerShell or Command Prompt)
python -m venv venv

# macOS / Linux
python3 -m venv venv
```

#### B. Activate the Virtual Environment:
- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(If you get a script execution policy error, run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`)*

- **Windows (Command Prompt)**:
  ```cmd
  venv\Scripts\activate.bat
  ```

- **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```

#### C. Install Backend Dependencies:
```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

Verify the installation:
```bash
python -c "import fastapi, uvicorn; print('Backend dependencies installed successfully!')"
```

---

### 3. Frontend Setup (React & Vite)

Navigate to the `frontend/` directory to install dependencies and configure environment variables:

```bash
cd frontend
```

#### A. Install Node Modules:
```bash
npm install
```

#### B. Environment Configuration:
Create your local environment file from the example:
```bash
# Windows PowerShell / CMD
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

The default `.env` contains:
```env
# URL where your Python FastAPI backend is listening
VITE_API_URL=http://127.0.0.1:8000
```

#### C. Build Production Bundle:
Generate the optimized static build for single-port hosting:
```bash
npm run build
```
*(This produces the production build in `frontend/dist/` in ~100ms).*

Return to the project root:
```bash
cd ..
```

---

## Running the Application

### Method 1: 1-Click Launcher (Windows Recommended)

Simply double-click [`run_app.bat`](file:///c:/Users/Anjelee%20Tejada/Documents/CCPGLANG/run_app.bat) in the project root folder.

The launcher script will automatically:
1. Detect and display your Python version.
2. Install any missing Python dependencies (`fastapi`, `uvicorn`).
3. Check if `frontend/dist/` exists; if missing, it automatically installs npm dependencies and builds the bundle.
4. Launch your default browser to `http://localhost:8000`.
5. Run the unified FastAPI server.

---

### Method 2: Developer Mode (Live Hot-Reload)

For developers actively editing React components and Python parser files:

#### Terminal 1 — Backend (FastAPI API on Port 8000):
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### Terminal 2 — Frontend (Vite Dev Server on Port 5173):
```bash
cd frontend
npm run dev
```

Open your browser at:
**[http://localhost:5173](http://localhost:5173)**

*Any changes you make in React or CSS will instantly reflect in the browser via Vite Hot Module Replacement (HMR)!*

---

### Method 3: Production Unified Mode

Run the pre-built application served entirely from Python:

```bash
cd backend
python main.py
```
Open **[http://localhost:8000](http://localhost:8000)**. The Python backend will serve both the graphical web interface and process API requests!

---

## REST API Endpoints

The backend provides a RESTful JSON API. Interactive OpenAPI Swagger documentation is available at **`http://localhost:8000/docs`**.

### 1. Health Check
- **Endpoint**: `GET /health`
- **Description**: Verifies backend availability and engine status.
- **Response**:
  ```json
  {
    "status": "healthy",
    "engine": "Python 3 FastAPI Compiler Engine",
    "version": "1.0.0"
  }
  ```

### 2. Parse & Synthesize Trees
- **Endpoint**: `POST /parse`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "code": "if (x == 5) y = x + 1;"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "valid": true,
    "code": "if (x == 5) y = x + 1;",
    "parse_tree": {
      "type": "if_statement",
      "value": "if",
      "children": [...]
    },
    "ast": {
      "type": "IF",
      "value": "IF",
      "children": [...]
    },
    "bnf_clean": "<if_statement> ::= 'if' '(' <condition> ')' <statement>",
    "bnf_derivation": "<program> => <statement_list> => ...",
    "bnf_relevant": "...",
    "metrics": {
      "cstNodes": 14,
      "cstDepth": 6,
      "cstTerminals": 7,
      "astNodes": 6,
      "astDepth": 3
    }
  }
  ```

---

## Supported Language Constructs

BNFgen recognizes and generates trees for **8 core programming constructs**:

| # | Language Construct | Example Source Code |
| :-: | :--- | :--- |
| **01** | **Variable Declarations** | `int x = 10;`, `float pi = 3.14;`, `string msg = "hello";` |
| **02** | **Variable Assignments** | `total = a * (b + 2);`, `count++;`, `i--;` |
| **03** | **Arithmetic Expressions** | `2 + 7`, `(x + y) / (z - 1)`, `a * b + c` |
| **04** | **Conditional Branching** | `if (x == 5) y = x + 1; else y = 0;` |
| **05** | **Iteration & Loops** | `while (count < 10) count = count + 1;` |
| **06** | **Compound Statement Blocks** | `{ int x = 1; y = x + 2; cout << y; }` |
| **07** | **Stream Output (cout)** | `cout << "Result: " << total;` |
| **08** | **Stream Input (cin)** | `cin >> userInput;` |

### Course Syllabus AST Specification
The AST generated by `backend/parser.py` strictly follows standard university syllabus rules:
- **No synthetic intermediate nodes**: The body statement of an `if` attaches directly beneath `IF` without artificial `THEN` wrapper nodes.
- **Concise root nodes**: Root nodes use concise labels (`IF`, `WHILE`).
- **Parenthetical operator notation**: Operations use explicit round parenthesis notation: `CONDITION (==)`, `ASSIGN (=)`, `ADD (+)`, `SUB (-)`, `MUL (*)`, `DIV (/)`.

### Strict Syntax Validation & Common Rules
To uphold formal compiler principles and prevent false positives during academic grading, the parser enforces strict validation rules:
- **Bare Identifiers Disallowed**: Standalone words with semicolons (such as `hello; world;`, `oadksa;`, or `sdfsdwe`) are strictly rejected. Identifiers must be part of an explicit declaration, assignment, expression with operators, or I/O statement.
  - *Error message*: `Syntax error: Bare identifier '<name>' is not a valid statement or expression.`
- **How to write "Hello World"**:
  - Console Output: `cout << "Hello, World!";`
  - String Declaration: `string greeting = "Hello, World!";`
- **Semicolons Required for Statements**: Declarations, assignments, stream I/O, and increment statements must be terminated with a semicolon `;`. Pure arithmetic expressions (e.g., `(a + b) * c`) can be parsed as standalone expressions or statements.

---

## Project Structure

```text
CCPGLANG/
├── backend/                        # 100% Pure Python Compiler Engine
│   ├── lexer.py                    # Handcrafted regex tokenizer with line/col tracking
│   ├── parser.py                   # LL(1) predictive recursive-descent parser & AST builder
│   ├── main.py                     # FastAPI REST API & static files mount
│   ├── requirements.txt            # Python dependencies (fastapi, uvicorn)
│   └── README.md                   # Dedicated backend documentation
│
├── frontend/                       # React 19 + Vite Interactive Web Visualizer
│   ├── src/
│   │   ├── components/             # Clean, presentation-focused UI sections
│   │   │   ├── Header.jsx          # Brand logo, section navigation pills & engine status
│   │   │   ├── InputConsole.jsx    # Section 01 (Presets & editor) + Section 02 (CFG accordion)
│   │   │   ├── BnfCard.jsx         # Section 03 (BNF representation & derivation traces)
│   │   │   ├── CstCard.jsx         # Section 04 (Concrete Parse Tree visualizer with 𖣂 badge)
│   │   │   ├── AstCard.jsx         # Section 05 (Syllabus-aligned AST visualizer & metrics)
│   │   │   └── Footer.jsx          # Bottom brand, engine status, and copyright footer
│   │   ├── compiler/               # Pure API connector & tree metric utilities
│   │   │   ├── parser.js           # API client (parseCode, validateCode, checkBackendHealth)
│   │   │   ├── grammar.js          # Formal BNF rules (FULL_BNF_RULES), presets (EXAMPLES)
│   │   │   └── treeUtils.js        # Node counts, tree depth, and ASCII tree conversion
│   │   ├── TreeView.jsx            # Standalone collapsible interactive tree visualizer
│   │   ├── App.jsx                 # Streamlined state container (~170 lines)
│   │   ├── index.css               # Neo-brutalist responsive styling (1560px shell, 770px cards)
│   │   └── main.jsx                # React DOM entry point
│   ├── .env.example                # Environment variable configuration template
│   ├── package.json                # Frontend scripts and dependencies
│   ├── vite.config.js              # Vite server & backend proxy configuration
│   └── README.md                   # Dedicated frontend documentation
│
├── docs/                           # Comprehensive Project Documentation
│   ├── TECHNICAL_DOCUMENTATION.md  # Formal CFG, LL(1) FIRST sets, and complexity analysis
│   ├── USER_MANUAL.md              # User manual, UI guide, examples & diagnostics
│   └── DEPLOYMENT_GUIDE.md         # Guide for online deployment to Render or Vercel
│
├── .gitignore                      # Git ignore file (node_modules, __pycache__, dist, .env)
├── run_app.bat                     # 1-Click Windows launcher script
└── README.md                       # Main repository overview (this file)
```

---

## Troubleshooting & FAQ

### 1. `run_app.bat` says Python was not found
- **Cause**: Python is either not installed or was not added to your Windows PATH environment variable.
- **Fix**: Re-download Python from [python.org](https://www.python.org/) and ensure you check **"Add python.exe to PATH"** during installation. Restart your terminal after installing.

### 2. PowerShell execution policy error (`running scripts is disabled on this system`)
- **Cause**: Windows security policy prevents unsigned PowerShell scripts by default.
- **Fix**: Open PowerShell as Administrator or regular user and run:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```

### 3. Port 8000 is already in use
- **Cause**: A previous instance of `uvicorn` or another web server is occupying port 8000.
- **Fix**: Find and close the process, or run in PowerShell:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
  ```

### 4. Browser shows 404 or blank page at `http://localhost:8000`
- **Cause**: The frontend production build has not been generated into `frontend/dist/`.
- **Fix**: Navigate to `frontend` and build the assets:
  ```bash
  cd frontend
  npm install
  npm run build
  cd ..
  ```
  Then relaunch `run_app.bat` or `python backend/main.py`.

---

## Documentation Index

For detailed deep-dives, please consult the dedicated documentation files:
- **[User Manual](docs/USER_MANUAL.md)**: Complete student and instructor guide, screenshots, and construct testing.
- **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)**: Formal Context-Free Grammar $G=(V,\Sigma,R,S)$, FIRST sets, and parser mechanics.
- **[Backend README](backend/README.md)**: Details on lexer tokens, LL(1) recursive-descent routines, and FastAPI routes.
- **[Frontend README](frontend/README.md)**: Details on React 19 architecture, Vite build scripts, and CSS design tokens.

---

## Authors & Course Context

- **Course**: Formal Languages, Automata & Compiler Design
- **Institution**: College / University Academic Final Project
- **License**: MIT Open Source

---
*Built with passion for compiler education and modern web engineering.*
