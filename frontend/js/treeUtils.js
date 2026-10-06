/**
 * Tree calculation and formatting utilities for Concrete Parse Trees (CST) and Abstract Syntax Trees (AST).
 * Provides recursive algorithms to count nodes, compute tree depth, count leaves,
 * format trees into visual ASCII text hierarchies, and determine color styling classes.
 */

/**
 * Counts the total number of nodes in a syntax tree recursively.
 * @param {Object} node - The tree root or subtree node to count.
 * @returns {number} - Total number of nodes in this subtree.
 */
export function countNodes(node) {
  // If the node is null, undefined, or not an object, count is 0
  if (!node || typeof node !== "object") return 0;

  // Extract the array of child nodes safely (defaults to empty array if none)
  const children = Array.isArray(node.children) ? node.children : [];

  // Count 1 for the current node, then recursively sum the counts of all children
  return 1 + children.reduce((acc, c) => acc + countNodes(c), 0);
}

/**
 * Computes the maximum hierarchical depth of a syntax tree.
 * @param {Object} node - The tree root or subtree node.
 * @returns {number} - The maximum depth level (starts at 1 for root).
 */
export function getDepth(node) {
  // Return 0 if the node is empty or invalid
  if (!node || typeof node !== "object") return 0;

  // Get the list of child nodes
  const children = Array.isArray(node.children) ? node.children : [];

  // If this node has no children, its depth level is 1
  if (children.length === 0) return 1;

  // 1 for this level plus the maximum depth found among all child subtrees
  return 1 + Math.max(...children.map(getDepth));
}

/**
 * Counts the total number of terminal leaf nodes (nodes with no children).
 * In a CST, leaf nodes represent actual source code tokens.
 * @param {Object} node - The tree node to inspect.
 * @returns {number} - Count of leaf nodes.
 */
export function countLeaves(node) {
  // Return 0 if the node is empty or invalid
  if (!node || typeof node !== "object") return 0;

  // Get child nodes array
  const children = Array.isArray(node.children) ? node.children : [];

  // If there are no children, this node is a leaf (terminal token)
  if (children.length === 0) return 1;

  // Sum leaves across all child subtrees recursively
  return children.reduce((acc, c) => acc + countLeaves(c), 0);
}

/**
 * Converts a tree data structure into a visual ASCII hierarchy string with branch lines.
 * Uses unicode box-drawing characters: └─ (corner), ├─ (branch), │  (vertical line).
 * @param {Object} node - The tree node to format.
 * @param {string} prefix - The indentation and vertical line string accumulated so far.
 * @param {boolean} isLast - Whether this node is the last child among its siblings.
 * @param {boolean} isRoot - Whether this is the top-level root node of the entire tree.
 * @returns {string} - Formatted multi-line ASCII tree string.
 */
export function treeToAscii(node, prefix = "", isLast = true, isRoot = true) {
  // Return empty string if node is invalid
  if (!node || typeof node !== "object") return "";

  // Get the display label of the node (checks label, type, or value)
  let rawLabel = node.label || node.type || node.value || (typeof node === "string" ? node : "node");

  // Normalize label format for standard terminal and non-terminal display:
  let cleanLabel = rawLabel;
  if (cleanLabel.startsWith("id(")) {
    cleanLabel = "identifier(" + cleanLabel.slice(3);
  } else if (cleanLabel.startsWith("num(")) {
    cleanLabel = "number(" + cleanLabel.slice(4);
  } else if (cleanLabel === "<if_statement>") {
    cleanLabel = "if_stmt";
  } else if (cleanLabel === "<while_statement>") {
    cleanLabel = "while_stmt";
  } else if (cleanLabel.startsWith("<") && cleanLabel.endsWith(">")) {
    cleanLabel = cleanLabel.slice(1, -1);
  }

  // Get array of children
  const children = Array.isArray(node.children) ? node.children : [];

  // Special formatting for the top-level root node:
  if (isRoot) {
    let result = cleanLabel + "\n"; // Root displays clean node name without connector
    children.forEach((child, index) => {
      // Recurse for each child; mark isLast as true for the final child
      result += treeToAscii(child, "", index === children.length - 1, false);
    });
    return result;
  }

  // Branch connector: use '└── ' for the last child, '├── ' for intermediate children
  const connector = isLast ? "└── " : "├── ";
  let result = prefix + connector + cleanLabel + "\n";

  // Child prefix: use 4 spaces '    ' if last sibling, or vertical bar '│   ' if more siblings follow
  const childPrefix = prefix + (isLast ? "    " : "│   ");
  children.forEach((child, index) => {
    // Recurse for each child node
    result += treeToAscii(child, childPrefix, index === children.length - 1, false);
  });
  return result;
}

/**
 * Determines the CSS badge color styling class based on the node's category and value.
 * @param {Object} node - The tree node object.
 * @param {string} mode - "cst" for parse tree tokens, or "ast" for abstract operator nodes.
 * @returns {string} - CSS class name (e.g., "cst-keyword", "ast-node-op").
 */
export function getChipClass(node, mode) {
  // Extract text and strip extra whitespace
  const text = (node?.label || node?.value || "").trim();

  // CST styling rules (distinguishes non-terminals, keywords, operators, identifiers, numbers, delimiters)
  if (mode === "cst") {
    // Non-terminals enclosed in angle brackets (e.g., <statement>, <expression>)
    if (text.startsWith("<") && text.endsWith(">")) return "cst-non-terminal";

    // Reserved C++ language keywords
    if (["if", "else", "while", "int", "float", "double", "char", "string", "bool", "cout", "cin", "return"].includes(text)) {
      return "cst-keyword";
    }

    // Mathematical, comparison, and stream operators
    if (["+", "-", "*", "/", "%", "=", "==", "!=", "<", ">", "<=", ">=", "++", "--", "<<", ">>"].includes(text)) {
      return "cst-operator";
    }

    // Punctuation and statement delimiters
    if ([";", "(", ")", "{", "}", ","].includes(text)) {
      return "cst-delimiter";
    }

    // Variable or function identifiers
    if (text.startsWith("id(") || /^[a-zA-Z_]\w*$/.test(text)) {
      return "cst-identifier";
    }

    // Numeric constants
    if (text.startsWith("num(") || /^\d+(\.\d+)?$/.test(text)) {
      return "cst-number";
    }

    // Default CST fallback chip style
    return "cst-default";
  } else {
    // AST styling rules (distinguishes statements, conditions, operators, leaves)
    const upper = text.toUpperCase();

    // High-level statement nodes
    if (
      upper.startsWith("IF") ||
      upper.startsWith("WHILE") ||
      upper.startsWith("DECL") ||
      upper.startsWith("ASSIGN") ||
      upper.startsWith("BLOCK") ||
      upper.startsWith("PROGRAM") ||
      upper.startsWith("COUT") ||
      upper.startsWith("CIN") ||
      upper.startsWith("RETURN") ||
      upper.startsWith("FUNCTION") ||
      upper.startsWith("STATEMENT")
    ) {
      return "ast-node-stmt";
    }

    // Conditional evaluation nodes
    if (upper.includes("COND")) return "ast-node-cond";

    // Operator execution nodes
    if (
      upper.includes("ADD") ||
      upper.includes("SUB") ||
      upper.includes("MUL") ||
      upper.includes("DIV") ||
      upper.includes("MOD") ||
      upper.includes("OP") ||
      upper.includes("NEG") ||
      upper.includes("INCR") ||
      ["+", "-", "*", "/", "%", "=", "==", "!=", "<", ">", "<=", ">="].includes(text)
    ) {
      return "ast-node-op";
    }

    // Branch nodes (THEN, ELSE, BODY)
    if (upper.includes("THEN") || upper.includes("ELSE") || upper.includes("BODY") || upper.includes("EXPR")) {
      return "ast-node-branch";
    }

    // Terminal leaf operands (variables and literals)
    if (!node.children || node.children.length === 0) {
      return "ast-node-leaf";
    }

    // Default AST fallback chip style
    return "ast-node-default";
  }
}
