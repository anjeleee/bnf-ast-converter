// API Client connecting frontend to FastAPI Python Compiler Engine

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.port === "5173"
    ? "http://127.0.0.1:8000"
    : "");

export class ParseError extends Error {
  constructor(message, line = 1, col = 1) {
    super(message);
    this.name = "ParseError";
    this.line = line;
    this.col = col;
  }
}

/**
 * Checks connectivity with the backend compiler engine.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "healthy";
  } catch {
    return false;
  }
}

/**
 * Validates the syntax of the input code without state updates.
 */
export async function validateCode(code) {
  if (!code || !code.trim()) {
    throw new ParseError("Input is empty. Please enter a programming statement to validate.");
  }

  let res;
  try {
    res = await fetch(`${API_BASE}/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
  } catch (err) {
    throw new ParseError(`Failed to connect to compiler backend: ${err.message}`);
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new ParseError(errData.detail || errData.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.valid === false || data.error) {
    throw new ParseError(data.error || "Syntax validation failed.", data.line, data.col);
  }

  return true;
}

/**
 * Parses source code and returns CST, AST, and BNF derivations from the backend.
 */
export async function parseCode(code) {
  if (!code || !code.trim()) {
    throw new ParseError("Please enter at least one programming statement before generating results.");
  }

  let res;
  try {
    res = await fetch(`${API_BASE}/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
  } catch (err) {
    throw new ParseError(`Failed to connect to compiler backend: ${err.message}`);
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new ParseError(errData.detail || errData.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.valid === false || data.error) {
    throw new ParseError(data.error || "Parsing error encountered.", data.line, data.col);
  }

  return data;
}

