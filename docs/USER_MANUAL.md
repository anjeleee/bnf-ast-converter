# BNFgen: User Manual
> **Comprehensive Guide for Students and Instructors in Compiler Syntax Analysis and Tree Visualization**

---

## Table of Contents
- [1. Introduction and Academic Objectives](#1-introduction-and-academic-objectives)
- [2. System Requirements and Launching](#2-system-requirements-and-launching)
  - [Prerequisites](#prerequisites)
  - [Method 1: 1-Click Launcher (Windows)](#method-1-1-click-launcher-windows)
  - [Method 2: Developer Mode (Live Hot-Reload)](#method-2-developer-mode-live-hot-reload)
  - [Method 3: Production Unified Mode](#method-3-production-unified-mode)
- [3. User Interface Tour](#3-user-interface-tour)
  - [Header and Navigation Bar](#header-and-navigation-bar)
  - [Section 01: Source Code Input Console](#section-01-source-code-input-console)
  - [Section 02: Supported Grammar Features Panel](#section-02-supported-grammar-features-panel)
  - [Section 03: Backus-Naur Form (BNF) Card](#section-03-backus-naur-form-bnf-card)
  - [Section 04: Concrete Parse Tree (CST) Visualizer](#section-04-concrete-parse-tree-cst-visualizer)
  - [Section 05: Abstract Syntax Tree (AST) Visualizer](#section-05-abstract-syntax-tree-ast-visualizer)
  - [Application Footer](#application-footer)
- [4. Step-by-Step Workflow Guide](#4-step-by-step-workflow-guide)
  - [Step 1: Inputting Source Code](#step-1-inputting-source-code)
  - [Step 2: Performing Syntax Validation](#step-2-performing-syntax-validation)
  - [Step 3: Generating Derivations and Trees](#step-3-generating-derivations-and-trees)
  - [Step 4: Inspecting and Exporting Results](#step-4-inspecting-and-exporting-results)
- [5. Supported Language Constructs Reference](#5-supported-language-constructs-reference)
  - [Construct 01: Variable Declarations](#construct-01-variable-declarations)
  - [Construct 02: Variable Assignments](#construct-02-variable-assignments)
  - [Construct 03: Arithmetic Expressions](#construct-03-arithmetic-expressions)
  - [Construct 04: Conditional Branching](#construct-04-conditional-branching)
  - [Construct 05: Iteration and Loops](#construct-05-iteration-and-loops)
  - [Construct 06: Compound Statement Blocks](#construct-06-compound-statement-blocks)
  - [Construct 07: Stream Output (cout)](#construct-07-stream-output-cout)
  - [Construct 08: Stream Input (cin)](#construct-08-stream-input-cin)
- [6. Syntax Validation Rules and Diagnostics](#6-syntax-validation-rules-and-diagnostics)
  - [Strict Compiler Enforcement](#strict-compiler-enforcement)
  - [Bare Identifiers Disallowed](#bare-identifiers-disallowed)
  - [Diagnostic Error Messages](#diagnostic-error-messages)
- [7. Troubleshooting and Frequently Asked Questions](#7-troubleshooting-and-frequently-asked-questions)

---

## 1. Introduction and Academic Objectives

BNFgen is an educational software suite engineered for courses in Formal Languages, Automata Theory, and Compiler Construction. The primary objective of BNFgen is to provide students and educators with an immediate, visual understanding of the syntactic analysis (parsing) phase of a compiler.

By providing real-time feedback on formal grammar conformance, BNFgen bridges abstract mathematical concepts (Context-Free Grammars, leftmost derivations, predictive parse tables) with practical compiler outputs (Concrete Parse Trees and syllabus-compliant Abstract Syntax Trees).

### Core Educational Takeaways:
1. **Context-Free Grammars (CFG)**: Understanding formal production rules and grammar terminals versus non-terminals.
2. **Leftmost Derivations**: Tracing how the root symbol `<program>` expands systematically into input sentence tokens.
3. **Parse Tree vs. Abstract Syntax Tree**: Demonstrating why real compilers prune syntactic delimiters (semicolons, parentheses) and hoist operators to form an optimized representation for intermediate code generation.
4. **Error Diagnostics**: Learning how predictive LL(1) parsers identify syntactic violations using single-token lookahead.

---

## 2. System Requirements and Launching

### Prerequisites
Ensure your workstation meets the following runtime requirements:
- **Python**: Version 3.8 or newer (3.10, 3.11, or 3.12 recommended).
- **Node.js**: Version 18.0 or newer (LTS recommended) with npm.
- **Web Browser**: Modern Chromium-based browser (Chrome, Edge, Brave), Firefox, or Safari.

---

### Method 1: 1-Click Launcher (Windows)
The simplest way to run BNFgen on Windows is via the bundled batch script:
1. Double-click `run_app.bat` located in the root directory.
2. The script will automatically verify Python, install backend requirements, compile the frontend assets if missing, and start the unified server.
3. Your default web browser will automatically open to `http://localhost:8000`.

---

### Method 2: Developer Mode (Live Hot-Reload)
For modifying components or extending grammar definitions:

**Terminal 1 — Backend Service:**
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend Dev Server:**
```bash
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173`. Any changes to React components or CSS tokens will hot-reload instantaneously.

---

### Method 3: Production Unified Mode
To run the pre-compiled application directly from Python:
```bash
cd frontend
npm run build
cd ../backend
python main.py
```
Open `http://localhost:8000`.

---

## 3. User Interface Tour

### Header and Navigation Bar
The sticky top navigation bar includes:
- **Brand Mark**: `BNFgen.` clicking returns to the top.
- **Navigation Pills**: Direct scrolling buttons to jump between sections:
  - `01 Input Console`
  - `02 Grammar Features`
  - `03 BNF Output`
  - `04 Parse Tree (CST)`
  - `05 AST Viewer`
- **Engine Status Indicator**: Displays live connectivity to the Python FastAPI backend engine (Green: `Python FastAPI (Port 8000)`, Amber: `Python Backend Offline`).

---

### Section 01: Source Code Input Console
The input console allows interactive entry and validation of source code:
- **Clear Input Button**: Quickly resets the editor, clears syntax errors, and purges previous parse results.
- **Quick Presets Strip**: A single-row scrollable carousel featuring preset examples representing all supported language constructs. Navigation arrows (`<` and `>`) allow smooth horizontal scrolling.
- **Editor Window**: Neo-brutalist styled code editor with line counts and syntax highlighting support.
- **Validate Syntax Button**: Executes an LL(1) predictive check on the input string.
- **Generate BNF, CST & AST Button**: Parses the input code and generates full derivation data and visualization trees.

---

### Section 02: Supported Grammar Features Panel
Positioned beside the input console, this panel provides reference materials for the language specification:
- **Language Constructs Accordion**: An expandable list of the 8 supported language constructs with descriptions and formal CFG excerpts.
- **Complete Formal Grammar (CFG) View**: Displays the full 18 production rules in standardized Backus-Naur Form with a one-click copy button.

---

### Section 03: Backus-Naur Form (BNF) Card
Displays formal grammatical representations of the parsed input:
- **Segmented Tabs**:
  - `Representation`: Clean, canonical BNF production for the input statement.
  - `Derivation`: Step-by-step canonical leftmost derivation sequence ($S \implies^* w$).
  - `Applied Rules`: Filtered subset of production rules utilized during the parsing process.
- **Copy BNF Button**: Copies the currently visible BNF text to the clipboard.

---

### Section 04: Concrete Parse Tree (CST) Visualizer
Provides an interactive graphical depiction of the full derivation hierarchy:
- **Derivation Chips**: Terminal and non-terminal tags styled according to their syntactic role:
  - Pink borders for non-terminal variables (`<statement>`, `<expression>`).
  - Purple chips for reserved keywords (`if`, `while`, `int`).
  - Green chips for operators (`+`, `*`, `==`).
  - Blue chips for numeric literals and identifiers.
- **Interactive Collapsing**: Click the `[-]` or `[+]` button on any node to collapse or expand subtrees.
- **ASCII Hierarchy View**: Toggle between the visual tree graph and text-based ASCII tree hierarchy.
- **Metrics Bar**: Displays total CST node count, maximum derivation depth, and terminal leaf counts.

---

### Section 05: Abstract Syntax Tree (AST) Visualizer
Displays the streamlined, semantic operator graph:
- **Pruned Punctuation**: Semicolons, parentheses, and intermediate non-terminals are eliminated.
- **Operator Notation**: Promotes operators to parent positions with explicit parenthetical notation (e.g., `ASSIGN (=)`, `ADD (+)`).
- **Redundancy Metrics**: Shows node reduction percentage achieved by transforming CST into AST.
- **ASCII View & Copy**: Allows exporting the AST in plain-text format for academic reports.

---

### Application Footer
Displays system architecture summary, engine status, and academic course citation.

---

## 4. Step-by-Step Workflow Guide

### Step 1: Inputting Source Code
1. Click on any preset button in the **Quick Presets** strip (e.g., `if (x == 5) y = x + 1; else y = 0;`).
2. Alternatively, type or paste your own statement directly into the editor.
3. Statements must be properly formatted according to grammar specifications (statements terminated by semicolons `;`).

---

### Step 2: Performing Syntax Validation
1. Click the **Validate Syntax** button.
2. If the code conforms to the LL(1) grammar:
   - A green confirmation banner appears: `Grammar Validation Passed`.
   - The **Generate BNF, CST & AST** button is unlocked.
3. If the code contains syntactic errors:
   - A red error banner appears with the exact error message and token coordinates.

---

### Step 3: Generating Derivations and Trees
1. Click **Generate BNF, CST & AST**.
2. The application sends the source text to the Python compiler engine.
3. The page smoothly scrolls down to the results section, displaying the synthesized BNF, CST, and AST.

---

### Step 4: Inspecting and Exporting Results
1. In Section 03 (BNF), select between `Representation`, `Derivation`, and `Applied Rules`. Click **Copy BNF** to paste into homework or documentation.
2. In Section 04 (CST) and Section 05 (AST), click `[-]` to collapse subtrees for readability, or switch to `ASCII Hierarchy` and click **Copy ASCII Tree** for plain text export.

---

## 5. Supported Language Constructs Reference

BNFgen supports 8 formal language constructs:

### Construct 01: Variable Declarations
Supports typed variable declarations with optional assignment:
```cpp
int x = 10;
float pi = 3.14;
string greeting = "hello";
bool isActive = true;
```
- **Syntax Rule**: `<declaration> ::= <type> <identifier> '=' <expression> ';' | <type> <identifier> ';'`
- **Supported Types**: `int`, `float`, `double`, `char`, `string`, `bool`.

---

### Construct 02: Variable Assignments
Assigns evaluated expressions or modifies identifier values:
```cpp
total = a * (b + 2);
count++;
index--;
```
- **Syntax Rule**: `<assignment> ::= <identifier> '=' <expression> ';'`
- **Increment / Decrement**: `<increment_statement> ::= <identifier> '++' ';' | <identifier> '--' ';'`

---

### Construct 03: Arithmetic Expressions
Precedence-aware expressions supporting parenthetical grouping:
```cpp
2 + 7
(x + y) / (z - 1)
a * b + c % 4
```
- **Syntax Rule**:
  - `<expression> ::= <expression> '+' <term> | <expression> '-' <term> | <term>`
  - `<term> ::= <term> '*' <factor> | <term> '/' <factor> | <term> '%' <factor> | <factor>`

---

### Construct 04: Conditional Branching
Decision structures with optional else clauses:
```cpp
if (x == 5) y = x + 1;
if (score >= 60) pass = 1; else pass = 0;
```
- **Syntax Rule**: `<if_statement> ::= 'if' '(' <condition> ')' <statement> 'else' <statement> | 'if' '(' <condition> ')' <statement>`
- **Relational Operators**: `==`, `!=`, `<`, `>`, `<=`, `>=`.

---

### Construct 05: Iteration and Loops
Predictive while-loop iteration statements:
```cpp
while (count < 10) count = count + 1;
while (flag == true) { x = x + 1; }
```
- **Syntax Rule**: `<while_statement> ::= 'while' '(' <condition> ')' <statement>`

---

### Construct 06: Compound Statement Blocks
Enclosed blocks grouping multiple statements:
```cpp
{
  int x = 1;
  y = x + 2;
  cout << y;
}
```
- **Syntax Rule**: `<block_statement> ::= '{' <statement_list> '}' | '{' '}'`

---

### Construct 07: Stream Output (cout)
C++ style stream insertion output statements:
```cpp
cout << "Result: " << total;
cout << x + 1;
```
- **Syntax Rule**: `<io_statement> ::= 'cout' '<<' <expression> ';'`

---

### Construct 08: Stream Input (cin)
C++ style stream extraction input statements:
```cpp
cin >> userInput;
```
- **Syntax Rule**: `<io_statement> ::= 'cin' '>>' <identifier> ';'`

---

## 6. Syntax Validation Rules and Diagnostics

### Strict Compiler Enforcement
To preserve academic rigor and prevent false positive derivations:
1. **Terminating Semicolons**: Every declaration, assignment, increment, and I/O statement must terminate with a semicolon `;`. Standalone arithmetic expressions (e.g. `2 + 7`) do not require semicolons.
2. **Balanced Delimiters**: Parentheses `(...)` and braces `{...}` must be properly paired.
3. **No Dangling Operators**: Binary operators require both left-hand and right-hand operands.

---

### Bare Identifiers Disallowed
A common point of confusion for students is entering arbitrary strings or bare words without grammatical context (such as typing `hello;` or `abc;`).

In BNFgen, bare identifiers are strictly disallowed:
- **Incorrect**: `hello;`
  - Diagnostic: `Syntax error: Bare identifier 'hello' is not a valid statement or expression.`
- **Correct alternatives**:
  - As console output: `cout << "hello";`
  - As variable declaration: `string s = "hello";`
  - As assignment: `x = hello;`

---

### Diagnostic Error Messages
When input violates grammar rules, BNFgen produces actionable diagnostics with exact line and column numbers:
- `Expected ';' after statement at line 1, col 12.`
- `Unexpected token in expression: '+' at line 1, col 8.`
- `Expected ')' after condition in if-statement at line 1, col 14.`

---

## 7. Troubleshooting and Frequently Asked Questions

### Question 1: The browser displays "Python Backend Offline"
- **Cause**: The FastAPI backend server is not running on port 8000.
- **Solution**: Open a terminal, navigate to `backend/`, and start the server:
  ```bash
  python -m uvicorn main:app --host 127.0.0.1 --port 8000
  ```

---

### Question 2: "Python was not found in system PATH"
- **Cause**: Python was installed without enabling PATH registration.
- **Solution**: Re-run the Python installer from [python.org](https://www.python.org/) and ensure the checkbox **"Add python.exe to PATH"** is selected.

---

### Question 3: Port 8000 is already in use
- **Cause**: An earlier server instance or another application is occupying port 8000.
- **Solution**:
  - In PowerShell:
    ```powershell
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
    ```
  - In Linux / macOS:
    ```bash
    fuser -k 8000/tcp
    ```

---

### Question 4: Browser displays a 404 or blank page on port 8000
- **Cause**: The frontend production build has not been generated into `frontend/dist/`.
- **Solution**:
  ```bash
  cd frontend
  npm install
  npm run build
  cd ..
  ```
  Then restart the Python backend server.
=======
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
- **Compiler Metrics** comparing concrete vs. abstract tree nodes and maximum derivation depths.

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
│ [BNFgen Brand]     [01 Input Console] [02 Grammar] [03 BNF] [04 CST] [05 AST]   │
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
│ │  • Metrics: Clean AST Nodes, Syntactic Delimiters Pruned                      │ │
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
6. **"𖣂" Symbol**:
   - The decorative derivation badge marking the Concrete Parse Tree header.

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
>>>>>>> bbbcdce2373e2ce1cbfae9f5de9834276488902d
