import React from "react";

export default function Header({ activeNav, scrollToSection, loading, engineStatus }) {
  return (
    <header className="topbar">
      <a
        className="brand"
        href="#input-section"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection("input");
        }}
      >
        <span className="brand-mark">✦</span>
        <span className="brand-text">
          BNF<span className="brand-accent">gen</span>.
        </span>
      </a>

      <nav className="nav-pill-group" aria-label="Page Sections">
        <button
          type="button"
          className={`nav-pill ${activeNav === "input" ? "active" : ""}`}
          onClick={() => scrollToSection("input")}
        >
          01 Input Console
        </button>
        <button
          type="button"
          className={`nav-pill ${activeNav === "features" ? "active" : ""}`}
          onClick={() => scrollToSection("features")}
        >
          02 Grammar Features
        </button>
        <button
          type="button"
          className={`nav-pill ${activeNav === "bnf" ? "active" : ""}`}
          onClick={() => scrollToSection("bnf")}
        >
          03 BNF Output
        </button>
        <button
          type="button"
          className={`nav-pill ${activeNav === "cst" ? "active" : ""}`}
          onClick={() => scrollToSection("cst")}
        >
          04 Parse Tree (CST)
        </button>
        <button
          type="button"
          className={`nav-pill ${activeNav === "ast" ? "active" : ""}`}
          onClick={() => scrollToSection("ast")}
        >
          05 AST Viewer
        </button>
      </nav>

      <div
        className={`status-pill ${loading ? "is-loading" : "is-ready"}`}
        title={`Active Engine: ${engineStatus}`}
      >
        <span className="status-dot" />
        <span className="status-label">
          {loading ? "Synthesizing Trees…" : engineStatus}
        </span>
      </div>
    </header>
  );
}