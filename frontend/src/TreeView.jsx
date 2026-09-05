import React, { useState, useMemo } from "react";
import { treeToAscii } from "./compiler/treeUtils.js";

function getChipClass(node, mode) {
  const text = (node?.label || node?.value || "").trim();
  if (mode === "cst") {
    if (text.startsWith("<") && text.endsWith(">")) return "cst-non-terminal";
    if (
      [
        "if",
        "else",
        "while",
        "int",
        "float",
        "double",
        "char",
        "string",
        "bool",
        "cout",
        "cin"
      ].includes(text)
    ) {
      return "cst-keyword";
    }
    if (
      [
        "+",
        "-",
        "*",
        "/",
        "%",
        "=",
        "==",
        "!=",
        "<",
        ">",
        "<=",
        ">=",
        "++",
        "--",
        "<<",
        ">>"
      ].includes(text)
    ) {
      return "cst-operator";
    }
    if ([";", "(", ")", "{", "}", ","].includes(text)) {
      return "cst-delimiter";
    }
    if (text.startsWith("id(") || /^[a-zA-Z_]\w*$/.test(text)) {
      return "cst-identifier";
    }
    if (text.startsWith("num(") || /^\d+(\.\d+)?$/.test(text)) {
      return "cst-number";
    }
    return "cst-default";
  } else {
    // AST mode
    const upper = text.toUpperCase();
    if (
      upper.startsWith("IF") ||
      upper.startsWith("WHILE") ||
      upper.startsWith("DECL") ||
      upper.startsWith("ASSIGN") ||
      upper.startsWith("BLOCK") ||
      upper.startsWith("PROGRAM") ||
      upper.startsWith("COUT") ||
      upper.startsWith("CIN") ||
      upper.startsWith("STATEMENT")
    ) {
      return "ast-node-stmt";
    }
    if (upper.includes("COND")) return "ast-node-cond";
    if (
      upper.includes("ADD") ||
      upper.includes("SUB") ||
      upper.includes("MUL") ||
      upper.includes("DIV") ||
      upper.includes("MOD") ||
      upper.includes("OP") ||
      upper.includes("NEG") ||
      ["+", "-", "*", "/", "%", "=", "==", "!=", "<", ">", "<=", ">="].includes(
        text
      )
    ) {
      return "ast-node-op";
    }
    if (
      upper.includes("THEN") ||
      upper.includes("ELSE") ||
      upper.includes("BODY") ||
      upper.includes("EXPR")
    ) {
      return "ast-node-branch";
    }
    if (!node.children || node.children.length === 0) {
      return "ast-node-leaf";
    }
    return "ast-node-default";
  }
}

function TreeNode({ node, mode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!node) return null;

  const children = Array.isArray(node.children) ? node.children : [];
  const hasChildren = children.length > 0;
  const label =
    node.label ||
    node.type ||
    node.value ||
    (typeof node === "string" ? node : "");

  return (
    <li className="tree-branch-item">
      <div className="tree-node-row">
        {hasChildren && (
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand node" : "Collapse node"}
            aria-label={isCollapsed ? "Expand node" : "Collapse node"}
          >
            {isCollapsed ? "+" : "−"}
          </button>
        )}
        <span className={`tree-chip ${getChipClass(node, mode)}`}>{label}</span>
        {isCollapsed && hasChildren && (
          <span className="collapsed-indicator">({children.length} hidden)</span>
        )}
      </div>

      {!isCollapsed && hasChildren && (
        <ul className="tree-branch-list">
          {children.map((child, idx) => (
            <TreeNode key={idx} node={child} mode={mode} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeView({ data, mode = "cst", emptyText }) {
  const [viewMode, setViewMode] = useState("graph"); // 'graph' | 'ascii'
  const [copied, setCopied] = useState(false);

  const asciiText = useMemo(() => {
    return data ? treeToAscii(data) : "";
  }, [data]);

  if (!data) {
    return (
      <div className="empty-state">
        <p>{emptyText || "No tree data available to display."}</p>
      </div>
    );
  }

  const handleCopyAscii = async () => {
    try {
      await navigator.clipboard.writeText(asciiText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="tree-view-wrapper">
      <div className="tree-toolbar">
        <div className="tree-toolbar-left">
          <button
            type="button"
            className={`tree-toggle-btn ${viewMode === "graph" ? "active" : ""}`}
            onClick={() => setViewMode("graph")}
          >
            Tree Graph
          </button>
          <button
            type="button"
            className={`tree-toggle-btn ${viewMode === "ascii" ? "active" : ""}`}
            onClick={() => setViewMode("ascii")}
          >
            ASCII Hierarchy
          </button>
        </div>
        <div className="tree-toolbar-right">
          <button
            type="button"
            className="copy-btn"
            onClick={handleCopyAscii}
            title="Copy ASCII tree to clipboard"
          >
            {copied ? "Copied" : "Copy ASCII Tree"}
          </button>
        </div>
      </div>

      {viewMode === "graph" ? (
        <div className="tree-graph-container">
          <ul className="tree-graph-root">
            <TreeNode node={data} mode={mode} />
          </ul>
        </div>
      ) : (
        <pre className="tree-ascii-block">{asciiText}</pre>
      )}
    </div>
  );
}
