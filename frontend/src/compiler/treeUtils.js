// Tree calculation and manipulation utilities for CST and AST graphs

/**
 * Counts the total number of nodes in a syntax tree recursively.
 */
export function countNodes(node) {
  if (!node || typeof node !== "object") return 0;
  const children = Array.isArray(node.children) ? node.children : [];
  return 1 + children.reduce((acc, c) => acc + countNodes(c), 0);
}

/**
 * Computes the maximum depth of a syntax tree.
 */
export function getDepth(node) {
  if (!node || typeof node !== "object") return 0;
  const children = Array.isArray(node.children) ? node.children : [];
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map(getDepth));
}

/**
 * Counts the total number of leaf nodes (terminals with no children).
 */
export function countLeaves(node) {
  if (!node || typeof node !== "object") return 0;
  const children = Array.isArray(node.children) ? node.children : [];
  if (children.length === 0) return 1;
  return children.reduce((acc, c) => acc + countLeaves(c), 0);
}

/**
 * Converts a tree object into a human-readable ASCII tree hierarchy.
 */
export function treeToAscii(node, prefix = "", isLast = true) {
  if (!node || typeof node !== "object") return "";

  const label =
    node.label ||
    node.type ||
    node.value ||
    (typeof node === "string" ? node : "node");

  const connector = prefix ? (isLast ? "└── " : "├── ") : "";
  let result = prefix + connector + label + "\n";

  const children = Array.isArray(node.children) ? node.children : [];
  const childPrefix = prefix + (prefix ? (isLast ? "    " : "│   ") : "");

  children.forEach((child, index) => {
    result += treeToAscii(child, childPrefix, index === children.length - 1);
  });

  return result;
}
