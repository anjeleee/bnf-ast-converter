import React from "react";

export default function Footer({ engineStatus }) {
  return (
    <footer className="app-footer">
      <div className="footer-brand">
        <strong>BNFgen.</strong>
        <span>© Formal Compiler Syntax &amp; Tree Visualizer</span>
      </div>
      <div className="footer-status">
        <span>{engineStatus} • LL(1) CST &amp; AST Synthesis</span>
        <span className="badge lime-badge active-tag">ACTIVE</span>
      </div>
    </footer>
  );
}