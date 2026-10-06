/**
 * BNFgen - C++ Compiler Syntax & Tree Visualizer
 * Main Client Application Coordinator (Pure Vanilla JavaScript)
 * Handles UI state, event listeners, API interactions, and DOM rendering.
 */

// Import language grammar presets, full BNF rules, and construct list
import { EXAMPLES, FULL_BNF_TEXT, GRAMMAR_FEATURES, countBnfRules } from "./grammar.js";

// Import tree traversal utilities: node counting, depth calculation, leaf counting, ASCII rendering, and styling
import { countNodes, getDepth, countLeaves, treeToAscii, getChipClass } from "./treeUtils.js";

// Import API communication functions to query FastAPI backend health and parse source code
import { checkBackendHealth, apiParse } from "./api.js";

// Central reactive state object holding application variables
const state = {
  code: EXAMPLES[0].code,                       // Current source code string in the editor
  result: null,                                 // Latest JSON parse payload returned by backend
  isValidated: true,                            // Whether current input passed syntax validation
  validationSuccess: true,                      // Boolean flag for showing validation success alert
  error: "",                                    // Current error message string if syntax is invalid
  loading: false,                               // Flag indicating if API network request is in flight
  engineStatus: "C++ FastAPI Engine (Port 8000)", // Text displayed in engine status pills
  activeNav: "input",                           // Current active topbar section ("input", "bnf", etc.)
  activeGrammarTab: "constructs",               // Card 02 layer: "constructs" or "cfg"
  expandedConstructId: "blocks",                // ID of currently expanded accordion item in Card 02
  bnfView: "representation",                    // Active BNF tab: "representation", "derivation", or "relevant"
  cstViewMode: "graph",                         // CST display format: "graph" (chips) or "ascii"
  astViewMode: "graph",                         // AST display format: "graph" (chips) or "ascii"
  cstCollapsedSet: new Set(),                   // Set of CST node paths currently collapsed by user
  astCollapsedSet: new Set()                    // Set of AST node paths currently collapsed by user
};

// ==========================================
// UI RENDERING FUNCTIONS
// ==========================================

/**
 * Renders the horizontal list of clickable preset pill buttons in the editor toolbar.
 */
function renderPresets() {
  const container = document.getElementById("presets-chips");
  if (!container) return;
  container.innerHTML = ""; // Clear existing buttons

  // Iterate over each example preset defined in grammar.js
  EXAMPLES.forEach((example) => {
    const btn = document.createElement("button");
    btn.type = "button";
    // Highlight button if its code matches the editor's current code
    btn.className = `preset-pill ${state.code === example.code ? "preset-active" : ""}`;
    btn.textContent = example.label;

    // Click handler: load the preset code into editor and reset validation state
    btn.addEventListener("click", () => {
      state.code = example.code;
      document.getElementById("source-editor").value = example.code;
      state.isValidated = false;
      state.validationSuccess = false;
      state.error = "";
      updateStatementCount();
      renderAlerts();
      renderPresets();
      updateValidateButton();
    });

    container.appendChild(btn);
  });
}

/**
 * Updates the small counter label showing statement count and deterministic match badge.
 */
function updateStatementCount() {
  const countLabel = document.getElementById("statement-count-label");
  if (!countLabel) return;

  // Split code by semicolons and count non-empty statements
  const count = state.code
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean).length || (state.code.trim() ? 1 : 0);

  // Update label text
  countLabel.textContent = `${count > 1 ? `${count} Statements` : "1 Statement / Expression"} • Deterministic C++ Match`;
}

/**
 * Toggles the appearance of the "Validate Syntax" button and unlocks the "Generate" button.
 */
function updateValidateButton() {
  const vBtn = document.getElementById("validate-btn");
  const gBtn = document.getElementById("generate-btn");
  const vHint = document.getElementById("validation-hint");
  if (!vBtn || !gBtn || !vHint) return;

  if (state.isValidated) {
    // Input is validated: enable generation and show green indicator
    vBtn.classList.add("is-validated");
    vBtn.textContent = "Validated";
    gBtn.disabled = false;
    vHint.className = "validation-hint valid";
    vHint.textContent = "● C++ Syntax Validated";
  } else {
    // Input is not yet validated: disable generation and prompt user to validate
    vBtn.classList.remove("is-validated");
    vBtn.textContent = "Validate Syntax";
    gBtn.disabled = true;
    vHint.className = "validation-hint";
    vHint.textContent = "○ Validate C++ syntax to unlock generation";
  }
}

/**
 * Renders syntax validation success banners or syntax error notifications.
 */
function renderAlerts() {
  const container = document.getElementById("alert-container");
  if (!container) return;
  container.innerHTML = ""; // Clear current banner

  if (state.error) {
    // Render red error banner when syntax error is detected
    container.innerHTML = `
      <div class="neo-alert alert-error" role="alert">
        <span class="alert-tag error">ERROR</span>
        <div class="alert-content">
          <strong>Syntax Error Detected:</strong>
          <p>${escapeHtml(state.error)}</p>
        </div>
      </div>
    `;
  } else if (state.validationSuccess && state.isValidated) {
    // Render green success banner when syntax conforms to LL(1) grammar
    container.innerHTML = `
      <div class="neo-alert alert-success" role="status">
        <span class="alert-tag valid">VALID</span>
        <div class="alert-content">
          <strong>C++ Grammar Validation Passed:</strong> Statement conforms deterministically to C++ LL(1) formal specifications. Ready to generate.
        </div>
      </div>
    `;
  }
}

/**
 * Renders the 8 core C++ language construct accordion list in Card 02.
 */
function renderFeaturesList() {
  const list = document.getElementById("features-list");
  if (!list) return;
  list.innerHTML = ""; // Clear existing items

  // Loop through all 8 grammar feature definitions
  GRAMMAR_FEATURES.forEach((feat) => {
    const isExpanded = state.expandedConstructId === feat.id;
    const article = document.createElement("article");
    article.className = `feature-accordion-item ${isExpanded ? "is-expanded" : ""}`;

    article.innerHTML = `
      <button type="button" class="feature-accordion-header" aria-expanded="${isExpanded}">
        <span class="accordion-title-group">
          <span class="accordion-icon">${isExpanded ? "▼" : "▶"}</span>
          <h3 class="feature-side-name">${escapeHtml(feat.title)}</h3>
        </span>
        <span class="badge soft-pill">${escapeHtml(feat.badge)}</span>
      </button>
      ${
        isExpanded
          ? `<div class="feature-accordion-content">
              <p class="feature-side-desc">${escapeHtml(feat.desc)}</p>
              <pre class="feature-side-cfg">${escapeHtml(feat.cfg)}</pre>
            </div>`
          : ""
      }
    `;

    // Toggle expansion on click
    const headerBtn = article.querySelector(".feature-accordion-header");
    headerBtn.addEventListener("click", () => {
      state.expandedConstructId = isExpanded ? null : feat.id;
      renderFeaturesList();
    });

    list.appendChild(article);
  });
}

/**
 * Renders Card 03 Backus-Naur Form (BNF) display based on active tab view.
 */
function renderBnf() {
  const display = document.getElementById("bnf-display");
  const subbarLabel = document.getElementById("bnf-subbar-label");
  const badgeLabel = document.getElementById("bnf-badge-label");
  const footerMeta = document.getElementById("bnf-footer-meta");
  if (!display) return;

  let text = "<statement> ::= <empty>";
  const r = state.result;

  // Select appropriate BNF text based on the active tab
  if (r) {
    if (state.bnfView === "representation") {
      // Tab 1: Clean input statement representation (Handout Format)
      text = r.bnf_clean || r.bnfClean || r.bnf_representation || "";
    } else if (state.bnfView === "ppt") {
      // Tab 2: Academic PPT format matching Module 3 Slide 16
      text = r.bnf_ppt || r.bnfPpt || "";
    } else if (state.bnfView === "derivation") {
      // Tab 3: Formal step-by-step leftmost derivation (S =>* w)
      text = r.bnf_derivation || r.bnfDerivation || "";
    } else {
      // Tab 4: List of applied grammar production rules
      text = r.bnf_relevant || r.bnfRelevant || "";
    }
  }

  display.textContent = text;

  // Update card subbar and footer metadata descriptions
  if (state.bnfView === "representation") {
    subbarLabel.textContent = "PROJECT HANDOUT BNF FORMAT (OFFICIAL RUBRIC)";
    badgeLabel.textContent = "Handout Format Active";
    footerMeta.textContent = "Exact Project Instructions Output Format • Validated";
  } else if (state.bnfView === "ppt") {
    subbarLabel.textContent = "LECTURE PPT BNF FORMAT (MODULE 3 SLIDE 16)";
    badgeLabel.textContent = "Slide 16 Format Active";
    footerMeta.textContent = "Academic CFG with <program> & Terminals • Validated";
  } else if (state.bnfView === "derivation") {
    subbarLabel.textContent = "CANONICAL LEFTMOST DERIVATION (S ⇒* INPUT)";
    badgeLabel.textContent = "Step-by-Step Derivation Active";
    footerMeta.textContent = "Formal Leftmost Sentential Form Derivation • Validated";
  } else {
    subbarLabel.textContent = "APPLIED PRODUCTION RULES";
    const count = r ? (r.bnf_rules_count || countBnfRules(r.bnf_relevant)) : 0;
    badgeLabel.textContent = `${count} Rules Active`;
    footerMeta.textContent = "Deterministic LL(1) Non-ambiguous Productions";
  }

  // Update active visual tab indicator button
  document.querySelectorAll("[data-bnf]").forEach((btn) => {
    btn.classList.toggle("tab-active", btn.getAttribute("data-bnf") === state.bnfView);
  });
}

/**
 * Creates an interactive DOM list item (<li>) for a tree node with collapse/expand toggles.
 * @param {Object} node - Current syntax tree node object.
 * @param {string} mode - "cst" or "ast".
 * @param {string} path - Unique string path key to track collapsed state.
 * @param {Set} collapsedSet - Set containing collapsed path keys.
 * @returns {HTMLElement} - Constructed <li> element.
 */
function createTreeElement(node, mode, path = "0", collapsedSet) {
  if (!node) return null;
  const li = document.createElement("li");
  li.className = "tree-branch-item";

  const children = Array.isArray(node.children) ? node.children : [];
  const hasChildren = children.length > 0;
  const isCollapsed = collapsedSet.has(path);
  const label = node.label || node.type || node.value || (typeof node === "string" ? node : "");

  // Create horizontal row container for node badge and collapse toggle
  const row = document.createElement("div");
  row.className = "tree-node-row";

  // If node has children, create a collapse/expand toggle button (+ / −)
  if (hasChildren) {
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "collapse-toggle";
    toggleBtn.textContent = isCollapsed ? "+" : "−";
    toggleBtn.title = isCollapsed ? "Expand node" : "Collapse node";
    toggleBtn.addEventListener("click", () => {
      if (collapsedSet.has(path)) {
        collapsedSet.delete(path); // Expand
      } else {
        collapsedSet.add(path);    // Collapse
      }
      if (mode === "cst") renderCstGraph();
      else renderAstGraph();
    });
    row.appendChild(toggleBtn);
  }

  // Create styled chip badge showing the node's text label
  const chip = document.createElement("span");
  chip.className = `tree-chip ${getChipClass(node, mode)}`;
  chip.textContent = label;
  row.appendChild(chip);

  // If node is collapsed, display indicator with hidden child count
  if (isCollapsed && hasChildren) {
    const ind = document.createElement("span");
    ind.className = "collapsed-indicator";
    ind.textContent = `(${children.length} hidden)`;
    row.appendChild(ind);
  }

  li.appendChild(row);

  // If node is expanded, recursively render child list
  if (!isCollapsed && hasChildren) {
    const ul = document.createElement("ul");
    ul.className = "tree-branch-list";
    children.forEach((child, idx) => {
      const childEl = createTreeElement(child, mode, `${path}-${idx}`, collapsedSet);
      if (childEl) ul.appendChild(childEl);
    });
    li.appendChild(ul);
  }

  return li;
}

/**
 * Renders Card 04: Concrete Parse Tree (CST) metrics, chips, and ASCII tree.
 */
function renderCst() {
  const r = state.result;
  const parseTree = r?.parse_tree || r?.parseTree;
  const cstNodesBadge = document.getElementById("cst-nodes-badge");
  const cstSubbarMeta = document.getElementById("cst-subbar-meta");
  const cstTerminalsFooter = document.getElementById("cst-terminals-footer");
  const cstDepthFooter = document.getElementById("cst-depth-footer");

  // Calculate tree metrics
  const nodes = r ? countNodes(parseTree) : 0;
  const depth = r ? getDepth(parseTree) : 0;
  const leaves = r ? countLeaves(parseTree) : 0;

  // Update card badge and footer metrics labels
  if (cstNodesBadge) cstNodesBadge.textContent = r ? `${nodes} Tree Nodes` : "Waiting for input";
  if (cstSubbarMeta) cstSubbarMeta.innerHTML = `Concrete Terminals: <strong>${leaves}</strong> Included • Depth: <strong>${depth}</strong> Levels`;
  if (cstTerminalsFooter) cstTerminalsFooter.textContent = `Concrete Terminals: ${leaves} Included`;
  if (cstDepthFooter) cstDepthFooter.textContent = `Max Derivation Depth: ${depth} Levels`;

  renderCstGraph();
}

/**
 * Builds the interactive CST derivation chips and plain ASCII tree block.
 */
function renderCstGraph() {
  const root = document.getElementById("cst-graph-root");
  const asciiBlock = document.getElementById("cst-ascii-block");
  const parseTree = state.result?.parse_tree || state.result?.parseTree;

  if (!root || !asciiBlock) return;
  root.innerHTML = "";

  if (parseTree) {
    // Generate interactive chip hierarchy
    const el = createTreeElement(parseTree, "cst", "cst-0", state.cstCollapsedSet);
    if (el) root.appendChild(el);
    // Generate visual ASCII tree representation with connecting branch lines
    asciiBlock.textContent = treeToAscii(parseTree);
  } else {
    // Show empty placeholder message
    root.innerHTML = `<li class="empty-state"><p>The concrete parse tree showing all non-terminals, operators, and terminals will appear here.</p></li>`;
    asciiBlock.textContent = "No tree data available.";
  }
}

/**
 * Renders Card 05: Abstract Syntax Tree (AST) metrics, chips, and ASCII tree.
 */
function renderAst() {
  const r = state.result;
  const ast = r?.ast;
  const astSubbarMeta = document.getElementById("ast-subbar-meta");
  const nodes = r ? countNodes(ast) : 0;

  if (astSubbarMeta) astSubbarMeta.innerHTML = `Operators & Operands: <strong>${nodes}</strong> Clean AST Nodes`;
  renderAstGraph();
}

/**
 * Builds the interactive AST derivation chips and plain ASCII tree block.
 */
function renderAstGraph() {
  const root = document.getElementById("ast-graph-root");
  const asciiBlock = document.getElementById("ast-ascii-block");
  const ast = state.result?.ast;

  if (!root || !asciiBlock) return;
  root.innerHTML = "";

  if (ast) {
    // Generate interactive chip hierarchy
    const el = createTreeElement(ast, "ast", "ast-0", state.astCollapsedSet);
    if (el) root.appendChild(el);
    // Generate visual ASCII tree representation with connecting branch lines
    asciiBlock.textContent = treeToAscii(ast);
  } else {
    // Show empty placeholder message
    root.innerHTML = `<li class="empty-state"><p>The abstract syntax tree containing simplified semantic structure will appear here.</p></li>`;
    asciiBlock.textContent = "No tree data available.";
  }
}

// ==========================================
// ACTION & EVENT HANDLERS
// ==========================================

/**
 * Validates the current editor code against backend grammar without generating full trees.
 */
async function handleValidate() {
  const code = state.code.trim();
  if (!code) {
    state.error = "Input is empty. Please enter a programming statement to validate.";
    state.validationSuccess = false;
    state.isValidated = false;
    renderAlerts();
    updateValidateButton();
    return;
  }

  try {
    // Ping parse API to check syntax validity
    await apiParse(code);
    state.error = "";
    state.validationSuccess = true;
    state.isValidated = true;
  } catch (err) {
    state.error = err.message || "Syntax validation failed.";
    state.validationSuccess = false;
    state.isValidated = false;
  }

  renderAlerts();
  updateValidateButton();
}

/**
 * Primary parse execution: sends code to backend and renders all resulting cards.
 * @param {string} sourceToParse - Optional source code override.
 * @param {boolean} shouldScroll - Whether to scroll down to Card 03 upon completion.
 */
async function executeParse(sourceToParse, shouldScroll = true) {
  const code = (sourceToParse !== undefined ? sourceToParse : state.code).trim();
  if (!code) {
    state.error = "Please enter at least one programming statement before generating results.";
    state.result = null;
    state.validationSuccess = false;
    state.isValidated = false;
    renderAlerts();
    updateValidateButton();
    return;
  }

  state.loading = true;
  state.error = "";
  setLoadingState(true);

  try {
    // Request full parse payload from FastAPI backend
    const data = await apiParse(code);
    state.result = data;
    state.validationSuccess = true;
    state.isValidated = true;
    state.cstCollapsedSet.clear(); // Reset collapsed nodes
    state.astCollapsedSet.clear();

    // Re-render result cards with synthesized data
    renderBnf();
    renderCst();
    renderAst();
    renderAlerts();
    updateValidateButton();

    // Smooth scroll down to Card 03 (BNF)
    if (shouldScroll) {
      setTimeout(() => {
        const bnfSec = document.getElementById("bnf-section");
        if (bnfSec) bnfSec.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  } catch (err) {
    state.error = err.message || "Parsing error encountered.";
    state.result = null;
    state.validationSuccess = false;
    state.isValidated = false;
    renderAlerts();
    updateValidateButton();
  } finally {
    state.loading = false;
    setLoadingState(false);
  }
}

/**
 * Updates UI buttons and badges during asynchronous tree generation.
 * @param {boolean} isLoading - Loading state flag.
 */
function setLoadingState(isLoading) {
  const statusPill = document.getElementById("engine-status-pill");
  const statusLabel = document.getElementById("engine-status-label");
  const genBtnText = document.getElementById("generate-btn-text");

  if (isLoading) {
    statusPill?.classList.add("is-loading");
    if (statusLabel) statusLabel.textContent = "Synthesizing Trees…";
    if (genBtnText) genBtnText.textContent = "Generating Trees…";
  } else {
    statusPill?.classList.remove("is-loading");
    if (statusLabel) statusLabel.textContent = state.engineStatus;
    if (genBtnText) genBtnText.textContent = "Generate BNF, CST & AST →";
  }
}

/**
 * Resets the editor and clears all synthesized tree and BNF cards.
 */
function clearInput() {
  state.code = "";
  state.result = null;
  state.isValidated = false;
  state.validationSuccess = false;
  state.error = "";
  document.getElementById("source-editor").value = "";
  updateStatementCount();
  renderAlerts();
  updateValidateButton();
  renderPresets();
  renderBnf();
  renderCst();
  renderAst();
}

/**
 * Copies a string to clipboard and temporarily updates button text to confirm.
 * @param {string} text - Content to copy.
 * @param {HTMLElement} btnElement - Button triggering the copy.
 * @param {string} successMsg - Confirmation label (defaults to "Copied").
 */
function copyToClipboard(text, btnElement, successMsg = "Copied") {
  if (!navigator.clipboard) return;
  const original = btnElement.textContent;
  navigator.clipboard.writeText(text).then(() => {
    btnElement.textContent = successMsg;
    setTimeout(() => {
      btnElement.textContent = original;
    }, 2000);
  });
}

/**
 * Escapes HTML characters to prevent XSS injection when rendering user strings.
 * @param {string} str - Raw string.
 * @returns {string} - Escaped HTML string.
 */
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

/**
 * Attaches event listeners and triggers initial layout rendering once DOM is ready.
 */
function init() {
  const editor = document.getElementById("source-editor");
  editor.value = state.code;
  updateStatementCount();

  // Listen for user keystrokes in the source code textarea
  editor.addEventListener("input", (e) => {
    state.code = e.target.value;
    state.isValidated = false;
    state.validationSuccess = false;
    state.error = "";
    updateStatementCount();
    renderAlerts();
    updateValidateButton();
    renderPresets();
  });

  // Action buttons: Clear, Validate, and Generate
  document.getElementById("clear-btn")?.addEventListener("click", clearInput);
  document.getElementById("validate-btn")?.addEventListener("click", handleValidate);
  document.getElementById("generate-btn")?.addEventListener("click", () => executeParse());

  // Quick preset scroll buttons (left and right chevron controls)
  const presetsChips = document.getElementById("presets-chips");
  document.getElementById("preset-scroll-left")?.addEventListener("click", () => {
    presetsChips?.scrollBy({ left: -220, behavior: "smooth" });
  });
  document.getElementById("preset-scroll-right")?.addEventListener("click", () => {
    presetsChips?.scrollBy({ left: 220, behavior: "smooth" });
  });

  // Layer Accordion toggles (Card 02: Language Constructs vs Complete CFG)
  const btnLayerConstructs = document.getElementById("btn-layer-constructs");
  const btnLayerCfg = document.getElementById("btn-layer-cfg");
  const featuresList = document.getElementById("features-list");
  const cfgCodeBox = document.getElementById("cfg-code-box");
  const fullCfgDisplay = document.getElementById("full-cfg-display");
  const constructsArrow = document.getElementById("constructs-arrow");
  const cfgArrow = document.getElementById("cfg-arrow");

  // Load complete BNF grammar text into the CFG box
  fullCfgDisplay.textContent = FULL_BNF_TEXT;

  btnLayerConstructs?.addEventListener("click", () => {
    state.activeGrammarTab = "constructs";
    btnLayerConstructs.classList.add("is-active");
    btnLayerCfg.classList.remove("is-active");
    featuresList.style.display = "block";
    cfgCodeBox.style.display = "none";
    constructsArrow.textContent = "▼";
    cfgArrow.textContent = "▶";
  });

  btnLayerCfg?.addEventListener("click", () => {
    state.activeGrammarTab = "cfg";
    btnLayerCfg.classList.add("is-active");
    btnLayerConstructs.classList.remove("is-active");
    featuresList.style.display = "none";
    cfgCodeBox.style.display = "block";
    constructsArrow.textContent = "▶";
    cfgArrow.textContent = "▼";
  });

  // Copy Full CFG button
  document.getElementById("copy-cfg-btn")?.addEventListener("click", (e) => {
    copyToClipboard(FULL_BNF_TEXT, e.target);
  });

  // Card 03: BNF Segmented Tabs and Copy Button
  document.querySelectorAll("[data-bnf]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.bnfView = btn.getAttribute("data-bnf");
      renderBnf();
    });
  });

  document.getElementById("copy-bnf-btn")?.addEventListener("click", (e) => {
    const text = document.getElementById("bnf-display")?.textContent || "";
    copyToClipboard(text, e.target);
  });

  // Card 04: CST View Mode Toggles (Derivation Chips vs ASCII Tree) and Copy Button
  const cstToggleGraph = document.getElementById("cst-toggle-graph");
  const cstToggleAscii = document.getElementById("cst-toggle-ascii");
  const cstGraphContainer = document.getElementById("cst-graph-container");
  const cstAsciiBlock = document.getElementById("cst-ascii-block");

  cstToggleGraph?.addEventListener("click", () => {
    cstToggleGraph.classList.add("active");
    cstToggleAscii.classList.remove("active");
    cstGraphContainer.style.display = "block";
    cstAsciiBlock.style.display = "none";
  });

  cstToggleAscii?.addEventListener("click", () => {
    cstToggleAscii.classList.add("active");
    cstToggleGraph.classList.remove("active");
    cstGraphContainer.style.display = "none";
    cstAsciiBlock.style.display = "block";
  });

  document.getElementById("copy-cst-ascii-btn")?.addEventListener("click", (e) => {
    const text = cstAsciiBlock?.textContent || "";
    copyToClipboard(text, e.target);
  });

  // Card 05: AST View Mode Toggles (Derivation Chips vs ASCII Tree) and Copy Button
  const astToggleGraph = document.getElementById("ast-toggle-graph");
  const astToggleAscii = document.getElementById("ast-toggle-ascii");
  const astGraphContainer = document.getElementById("ast-graph-container");
  const astAsciiBlock = document.getElementById("ast-ascii-block");

  astToggleGraph?.addEventListener("click", () => {
    astToggleGraph.classList.add("active");
    astToggleAscii.classList.remove("active");
    astGraphContainer.style.display = "block";
    astAsciiBlock.style.display = "none";
  });

  astToggleAscii?.addEventListener("click", () => {
    astToggleAscii.classList.add("active");
    astToggleGraph.classList.remove("active");
    astGraphContainer.style.display = "none";
    astAsciiBlock.style.display = "block";
  });

  document.getElementById("copy-ast-ascii-btn")?.addEventListener("click", (e) => {
    const text = astAsciiBlock?.textContent || "";
    copyToClipboard(text, e.target);
  });

  // Topbar Navigation Pill smooth scrolling
  document.querySelectorAll(".nav-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetId = pill.getAttribute("data-target");
      const targetEl = document.getElementById(`${targetId}-section`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Scroll spy to highlight the corresponding navigation pill while scrolling
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 200;
    const sections = ["input", "features", "bnf", "cst", "ast"];
    let current = "input";
    for (const sec of sections) {
      const el = document.getElementById(`${sec}-section`);
      if (el && scrollPos >= el.offsetTop) {
        current = sec;
      }
    }
    document.querySelectorAll(".nav-pill").forEach((pill) => {
      pill.classList.toggle("active", pill.getAttribute("data-target") === current);
    });
  }, { passive: true });

  // Render initial components
  renderPresets();
  renderFeaturesList();
  renderBnf();
  renderCst();
  renderAst();
  renderAlerts();
  updateValidateButton();

  // Check backend health and parse default preset on startup
  checkBackendHealth().then((isHealthy) => {
    const status = isHealthy ? "C++ FastAPI Engine (Port 8000)" : "C++ Backend Offline";
    state.engineStatus = status;
    const label = document.getElementById("engine-status-label");
    const footerStatus = document.getElementById("footer-engine-status");
    if (label) label.textContent = status;
    if (footerStatus) footerStatus.textContent = `${status} • LL(1) CST & AST Synthesis`;
    executeParse(EXAMPLES[0].code, false);
  });
}

// Kick off initialization once DOM content has loaded
document.addEventListener("DOMContentLoaded", init);
