import React from "react";
import TreeView from "../TreeView.jsx";
import { countNodes } from "../compiler/treeUtils.js";

export default function AstCard({ result }) {
  const ast = result?.ast;
  const astNodesCount = result ? countNodes(ast) : 0;
  const reduction = result?.metrics?.reduction;

  return (
    <section id="ast-section" className="neo-card result-row-card accent-pink">
      <header className="result-card-header">
        <div className="header-left">
          <div className="number-box num-pink">05</div>
          <div>
            <h2 className="result-card-heading">Abstract Syntax Tree (AST)</h2>
            <span className="result-card-subheading">SIMPLIFIED OPERATOR REPRESENTATION</span>
          </div>
        </div>
        <div className="header-right">
          <span className="header-icon-symbol" title="Abstract Syntax Tree">❖</span>
        </div>
      </header>

      <div className="result-card-subbar">
        <div className="subbar-left">
          <span className="subbar-label">PRUNED SYNTAX OPERATOR GRAPH</span>
          {reduction !== undefined && (
            <span className="badge lime-badge">
              -{reduction}% Redundancy
            </span>
          )}
        </div>
        <div className="subbar-right">
          <span className="subbar-meta">
            Operators &amp; Operands: <strong>{astNodesCount}</strong> Clean AST Nodes
          </span>
        </div>
      </div>

      <div className="tree-display-box">
        <TreeView
          data={ast}
          mode="ast"
          emptyText="The abstract syntax tree containing simplified semantic structure will appear here."
        />
        <div className="tree-box-meta-footer">
          <span>Syntactic Delimiters: Pruned</span>
          <span>Optimized for IR CodeGen</span>
        </div>
      </div>

      <footer className="result-card-footer">
        <div className="footer-left">
          <span className="dot dot-valid" />
          <span>Pruned Punctuation &amp; Delimiters</span>
        </div>
        <div className="footer-right">
          <span className="pill-badge">AST Verified</span>
        </div>
      </footer>
    </section>
  );
}