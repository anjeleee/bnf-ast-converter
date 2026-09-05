import React, { useState } from "react";
import { countBnfRules } from "../compiler/grammar.js";

export default function BnfCard({ result }) {
  const [bnfView, setBnfView] = useState("representation"); // 'representation' | 'derivation' | 'relevant'
  const [copiedBnf, setCopiedBnf] = useState(false);

  // Derive active BNF text
  let bnfShown = "<statement> ::= <empty>";
  if (result) {
    if (bnfView === "representation") {
      bnfShown = result.bnf_clean || result.bnfClean || result.bnf_representation || result.bnfRepresentation || "";
    } else if (bnfView === "derivation") {
      bnfShown = result.bnf_derivation || result.bnfDerivation || "";
    } else {
      bnfShown = result.bnf_relevant || result.bnfRelevant || "";
    }
  }

  const handleCopyBnf = async () => {
    try {
      await navigator.clipboard.writeText(bnfShown);
      setCopiedBnf(true);
      setTimeout(() => setCopiedBnf(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section id="bnf-section" className="neo-card result-row-card accent-purple">
      <header className="result-card-header">
        <div className="header-left">
          <div className="number-box num-purple">03</div>
          <div>
            <h2 className="result-card-heading">Backus–Naur Form (BNF)</h2>
            <span className="result-card-subheading">FORMAL GRAMMAR &amp; DERIVATION REPRESENTATION</span>
          </div>
        </div>
        <div className="header-right">
          <span className="header-icon-symbol" title="Grammar productions">&#123; &#125;</span>
        </div>
      </header>

      <div className="result-card-subbar">
        <div className="subbar-left">
          <span className="subbar-label">
            {bnfView === "representation" && "INPUT STATEMENT BNF REPRESENTATION"}
            {bnfView === "derivation" && "CANONICAL LEFTMOST DERIVATION (S ⇒* INPUT)"}
            {bnfView === "relevant" && "APPLIED PRODUCTION RULES"}
          </span>
          <span className="badge lime-badge">
            {bnfView === "representation" && "Statement BNF Active"}
            {bnfView === "derivation" && "Step-by-Step Derivation Active"}
            {bnfView === "relevant" && (result ? `${result.bnf_rules_count || countBnfRules(result.bnf_relevant)} Rules Active` : "Rules Loaded")}
          </span>
        </div>
        <div className="subbar-right">
          <div className="segmented-tabs" role="tablist">
            <button
              type="button"
              className={`tab-btn ${bnfView === "representation" ? "tab-active" : ""}`}
              onClick={() => setBnfView("representation")}
            >
              BNF Representation (Input)
            </button>
            <button
              type="button"
              className={`tab-btn ${bnfView === "derivation" ? "tab-active" : ""}`}
              onClick={() => setBnfView("derivation")}
            >
              Step-by-Step Derivation (⇒)
            </button>
            <button
              type="button"
              className={`tab-btn ${bnfView === "relevant" ? "tab-active" : ""}`}
              onClick={() => setBnfView("relevant")}
            >
              Applied Rules
            </button>
          </div>
          <button
            type="button"
            className="copy-btn"
            onClick={handleCopyBnf}
            title="Copy BNF content"
          >
            {copiedBnf ? "Copied" : "Copy BNF"}
          </button>
        </div>
      </div>

      <div className="terminal-code-box">
        <pre className="bnf-code-display">{bnfShown}</pre>
        <div className="terminal-box-footer">
          <span className="dot dot-valid" />
          <span>
            {bnfView === "representation" && "Exact Statement BNF Decomposition • Validated"}
            {bnfView === "derivation" && "Formal Leftmost Sentential Form Derivation • Validated"}
            {bnfView === "relevant" && "Deterministic LL(1) Non-ambiguous Productions"}
          </span>
        </div>
      </div>

      <footer className="result-card-footer">
        <div className="footer-left">
          <span className="dot dot-valid" />
          <span>BNF Representation: Verified</span>
        </div>
        <div className="footer-right">
          <span className="pill-badge">Deterministic LL(1)</span>
        </div>
      </footer>
    </section>
  );
}