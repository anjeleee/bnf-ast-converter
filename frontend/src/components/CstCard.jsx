import React from "react";
import TreeView from "../TreeView.jsx";
import { countNodes, getDepth, countLeaves } from "../compiler/treeUtils.js";

export default function CstCard({ result }) {
  const parseTree = result?.parse_tree || result?.parseTree;
  const cstNodesCount = result ? countNodes(parseTree) : 0;
  const cstDepth = result ? getDepth(parseTree) : 0;
  const cstTerminals = result ? countLeaves(parseTree) : 0;

  return (
    <section id="cst-section" className="neo-card result-row-card accent-lime">
      <header className="result-card-header">
        <div className="header-left">
          <div className="number-box num-lime">04</div>
          <div>
            <h2 className="result-card-heading">Concrete Parse Tree (CST)</h2>
            <span className="result-card-subheading">FULL DERIVATION HIERARCHY</span>
          </div>
        </div>
        <div className="header-right">
          <span className="header-icon-symbol" title="Concrete Parse Tree">𖣂</span>
        </div>
      </header>

      <div className="result-card-subbar">
        <div className="subbar-left">
          <span className="subbar-label">SYNTAX DERIVATION CHIPS</span>
          <span className="badge purple-badge">
            {result ? `${cstNodesCount} Tree Nodes` : "Waiting for input"}
          </span>
        </div>
        <div className="subbar-right">
          <span className="subbar-meta">
            Concrete Terminals: <strong>{cstTerminals}</strong> Included • Depth: <strong>{cstDepth}</strong> Levels
          </span>
        </div>
      </div>

      <div className="tree-display-box">
        <TreeView
          data={parseTree}
          mode="cst"
          emptyText="The concrete parse tree showing all non-terminals, operators, and terminals will appear here."
        />
        <div className="tree-box-meta-footer">
          <span>Concrete Terminals: {cstTerminals} Included</span>
          <span>Max Derivation Depth: {cstDepth} Levels</span>
        </div>
      </div>

      <footer className="result-card-footer">
        <div className="footer-left">
          <span className="dot dot-valid" />
          <span>Derivation: Top-Down Recursive</span>
        </div>
        <div className="footer-right">
          <span className="pill-badge">CST Complete</span>
        </div>
      </footer>
    </section>
  );
}