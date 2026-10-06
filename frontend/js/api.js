/**
 * API connector module for communicating with the Python FastAPI Backend.
 * This file handles network requests to verify engine status and parse C++ code.
 */

// Determine the base API URL dynamically:
// If the app is already loaded from port 8000, use relative paths ("")
// Otherwise (e.g., loaded directly as file or other port), target http://127.0.0.1:8000
const API_BASE = window.location.protocol.startsWith("http") && window.location.port === "8000"
  ? ""
  : "http://127.0.0.1:8000";

/**
 * Checks if the Python FastAPI backend server is alive and responding.
 * Returns true if server responds with status "healthy", otherwise false.
 */
export async function checkBackendHealth() {
  try {
    // Send a GET request to the /health endpoint with a 3-second timeout
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined
    });

    // If HTTP status is not 200 OK, return false
    if (!res.ok) return false;

    // Parse the JSON response payload
    const data = await res.json();

    // Check if the health status equals "healthy"
    return data.status === "healthy";
  } catch {
    // Return false if network fails or server is offline
    return false;
  }
}

/**
 * Sends C++ source code to the backend parser via HTTP POST.
 * Receives parse trees (CST, AST), BNF derivations, and compiler metrics.
 */
export async function apiParse(code) {
  // Make a POST request to the /parse endpoint with JSON body
  const res = await fetch(`${API_BASE}/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }) // Wrap the code string in a JSON object { "code": "..." }
  });

  // If the server responded with an HTTP error code (e.g., 400 or 500)
  if (!res.ok) {
    // Extract error details from JSON if possible
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `HTTP error ${res.status}`);
  }

  // Parse JSON response data
  const data = await res.json();

  // If the parser reported a syntax error in the payload
  if (data.valid === false || data.error) {
    throw new Error(data.error || "Syntax error detected.");
  }

  // Return the verified parse result object
  return data;
}
