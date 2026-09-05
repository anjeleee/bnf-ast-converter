# BNFgen: Python Compiler Backend
> **Pure Python Lexical Analyzer, LL(1) Predictive Recursive-Descent Parser & FastAPI Service**

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Uvicorn](https://img.shields.io/badge/Uvicorn-0.22%2B-2C5BB4.svg?logo=gunicorn&logoColor=white)](https://www.uvicorn.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)

This directory houses the 100% pure Python compiler engine for **BNFgen**. All tokenization, predictive syntax analysis, Backus–Naur Form (BNF) canonical leftmost derivations, Concrete Syntax Tree (CST) generation, and Abstract Syntax Tree (AST) construction are implemented strictly in Python.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup & Installation](#environment-setup--installation)
- [Running the Backend](#running-the-backend)
- [Architecture & Engine Pipeline](#architecture--engine-pipeline)
- [API Endpoints](#api-endpoints)
- [Course Syllabus AST Specification](#course-syllabus-ast-specification)
- [Strict Syntax Validation Rules](#strict-syntax-validation-rules)
- [File Structure](#file-structure)

---

## Prerequisites

- **Python 3.8+** (Python 3.10, 3.11, or 3.12 recommended).
- **pip** package manager.

Verify your installation:
```bash
python --version
pip --version
```

---

## Environment Setup & Installation

### 1. Create a Python Virtual Environment
It is best practice to run Python dependencies within an isolated virtual environment:

```bash
# Windows
python -m venv venv

# macOS / Linux
python3 -m venv venv
```

### 2. Activate the Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (Command Prompt)**:
  ```cmd
  venv\Scripts\activate.bat
  ```
- **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

The required libraries in `requirements.txt` are:
```text
fastapi>=0.100.0
uvicorn[standard]>=0.22.0
pydantic>=2.0.0
```

---

## Running the Backend

### Development Mode (with Live Reload)
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- **API Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

### Production Mode / Direct Execution
```bash
python main.py
```
*Note: If `frontend/dist` exists, `main.py` will automatically mount and serve the graphical React web application at `http://localhost:8000` alongside the REST API!*

---

## Architecture & Engine Pipeline

```text
                        ┌───────────────────┐
                        │    Source Code    │
                        └─────────┬─────────┘
                                  │
                                  ▼
                        ┌───────────────────┐
                        │ Lexer (lexer.py)  │  Token Stream + Line/Col Tracking
                        └─────────┬─────────┘
                                  │
                                  ▼
                        ┌───────────────────┐
                        │Parser (parser.py) │  LL(1) Recursive-Descent Engine
                        └───┬─────┬─────┬───┘
                            │     │     │
             ┌──────────────┘     │     └───────────────┐
             ▼                    ▼                     ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
    │   BNF Engine    │  │  CST Generator  │  │  AST Synthesizer │
    │ - Decomposition │  │ - Parse Tree    │  │ - Operator Trees │
    │ - Derivation (⇒)│  │ - Grammar Nodes │  │ - No Synth Wraps│
    └─────────────────┘  └─────────────────┘  └──────────────────┘
```

### Module Responsibilities:
1. **[`lexer.py`](lexer.py)**:
   - Handcrafted regular expression tokenizer.
   - Categorizes input into token types: `KEYWORD`, `IDENTIFIER`, `NUMBER`, `STRING`, `OPERATOR`, `DELIMITER`, `EOF`.
   - Tracks 1-indexed `line` and `column` numbers for pinpoint error diagnostics.
2. **[`parser.py`](parser.py)**:
   - Implements predictive LL(1) recursive-descent parsing with 1-token lookahead ($k=1$).
   - Contains recursive descent procedures for all 8 language constructs.
   - Computes canonical leftmost derivations ($S \implies^* w$) step-by-step.
   - Generates the Concrete Parse Tree (CST) including all non-terminals and terminals.
   - Generates the Abstract Syntax Tree (AST) eliminating punctuation and synthetic wrapper nodes.
3. **[`main.py`](main.py)**:
   - FastAPI application providing `/parse` and `/health` endpoints.
   - Manages Cross-Origin Resource Sharing (CORS) for development.
   - Mounts static files from `../frontend/dist/` for single-port deployment.

---

## API Endpoints

### `GET /health`
Verifies that the Python backend compiler engine is operational.

**Example Request:**
```bash
curl http://127.0.0.1:8000/health
```

**Response (`200 OK`):**
```json
{
  "status": "healthy",
  "engine": "Python 3 FastAPI Compiler Engine",
  "version": "1.0.0"
}
```

---

### `POST /parse`
Analyzes, validates, and synthesizes trees for source code.

**Example Request:**
```bash
curl -X POST http://127.0.0.1:8000/parse \
  -H "Content-Type: application/json" \
  -d '{"code": "if (x == 5) y = x + 1;"}'
```

**Response Payload (`200 OK`):**
```json
{
  "valid": true,
  "code": "if (x == 5) y = x + 1;",
  "parse_tree": {
    "label": "<program>",
    "children": [
      {
        "label": "<if_statement>",
        "children": [...]
      }
    ]
  },
  "ast": {
    "label": "IF",
    "children": [
      {
        "label": "CONDITION (==)",
        "children": [{ "label": "x" }, { "label": "5" }]
      },
      {
        "label": "ASSIGN (=)",
        "children": [
          { "label": "y" },
          {
            "label": "ADD (+)",
            "children": [{ "label": "x" }, { "label": "1" }]
          }
        ]
      }
    ]
  },
  "bnf_clean": "<if_statement> ::= 'if' '(' <condition> ')' <statement>",
  "bnf_derivation": "<program> => <statement_list> => ...",
  "bnf_relevant": "<if_statement> ::= 'if' '(' <condition> ')' <statement>\n<condition> ::= <expression> '==' <expression>",
  "metrics": {
    "cstNodes": 12,
    "astNodes": 7,
    "reduction": 41.7
  }
}
```

---

## Course Syllabus AST Specification

The Abstract Syntax Tree generated by `parser.py` adheres strictly to standard academic syllabus guidelines:
- **No synthetic intermediate nodes**: The body statement of an `if` attaches directly beneath `IF` (no artificial `THEN` wrapper node).
- **Concise root nodes**: Root nodes use concise labels (`IF`, `WHILE`).
- **Standardized operator notation**: Operators and conditions use explicit round parenthesis format: `CONDITION (==)`, `ASSIGN (=)`, `ADD (+)`, `SUB (-)`, `MUL (*)`, `DIV (/)`.

---

## Strict Syntax Validation Rules

To prevent false positives on invalid inputs:
- **Bare Identifiers**: Standalone words without operators or declarations (e.g., `hello; world;`, `oadksa;`) raise a `ParseError`:
  `Syntax error: Bare identifier '<name>' is not a valid statement or expression.`
- **Complete Statements**: Statements must follow full grammatical definitions:
  - Declarations: `<type> <id> = <expr>;` (e.g., `string s = "hello";`)
  - Stream I/O: `cout << <expr>;` (e.g., `cout << "Hello, World!";`)
  - Assignments: `<id> = <expr>;` (e.g., `x = 10;`)

---

## File Structure

```text
backend/
├── lexer.py          # Regex tokenization & line/column tracking
├── parser.py         # LL(1) recursive-descent parser & AST synthesis
├── main.py           # FastAPI service & static file server
├── requirements.txt  # Python package dependencies
└── README.md         # This documentation file
```