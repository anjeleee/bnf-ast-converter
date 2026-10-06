# BNFgen: Frontend Web Visualizer
> **Lightweight Interactive Interface for C++ Compiler Syntax Analysis & Tree Visualization**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26.svg?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6.svg?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E.svg?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)

This directory contains the client-side web application for **BNFgen**. Built with **pure HTML5, CSS3, and Vanilla JavaScript**, it requires zero Node.js, zero npm packages, and zero build compilation steps. It is served directly by the Python FastAPI backend engine to visualize formal C++ syntax decompositions, Concrete Parse Trees (CST), and Abstract Syntax Trees (AST).

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Directory Structure](#directory-structure)
- [Architecture & Execution Flow](#architecture--execution-flow)
- [Design System & CSS Tokens](#design-system--css-tokens)
- [Connecting to Backend](#connecting-to-backend)

---

## Prerequisites

- **Python**: Version 3.8+ (running the FastAPI backend on `http://127.0.0.1:8000`).
- **Web Browser**: Any modern browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
- *(Note: Node.js and npm are NOT required).*

---

## Directory Structure

```text
frontend/
├── index.html         # Semantic HTML5 layout (Sections 01 to 05, topbar, and footer)
├── css/
│   └── style.css      # Neo-brutalist responsive styling, CSS variables, and dark editor
├── js/
│   ├── app.js         # Main UI coordinator and DOM event manager
│   ├── grammar.js     # Formal C++ BNF production rules and preset examples
│   ├── treeUtils.js   # Tree calculation algorithms (depth, nodes, leaves, ASCII)
│   └── api.js         # Asynchronous fetch client for FastAPI /parse and /health
└── README.md          # Dedicated frontend documentation (this file)
```

---

## Architecture & Execution Flow

The frontend connects directly to the Python FastAPI backend:

1. **User Interaction**:
   - The user selects a C++ preset or types a C++ statement in `#source-editor`.
   - The UI automatically updates statement counts and resets validation state.

2. **Validation**:
   - Clicking **Validate Syntax** triggers a lightweight check via `fetch('/parse')`.
   - If the statement conforms to C++ LL(1) rules, validation is confirmed and tree generation is unlocked.

3. **Tree Synthesis & BNF Generation**:
   - Clicking **Generate BNF, CST & AST** requests complete AST, CST, and BNF derivations from Python.
   - `app.js` recursively builds:
     - The **Concrete Parse Tree (CST)** with collapsible nodes (`[-]` / `[+]`).
     - The **Abstract Syntax Tree (AST)** with pruned delimiters and hoisted operators.
     - The **BNF Representation** with tabs for Input BNF, Step-by-Step Derivations, and Applied Rules.
     - Formats human-readable ASCII trees with single-click clipboard copying.

---

## Design System & CSS Tokens

The visual styling is defined in `style.css` using custom CSS variables (Neo-Brutalist design tokens):

- `--primary`: `#908df1` (Purple accent)
- `--secondary`: `#c4f000` (Lime green accent)
- `--tertiary`: `#ff70a6` (Pink accent)
- `--neutral-dark`: `#121212` (Text and border lines)
- `--editor-bg`: `#181524` (Dark C++ editor window)
- `--shadow-neo`: `4px 4px 0px #121212` (Neo-brutalist hard drop shadows)

---

## Connecting to Backend

The frontend automatically detects whether it is served by the backend or opened locally:
- Served via `http://localhost:8000`: uses relative URLs (`/parse`, `/health`).
- Opened directly: defaults to `http://127.0.0.1:8000`.
