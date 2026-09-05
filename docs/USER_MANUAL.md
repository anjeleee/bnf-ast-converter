# BNFgen: User Manual
## Compiler Syntax Analyzer, BNF Generator & Tree Synthesizer
**Student & Instructor User Guide**

---

## 1. Introduction

Welcome to **BNFgen**, an interactive compiler educational software designed for exploring formal languages, Context-Free Grammars (CFGs), predictive parsing, and syntax analysis.

With BNFgen, you can enter any supported programming statement or compound block and automatically generate:
- **Backus–Naur Form (BNF)** representations (both input syntax decomposition and step-by-step canonical leftmost derivations $S \implies^* w$).
- **Concrete Syntax Trees (CST / Parse Trees)** showing every grammar derivation branch, token, and punctuation leaf.
- **Abstract Syntax Trees (AST)** formatted in strict adherence to course syllabus guidelines (no artificial wrapper nodes, standard operator notation).
- **Compiler Metrics** comparing concrete vs. abstract tree nodes and calculating redundancy reduction percentages.

---

## 2. System Requirements & Prerequisites

| Tool | Minimum Version | Recommended | Required For |
| :--- | :--- | :--- | :--- |
| **Python** | 3.8+ | 3.10 / 3.11 / 3.12 | Backend Compiler Engine & API |
| **Node.js** | 18.0+ | 20.x or 22.x LTS | React 19 Frontend Development & Vite |
| **npm** | 9.0+ | 10.x+ | Frontend Package Management |
| **Web Browser** | Any Modern | Google Chrome, Edge, Firefox, Safari | Web Interface Visualizer |

> [!IMPORTANT]
> **Windows Python PATH**: Ensure that **"Add python.exe to PATH"** was checked during Python installation.

---

## 3. Installation & Environment Setup

### 3.1 Backend Environment Setup (Python)

1. Open your terminal in the project directory:
   ```bash
   cd ccpglang-bnfgen
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (CMD)**:
     ```cmd
     python -m venv venv
     venv\Scripts\activate.bat
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

### 3.2 Frontend Environment Setup (React & Vite)

1. Navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   # Windows
   copy .env.example .env

   # macOS / Linux
   cp .env.example .env
   ```
4. Build the production bundle:
   ```bash
   npm run build
   ```
5. Return to the root folder:
   ```bash
   cd ..
   ```

---

## 4. How to Launch the Application

### Option A: 1-Click Launcher (Windows — Recommended)
Double-click [`run_app.bat`](../run_app.bat) in the project root folder.
- Automatically checks and sets up Python and frontend assets.
- Starts the unified server on `http://localhost:8000`.
- Automatically opens your default browser.

### Option B: Developer Mode (Live Hot-Reload)
Open two terminal windows:
- **Terminal 1 (Backend)**:
  ```bash
  cd backend
  python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm run dev
  ```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. User Interface Tour

The BNFgen interface is structured into five cohesive sections with a sticky topbar navigation:

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ [✦ BNFgen Brand]     [01 Input Console] [02 Grammar] [03 BNF] [04 CST] [05 AST]   │
└───────────────────────────────────────────────────────────────────────────────────┘
│                                                                                   │
│ ┌────────────────────────────────────────┐ ┌────────────────────────────────────┐ │
│ │ [01] Source Code Input Console         │ │ [02] Supported Grammar (LL(1) CFG) │ │
│ │  • Presets Strip (◀ [Cond] [Loop] ▶)   │ │  • [▼ Supported Constructs (8)]    │ │
│ │  • Code Editor (Line-numbered)         │ │    8 Expandable construct cards    │ │
│ │  • Validate Syntax Button              │ │  • [▶ Complete Formal Grammar]     │ │
│ │  • "Generate BNF, CST & AST →" Button  │ │    Raw BNF production rules viewer │ │
│ └────────────────────────────────────────┘ └────────────────────────────────────┘ │
│                                                                                   │
│ ┌───────────────────────────────────────────────────────────────────────────────┐ │
│ │ [03] Backus–Naur Form (BNF) Output                                            │ │
│ │  • Representation | Derivation (Leftmost) | Applied Rules Tabs • [Copy BNF]   │ │
│ └───────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
│ ┌───────────────────────────────────────────────────────────────────────────────┐ │
│ │ [04] Concrete Parse Tree (CST) [𖣂]                                           │ │
│ │  • Metrics: Total Nodes, Depth Levels, Terminal Count                         │ │
│ │  • Collapsible Interactive Tree with non-terminal & terminal tags             │ │
│ └───────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
│ ┌───────────────────────────────────────────────────────────────────────────────┐ │
│ │ [05] Abstract Syntax Tree (AST)                                               │ │
│ │  • Metrics: Clean AST Nodes, Redundancy Reduction % (-41.7%)                  │ │
│ │  • Syllabus-aligned simplified operator tree                                  │ │
│ └───────────────────────────────────────────────────────────────────────────────┘ │
```

---

## 6. Understanding Compiler Terms in the UI

Use this guide to explain the labels in the visualizer:

1. **"Concrete Terminals Included"**:
   - The CST retains every literal character and keyword from source code (e.g. `if`, `(`, `)`, `;`, `=`).
2. **"Optimized for IR CodeGen"** *(Intermediate Representation Code Generation)*:
   - The AST is directly traversable by compiler backends to generate Three-Address Code (TAC), Bytecode, or Assembly without getting bogged down by grammar syntax.
3. **"Pruned Punctuation & Delimiters"**:
   - Punctuation symbols (`;`, `(`, `)`) are pruned (removed) in the AST because tree hierarchy naturally defines operation precedence.
4. **"Syntax Derivation Chips"**:
   - The rounded capsule badges used in the CST visualizer representing production rules and derived tokens.
5. **"Pruned Syntax Operator Graph"**:
   - The AST graph where internal nodes are operators (`ASSIGN (=)`, `ADD (+)`, `IF`) and leaves are operands (`x`, `2`).

---

## 7. Step-by-Step Code Validation & Synthesis Workflow

1. **Select a Preset or Type Code**:
   - Click any chip in the **Quick Presets** strip (e.g., `if (x == 5) y = x + 1;`) or type your statement in the editor.
   - *Tip*: For a "Hello World" example, enter `cout << "Hello, World!";` or `string greeting = "Hello, World!";`.
2. **Validate Syntax**:
   - Click the **"Validate Syntax"** button.
   - The backend checks whether the statement matches the LL(1) grammar.
   - If valid, a green **"VALID: Grammar Validation Passed"** banner appears, unlocking the generate button.
   - If invalid, an error alert displays the exact syntax mistake.
     - *Example*: Typing bare identifiers like `hello; world;` or `x;` returns `Syntax error: Bare identifier 'hello' is not a valid statement or expression.`.
3. **Generate BNF, CST & AST**:
   - Click the **"Generate BNF, CST & AST →"** button.
   - The page smoothly scrolls down to display the synthesized trees and BNF derivations.
4. **Interact with Trees**:
   - Click any tree node with `[-]` to collapse subtrees and simplify viewing.
   - Click `[+]` to re-expand.

---

## 8. Troubleshooting Common Issues

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **`python` not recognized** | Python not in Windows PATH | Re-install Python and check **"Add python.exe to PATH"**. |
| **Blank page at `localhost:8000`** | `frontend/dist` has not been built | Run `cd frontend && npm install && npm run build`. |
| **FastAPI server won't start** | Port 8000 in use | Close running instance of Python / Uvicorn or terminate process on port 8000. |
| **Typing does not validate** | Typing resets validation | Click **"Validate Syntax"** whenever you change code to ensure correctness. |
| **"Bare identifier" syntax error** | Standalone word without type/assignment | Use `string s = "...";`, `cout << "...";`, or assign a value `s = "...";`. |

---
