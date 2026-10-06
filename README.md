# BNFgen: Compiler Syntax Analyzer & Tree Synthesizer
> **Formal Languages, Automata & Compiler Design — Course Final Project**

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26.svg?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6.svg?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E.svg?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

**BNFgen** is an educational, full-stack compiler suite designed to demonstrate the theoretical and practical phases of syntax analysis in modern compilers. Given high-level source code statements or blocks, BNFgen validates grammar, constructs formal **Backus–Naur Form (BNF)** derivations, generates detailed **Concrete Parse Trees (CST)**, and synthesizes streamlined **Abstract Syntax Trees (AST)** tailored to academic syllabus specifications.

Every source code file across the backend and frontend is documented with **line-by-line English comments** designed for effortless oral defense and code walkthroughs.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Environment Setup](#installation--environment-setup)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup (Python Virtual Environment)](#2-backend-setup-python-virtual-environment)
  - [3. Frontend Architecture (Pure HTML5/CSS3/Vanilla JS)](#3-frontend-architecture-pure-html5css3vanilla-js)
- [Running the Application](#running-the-application)
  - [Method 1: 1-Click Launcher (Windows Recommended)](#method-1-1-click-launcher-windows-recommended)
  - [Method 2: Direct Command Line Mode](#method-2-direct-command-line-mode)
- [Source Code File Structure & Documentation](#source-code-file-structure--documentation)
- [Supported Language Constructs](#supported-language-constructs)
- [Course Syllabus AST Specification](#course-syllabus-ast-specification)
- [Tree Output & ASCII Hierarchy Example](#tree-output--ascii-hierarchy-example)
- [REST API Endpoints](#rest-api-endpoints)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Documentation Index](#documentation-index)
- [Authors & License](#authors--license)

---

## Project Overview

Compilers bridge human-readable programming languages and machine-executable instructions. Syntax analysis is the compiler phase responsible for verifying that a stream of tokens conforms to a formal Context-Free Grammar (CFG).

BNFgen provides an interactive, visual environment for students and instructors to inspect:
1. **Lexical Analysis**: Instant tokenization with line/column coordinates and classification into keywords, identifiers, numbers, strings, operators, and delimiters.
2. **Deterministic LL(1) Predictive Parsing**: 1-token lookahead without backtracking, verifying deterministic grammar conformance.
3. **BNF Decompositions**: Canonical statement BNF representations, applied production rule tracking, and step-by-step leftmost derivations ($S \implies^* w$).
4. **Dual Tree Synthesis**:
   - **Concrete Parse Tree (CST)**: Complete grammatical hierarchy showing every non-terminal and leaf token with interactive collapsing.
   - **Abstract Syntax Tree (AST)**: Semantic tree that eliminates syntactic delimiters (semicolons, parentheses) and hoists operators into parent nodes for code generation.
5. **Optimization Metrics**: Node counts, derivation depth, terminal leaf counts, and tree redundancy reduction percentages.

---

## Key Features

- **100% Pure Python Compiler Backend**: Handcrafted lexical analyzer (`backend/lexer.py`) and recursive-descent LL(1) parser (`backend/parser.py`) written entirely in standard Python.
- **Zero NPM / Node.js Dependencies**: The frontend web interface is built with pure semantic HTML5, modern CSS3 design tokens, and modular Vanilla JavaScript. It requires zero build tools (`node_modules`, npm, Vite) and runs straight from Python.
- **Line-by-Line English Comments**: Every function, data structure, recursion loop, and state handler is fully annotated line-by-line with plain, simple English explanations for academic defense.
- **Real-Time Syntax Validation**: Instant feedback informing you whether a statement conforms to C++ grammar rules before synthesizing trees.
- **Dual Visual Formats (Chips & ASCII)**: Switch between interactive visual chip hierarchies and formatted ASCII tree hierarchies with box-drawing branch connectors (`└─`, `├─`, `│`).
- **One-Click Clipboard Export**: Copy raw BNF derivations, applied rule sets, and ASCII trees directly to the clipboard with confirmation feedback.
- **Unified Single-Port Hosting**: FastAPI serves both the compiler REST API and the client web application directly on `http://localhost:8000`.

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
│     ├── BNF Canonical Leftmost Derivations (S =>* w)   │
│     ├── Concrete Syntax Tree (CST) Builder             │
│     └── Abstract Syntax Tree (AST) Synthesizer         │
└──────────────────────────┬─────────────────────────────┘
                           │ JSON Response (Trees + BNF)
                           ▼
┌────────────────────────────────────────────────────────┐
│         Lightweight Web Interface (frontend/)          │
│                                                        │
│  • index.html          - Semantic layout (Cards 01-05) │
│  • css/style.css       - Neo-brutalist theme & tokens  │
│  • js/app.js           - Main coordinator & UI events  │
│  • js/treeUtils.js     - Tree metrics & ASCII branches │
│  • js/grammar.js       - Formal BNF rules & presets    │
│  • js/api.js           - Asynchronous fetch client     │
│  • Single-Port Hosting - Served directly by FastAPI    │
└────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before running the project, make sure the following runtimes are installed on your machine:

| Requirement | Minimum Version | Recommended Version | Purpose | Download Link |
| :--- | :--- | :--- | :--- | :--- |
| **Python** | 3.8+ | 3.10 / 3.11 / 3.12 | Core Compiler Backend & Web Server | [python.org/downloads](https://www.python.org/downloads/) |
| **Web Browser** | Any | Modern Browser | Web Visualizer GUI | Chrome, Edge, Firefox, Safari |
| **Git** | Any | Latest | Source Control | [git-scm.com](https://git-scm.com/) |

> [!IMPORTANT]
> **Windows Users**: When installing Python from python.org, **MUST** check the box:
> [x] **"Add python.exe to PATH"** on the very first installer screen.

---

## Installation & Environment Setup

### 1. Clone Repository

Open your terminal (PowerShell, Command Prompt, or Bash) and clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/BNF.git
cd BNF
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

### 3. Frontend Architecture (Pure HTML5/CSS3/Vanilla JS)

The visualizer web interface is built strictly using **pure HTML5, CSS3, and modern Vanilla JavaScript**:
- **Zero Node.js / npm installation required**: There are no `npm install`, `node_modules`, or complex bundler tools.
- **Direct Static Serving**: The Python backend (`backend/main.py`) serves the `frontend/` directory automatically on the root path `http://localhost:8000/`.
- **Modular Code Organization**: Cleanly divided into `frontend/index.html`, `frontend/css/style.css`, and modular scripts in `frontend/js/`.
- **Fully Commented**: Every single source line contains plain English comments explaining the logic.

---

## Running the Application

### Method 1: 1-Click Launcher (Windows Recommended)

Simply double-click `run_app.bat` in the project root folder.

The launcher script will automatically:
1. Detect your Python runtime environment.
2. Verify Python dependencies (`fastapi`, `uvicorn`, `pydantic`).
3. Free port 8000 if occupied by another process.
4. Launch your default browser directly to `http://localhost:8000`.
5. Start the FastAPI server serving both the web visualizer and compiler API.

---

### Method 2: Direct Command Line Mode

To run from any terminal (PowerShell, Command Prompt, or Linux/macOS):

```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Open your browser at **[http://localhost:8000](http://localhost:8000)**.

---

## Source Code File Structure & Documentation

```text
BNF/
├── backend/                        # 100% Pure Python Compiler Engine
│   ├── lexer.py                    # Scanner with line/col tracking & token types
│   ├── parser.py                   # LL(1) predictive recursive-descent parser & AST builder
│   ├── main.py                     # FastAPI REST API & static files mount
│   ├── requirements.txt            # Python dependencies (fastapi, uvicorn, pydantic)
│   └── README.md                   # Dedicated backend documentation
│
├── frontend/                       # Lightweight Web Visualizer (Zero NPM)
│   ├── index.html                  # Semantic UI layout (Cards 01 to 05, topbar, footer)
│   ├── css/
│   │   └── style.css               # Neo-brutalist responsive styling & dark editor
│   ├── js/
│   │   ├── app.js                  # Main UI coordinator & DOM event manager
│   │   ├── grammar.js              # Formal C++ BNF production rules & presets
│   │   ├── treeUtils.js            # Tree metrics (depth, nodes, leaves, ASCII branches)
│   │   └── api.js                  # Asynchronous fetch client for FastAPI
│   └── README.md                   # Dedicated frontend documentation
│
├── docs/                           # Comprehensive Project Documentation
│   ├── TECHNICAL_DOCUMENTATION.md  # Formal CFG, LL(1) FIRST sets, and complexity analysis
│   ├── USER_MANUAL.md              # User manual, UI guide, examples & diagnostics
│   └── DEPLOYMENT_GUIDE.md         # Deployment guide for local and cloud hosting
│
├── run_app.bat                     # 1-Click Windows launcher script
└── README.md                       # Main repository overview (this file)
```

### Line-by-Line Commenting Summary

| File | Language | Purpose & Comment Highlights |
| :--- | :--- | :--- |
| [`backend/main.py`](backend/main.py) | Python | FastAPI app, CORS middleware, request models, `/health` and `/parse` endpoints, and static mount. |
| [`backend/lexer.py`](backend/lexer.py) | Python | Token classification, line/column coordinate tracking, character consumption (`advance`, `peek`), and literal parsing. |
| [`backend/parser.py`](backend/parser.py) | Python | Recursive-descent grammar methods, lookahead matching, CST generation, AST operator hoisting, and leftmost derivation steps. |
| [`frontend/js/api.js`](frontend/js/api.js) | JavaScript | Dynamic base URL resolution, backend health pinging, and asynchronous POST requests with error catching. |
| [`frontend/js/treeUtils.js`](frontend/js/treeUtils.js) | JavaScript | Node counting recursion, tree depth calculation, leaf counting, ASCII branch generation (`└─`, `├─`, `│`), and styling chips. |
| [`frontend/js/grammar.js`](frontend/js/grammar.js) | JavaScript | Example presets bank, full 19-rule CFG in BNF, construct cards metadata, and line counter. |
| [`frontend/js/app.js`](frontend/js/app.js) | JavaScript | Reactive application state, button toggling, DOM chip generation, accordion handlers, copy to clipboard, and scroll spy. |

---

## Supported Language Constructs

BNFgen supports the full core subset of **C++ syntax**:

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
| **09** | **Return Statements** | `return 0;`, `return x + 1;`, `return;` |
| **10** | **Functions & Entry Point** | `int main() { cout << 42; return 0; }` |
| **11** | **Preprocessor Directives** | `#include <iostream>`, `using namespace std;` |

---

## Course Syllabus AST Specification

The Abstract Syntax Tree generated by `backend/parser.py` adheres strictly to standard university compiler syllabus specifications:
- **No synthetic wrapper nodes**: Statements inside conditionals attach directly beneath `IF` without artificial intermediate wrapper nodes.
- **Concise root nodes**: Root nodes utilize concise, clean identifiers (`IF`, `WHILE`, `BLOCK`).
- **Parenthetical operator notation**: Operations use explicit round parenthesis notation: `CONDITION (==)`, `ASSIGN (=)`, `ADD (+)`, `SUB (-)`, `MUL (*)`, `DIV (/)`.

---

## Tree Output & ASCII Hierarchy Example

When parsing `if (x == 5) y = x + 1;`, the application synthesizes:

### Abstract Syntax Tree (AST):
```text
└─ IF
   ├─ CONDITION (==)
   │  ├─ x
   │  └─ 5
   └─ ASSIGN (=)
      ├─ y
      └─ ADD (+)
         ├─ x
         └─ 1
```

### Concrete Parse Tree (CST) for I/O (`cout << "Result: " << total;`):
```text
└─ <io_statement>
   ├─ cout
   ├─ <<
   ├─ str("Result: ")
   ├─ <<
   ├─ id(total)
   └─ ;
```

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
    "code": "int x = 10;"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "valid": true,
    "code": "int x = 10;",
    "parse_tree": { ... },
    "ast": { ... },
    "bnf_clean": "<declaration> ::= 'int' <identifier> '=' <expression> ';'",
    "bnf_derivation": "<program> => <statement_list> => ...",
    "bnf_relevant": "...",
    "metrics": {
      "cstNodes": 5,
      "astNodes": 3,
      "cstDepth": 2,
      "astDepth": 2
    }
  }
  ```

---

## Troubleshooting & FAQ

### 1. `run_app.bat` says Python was not found
- **Cause**: Python is either not installed or was not added to your Windows PATH environment variable.
- **Fix**: Re-download Python from [python.org](https://www.python.org/) and ensure you check **"Add python.exe to PATH"** during installation. Restart your terminal after installing.

### 2. PowerShell execution policy error (`running scripts is disabled on this system`)
- **Cause**: Windows security policy prevents unsigned PowerShell scripts by default.
- **Fix**: Open PowerShell and run:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```

### 3. Port 8000 is already in use
- **Cause**: A previous instance of `uvicorn` or another web server is occupying port 8000.
- **Fix**: Run in PowerShell to terminate the process:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
  ```

### 4. Browser shows 404 or blank page at `http://localhost:8000`
- **Cause**: The web assets in `frontend/index.html` were moved or deleted.
- **Fix**: Verify that `frontend/index.html` exists and restart the Python server.

---

## Documentation Index

For detailed deep-dives, please consult the dedicated documentation files:
- **[User Manual](docs/USER_MANUAL.md)**: Complete student and instructor guide, screenshots, and construct testing.
- **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)**: Formal Context-Free Grammar $G=(V,\Sigma,R,S)$, FIRST sets, and parser mechanics.
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Guide for local execution, virtual environments, and production hosting.
- **[Backend README](backend/README.md)**: Details on lexer tokens, LL(1) recursive-descent routines, and FastAPI routes.
- **[Frontend README](frontend/README.md)**: Details on semantic HTML5 layout, CSS design tokens, and modular JavaScript architecture.

---

## Authors & Course Context

- **Course**: Formal Languages, Automata & Compiler Design
- **Institution**: College / University Academic Final Project
- **License**: MIT Open Source

---
*Built with passion for compiler education and modern web engineering.*
