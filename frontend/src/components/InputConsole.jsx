import React, { useState, useRef } from "react";
import { EXAMPLES, GRAMMAR_FEATURES, FULL_BNF_TEXT } from "../compiler/grammar.js";

export default function InputConsole({
  code,
  onChangeCode,
  engineStatus,
  isValidated,
  validationSuccess,
  error,
  loading,
  onValidate,
  onExecuteParse,
  onClear
}) {
  const [activeGrammarTab, setActiveGrammarTab] = useState("constructs"); // 'constructs' | 'cfg'
  const [expandedConstructId, setExpandedConstructId] = useState("blocks");
  const [copiedRawCfg, setCopiedRawCfg] = useState(false);
  const presetsRef = useRef(null);

  const statementCount =
    code
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean).length || (code.trim() ? 1 : 0);

  const scrollPresets = (direction) => {
    if (presetsRef.current) {
      presetsRef.current.scrollBy({
        left: direction === "left" ? -220 : 220,
        behavior: "smooth"
      });
    }
  };

  const handleCopyRawCfg = async () => {
    try {
      await navigator.clipboard.writeText(FULL_BNF_TEXT);
      setCopiedRawCfg(true);
      setTimeout(() => setCopiedRawCfg(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="top-split-layout">
      {/* SECTION 01: Source Code Input Console */}
      <section id="input-section" className="neo-card input-card accent-purple" aria-label="Source code input">
        <header className="result-card-header">
          <div className="header-left">
            <div className="number-box num-purple">01</div>
            <div>
              <h2 className="result-card-heading">Source Code Input</h2>
              <span className="result-card-subheading">LL(1) RECURSIVE DESCENT SYNTAX ANALYZER</span>
            </div>
          </div>
          <div className="header-right">
            <button
              className="neo-button secondary-btn clear-btn"
              type="button"
              onClick={onClear}
              title="Clear editor content"
            >
              Clear Input
            </button>
          </div>
        </header>

        <div className="result-card-subbar">
          <div className="subbar-left">
            <span className="subbar-label">ACCEPTED FORMATS</span>
            <span className="badge soft-pill">Statement, Expression or Block</span>
          </div>
          <div className="subbar-right">
            <span className="subbar-meta">Deterministic Match</span>
          </div>
        </div>

        <p className="card-subtitle">
          Enter your source statement or expression below to automatically generate formal BNF representation,
          concrete parse tree derivation, and simplified AST.
        </p>

        {/* Quick Presets Row: Single-row horizontal scroll strip with < > arrows */}
        <div className="presets-container" aria-label="Quick Presets">
          <span className="presets-label">QUICK PRESETS:</span>
          <div className="presets-scroll-wrapper">
            <button
              type="button"
              className="preset-scroll-arrow left"
              onClick={() => scrollPresets("left")}
              title="Scroll presets left"
              aria-label="Scroll presets left"
            >
              ◀
            </button>
            <div className="presets-chips" ref={presetsRef}>
              {EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  className={`preset-pill ${code === example.code ? "preset-active" : ""}`}
                  type="button"
                  onClick={() => onChangeCode(example.code)}
                >
                  {example.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="preset-scroll-arrow right"
              onClick={() => scrollPresets("right")}
              title="Scroll presets right"
              aria-label="Scroll presets right"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Code Editor Box */}
        <div className="editor-window">
          <div className="editor-window-bar">
            <div className="window-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
              <span className="window-filename">input_statement.src</span>
            </div>
            <div className="window-meta">
              <span>
                {statementCount > 1 ? `${statementCount} Statements` : "1 Statement / Expression"} • Deterministic Grammar Match
              </span>
            </div>
          </div>

          <textarea
            className="source-editor"
            value={code}
            onChange={(e) => onChangeCode(e.target.value)}
            rows={6}
            spellCheck="false"
            placeholder="e.g. 2 + 7, if (x == 5) y = x + 1; or while (count < 10) count = count + 1;"
          />

          {/* Editor Bottom Bar: Validate Syntax and Generate Tree buttons */}
          <div className="editor-bottom-bar">
            <div className="editor-bottom-left">
              <div className="pipeline-status" title={`Active: ${engineStatus}`}>
                <span className="pipeline-dot" />
                <span>{engineStatus.includes("FastAPI") ? "FastAPI Engine" : "Compiler Engine"} • LL(1) Ready</span>
              </div>
              <span className={`validation-hint ${isValidated ? "valid" : ""}`}>
                {isValidated ? "● Syntax Validated" : "○ Validate syntax to unlock generation"}
              </span>
            </div>

            <div className="editor-actions-right">
              <button
                className={`neo-button validate-action-btn ${isValidated ? "is-validated" : ""}`}
                type="button"
                onClick={onValidate}
              >
                {isValidated ? "Validated" : "Validate Syntax"}
              </button>

              <button
                className="neo-button generate-btn"
                type="button"
                onClick={onExecuteParse}
                disabled={!isValidated || loading}
                title={!isValidated ? "Please validate syntax before generating results" : "Generate BNF, CST and AST"}
              >
                <span>{loading ? "Generating Trees…" : "Generate BNF, CST & AST →"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts / Feedback */}
        {error && (
          <div className="neo-alert alert-error" role="alert">
            <span className="alert-tag error">ERROR</span>
            <div className="alert-content">
              <strong>Syntax Error Detected:</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {validationSuccess && !error && isValidated && (
          <div className="neo-alert alert-success" role="status">
            <span className="alert-tag valid">VALID</span>
            <div className="alert-content">
              <strong>Grammar Validation Passed:</strong> Statement conforms deterministically to LL(1) formal specifications. Ready to generate.
            </div>
          </div>
        )}
      </section>

      {/* SECTION 02: Supported Grammar Features Panel */}
      <section id="features-section" className="neo-card features-side-card accent-purple" aria-label="Supported Grammar Features">
        <header className="result-card-header">
          <div className="header-left">
            <div className="number-box num-purple">02</div>
            <div>
              <h2 className="result-card-heading">Supported Grammar</h2>
              <span className="result-card-subheading">FORMAL CONTEXT-FREE GRAMMAR CAPABILITIES</span>
            </div>
          </div>
          <div className="header-right">
            <span className="grammar-type-badge">LL(1) CFG</span>
          </div>
        </header>

        <div className="result-card-subbar">
          <div className="subbar-left">
            <span className="subbar-label">LANGUAGE CONSTRUCTS</span>
            <span className="badge soft-pill">8 Supported</span>
          </div>
          <div className="subbar-right">
            <span className="subbar-meta">Deterministic Grammar</span>
          </div>
        </div>

        <p className="card-subtitle">
          Inspect the 8 core language constructs recognized by the LL(1) parser or explore the full 18 Context-Free Grammar production rules.
        </p>

        {/* 2-Layer Accordion */}
        <div className="grammar-layers-container">
          {/* LAYER 1 BUTTON: Supported Language Constructs */}
          <button
            type="button"
            className={`layer-toggle-btn ${activeGrammarTab === "constructs" ? "is-active" : ""}`}
            onClick={() => setActiveGrammarTab("constructs")}
            title="View Supported Language Constructs"
          >
            <span className="layer-btn-title">
              <span className="layer-arrow">{activeGrammarTab === "constructs" ? "▼" : "▶"}</span>
              <span>
                {activeGrammarTab === "constructs" ? "Supported Language Constructs" : "View Supported Language Constructs"}
              </span>
            </span>
            <span className="badge soft-pill">
              {activeGrammarTab === "constructs" ? "8 Active" : "8 Constructs"}
            </span>
          </button>

          {/* LAYER 1 CONTENT: Directly underneath Button 1 */}
          {activeGrammarTab === "constructs" && (
            <div className="features-side-list" aria-label="8 Language Constructs">
              {GRAMMAR_FEATURES.map((feat) => {
                const isExpanded = expandedConstructId === feat.id;
                return (
                  <article key={feat.id} className={`feature-accordion-item ${isExpanded ? "is-expanded" : ""}`}>
                    <button
                      type="button"
                      className="feature-accordion-header"
                      onClick={() => setExpandedConstructId(isExpanded ? null : feat.id)}
                      aria-expanded={isExpanded}
                    >
                      <span className="accordion-title-group">
                        <span className="accordion-icon">{isExpanded ? "▼" : "▶"}</span>
                        <h3 className="feature-side-name">{feat.title}</h3>
                      </span>
                      <span className="badge soft-pill">{feat.badge}</span>
                    </button>
                    {isExpanded && (
                      <div className="feature-accordion-content">
                        <p className="feature-side-desc">{feat.desc}</p>
                        <pre className="feature-side-cfg">{feat.cfg}</pre>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* LAYER 2 BUTTON: Complete Formal Grammar (CFG) */}
          <button
            type="button"
            className={`layer-toggle-btn ${activeGrammarTab === "cfg" ? "is-active" : ""}`}
            onClick={() => setActiveGrammarTab("cfg")}
            title="View Complete Formal Grammar (CFG)"
          >
            <span className="layer-btn-title">
              <span className="layer-arrow">{activeGrammarTab === "cfg" ? "▼" : "▶"}</span>
              <span>
                {activeGrammarTab === "cfg" ? "Complete Formal Grammar (CFG)" : "View Complete Formal Grammar (CFG)"}
              </span>
            </span>
            <span className="badge soft-pill">
              {activeGrammarTab === "cfg" ? "18 Active" : "18 Rules"}
            </span>
          </button>

          {/* LAYER 2 CONTENT: Directly underneath Button 2 when opened */}
          {activeGrammarTab === "cfg" && (
            <div className="terminal-code-box cfg-box" aria-label="Complete Formal Grammar">
              <div className="tree-toolbar">
                <span className="subbar-label">COMPLETE FORMAL BACKUS-NAUR FORM (BNF)</span>
                <button type="button" className="copy-btn" onClick={handleCopyRawCfg}>
                  {copiedRawCfg ? "Copied" : "Copy Full CFG"}
                </button>
              </div>
              <pre className="bnf-code-display">{FULL_BNF_TEXT}</pre>
            </div>
          )}
        </div>

        <footer className="result-card-footer">
          <div className="footer-left">
            <span className="dot dot-valid" />
            <span>Complete &amp; Deterministic</span>
          </div>
          <div className="footer-right">
            <span className="badge soft-pill">8 Constructs</span>
          </div>
        </footer>
      </section>
    </div>
  );
}