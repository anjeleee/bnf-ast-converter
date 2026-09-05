# BNFgen: Frontend Web Visualizer
> **Modern Interactive Interface for Compiler Syntax Analysis & Tree Visualization**

[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E.svg?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)

This directory contains the client-side single-page application (SPA) for **BNFgen**. Built with **React 19**, **Vite**, and custom responsive neo-brutalist styling, it communicates directly with the Python FastAPI compiler engine to visualize formal syntax decompositions and interactive parse trees.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation & Environment Setup](#installation--environment-setup)
- [Development & Build Scripts](#development--build-scripts)
- [Environment Variables (.env)](#environment-variables-env)
- [Component Architecture](#component-architecture)
- [Backend Proxy & API Connectivity](#backend-proxy--api-connectivity)

---

## Prerequisites

Make sure you have installed:
- **Node.js**: `18.0.0` or newer (`20.x` or `22.x` LTS recommended). [Download Node.js](https://nodejs.org/)
- **npm**: `9.0.0` or newer (comes bundled with Node.js).
- Running **Python FastAPI Backend** (on `http://127.0.0.1:8000`).

Check your Node.js and npm versions:
```bash
node -v
npm -v
```

---

## Installation & Environment Setup

### 1. Install Node Dependencies
Navigate into the `frontend/` directory and install all required npm packages:
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create your local `.env` file by copying the template `.env.example`:
```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

The default contents of `.env`:
```env
# Base URL for the Python FastAPI backend engine
VITE_API_URL=http://127.0.0.1:8000
```

---

## Development & Build Scripts

| Command | Action | Output |
| :--- | :--- | :--- |
| `npm run dev` | Starts Vite local dev server with instant HMR | `http://localhost:5173` |
| `npm run build` | Compiles optimized production bundle | `frontend/dist/` |
| `npm run preview` | Locally serves and previews production build | `http://localhost:4173` |
| `npm run lint` | Runs ultra-fast Oxlint linter on source code | Lint check report |

### Running in Development Mode
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. Any edits made to `.jsx` or `.css` files will hot-reload instantly.

### Building for Production
```bash
npm run build
```
This bundles the entire application into static assets in `frontend/dist/` (HTML, CSS, JS). The Python backend automatically mounts and serves these files when you access `http://localhost:8000`.

---

## Component Architecture

The frontend is designed with zero file duplication, separating presentation components from compiler network utilities:

```text
frontend/src/
├── components/                 # Modular presentation components
│   ├── Header.jsx              # Topbar navigation, brand logo, section pills, engine status
│   ├── InputConsole.jsx        # Section 01 (Presets strip & code editor) + Section 02 (CFG accordion)
│   ├── BnfCard.jsx             # Section 03 (BNF representation, leftmost derivation, rules)
│   ├── CstCard.jsx             # Section 04 (Concrete Parse Tree visualizer with 𖣂 badge)
│   ├── AstCard.jsx             # Section 05 (Syllabus-aligned AST visualizer & operator graph)
│   └── Footer.jsx              # Bottom branding, architecture status & copyright footer
│
├── compiler/                   # Pure API client & tree calculation utilities (NO JS parser)
│   ├── parser.js               # REST connector: parseCode(), validateCode(), checkBackendHealth()
│   ├── grammar.js              # Formal BNF specifications, presets (EXAMPLES), GRAMMAR_FEATURES
│   └── treeUtils.js            # countNodes(), getDepth(), countLeaves(), treeToAscii()
│
├── TreeView.jsx                # Standalone reusable collapsible interactive tree component
├── App.jsx                     # Minimal container component (~170 lines) coordinating app state
├── index.css                   # Custom responsive neo-brutalist CSS tokens & responsive rules
└── main.jsx                    # React DOM entry point
```

### Responsibilities of Key Modules:
- **`App.jsx`**: Acts as a high-level state container. Manages active code, parse results, validation state, and delegates UI rendering to child components.
- **`InputConsole.jsx`**: Houses Section 01 (Presets with horizontal scroll buttons, line-numbered editor, syntax validation) and Section 02 (2-layer accordion with 8 construct cards and full CFG code view).
- **`CstCard.jsx` & `AstCard.jsx`**: Display tree derivation badges, metadata pills, and host the interactive `TreeView`.
- **`TreeView.jsx`**: Recursively renders tree nodes with branch connectors, interactive expansion/collapse (`[-]` / `[+]`), and terminal/non-terminal styles.
- **`compiler/parser.js`**: Handles communication with the Python FastAPI backend via `fetch` with timeout signals.

---

## Backend Proxy & API Connectivity

During development, `vite.config.js` is pre-configured with a proxy so API requests are routed smoothly without CORS issues:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/parse': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000'
    }
  }
});
```
