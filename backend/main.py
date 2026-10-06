# FastAPI Backend Server for Compiler Syntax and Tree Visualizer
# This server receives source code from the frontend, parses it using our custom LL(1) parser,
# and returns Backus-Naur Form (BNF) derivations along with CST and AST syntax trees.

# Import FastAPI framework classes and HTTP exception handling
from fastapi import FastAPI, HTTPException

# Import CORS middleware so the frontend can communicate with the backend without browser security blocks
from fastapi.middleware.cors import CORSMiddleware

# Import BaseModel from Pydantic to validate the structure of incoming JSON requests
from pydantic import BaseModel

# Import our custom parsing logic and error class from parser.py
from parser import parse_code, ParseError

# Import operating system utilities to resolve folder paths
import os

# Import StaticFiles from FastAPI to serve HTML, CSS, and JavaScript files directly
from fastapi.staticfiles import StaticFiles

# Initialize the FastAPI application with custom metadata for interactive API docs (/docs)
app = FastAPI(
    title="BNFgen Compiler API",
    description="Formal language parsing, BNF generation, CST and AST synthesizer",
    version="1.0.0"
)

# Configure Cross-Origin Resource Sharing (CORS)
# This allows web browsers running on any local port or domain to call this API safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow requests from all origins
    allow_credentials=True,     # Allow cookies and credentials if needed
    allow_methods=["*"],        # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],        # Allow all request headers
)

# Define the expected JSON payload for parsing requests
class ParseRequest(BaseModel):
    code: str  # The input string containing C++ statements to parse

# Health check endpoint (GET /health)
# Used by the frontend or external tools to verify that the Python engine is up and running
@app.get("/health")
def health_check():
    # Return a status message indicating the server is healthy
    return {
        "status": "healthy",
        "engine": "Python 3 FastAPI Compiler Engine",
        "version": "1.0.0"
    }

# Main parsing endpoint (POST /parse)
# Receives C++ code, analyzes tokens, and produces BNF rules and syntax trees
@app.post("/parse")
def parse_endpoint(req: ParseRequest):
    # Check if the user submitted empty text or whitespace only
    if not req.code or not req.code.strip():
        # Raise an HTTP 400 Bad Request error if input is empty
        raise HTTPException(
            status_code=400,
            detail="Source code input is empty. Please provide one or more statements."
        )

    # Attempt to parse the code using our recursive-descent compiler engine
    try:
        # Run lexical analysis and LL(1) parsing on the provided source code
        result = parse_code(req.code)
        # Return the parsed data (CST, AST, BNF derivations, metrics)
        return result
    except ParseError as pe:
        # Catch syntax errors detected during parsing and return clean line/column info
        return {
            "valid": False,
            "error": pe.message,
            "line": pe.line,
            "col": pe.col
        }
    except Exception as e:
        # Catch any unexpected runtime errors and return the error message
        return {
            "valid": False,
            "error": str(e)
        }

# Locate the frontend directory (HTML, CSS, JS) relative to this file
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

# If the frontend directory exists, mount it to serve static files at the root URL ("/")
if os.path.isdir(frontend_dir):
    # html=True automatically serves index.html when visiting the root path http://127.0.0.1:8000/
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

# Run the Uvicorn web server when this script is executed directly (e.g., python backend/main.py)
if __name__ == "__main__":
    import uvicorn
    # Start the server on host 127.0.0.1 and port 8000 with auto-reload enabled for development
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)