# FastAPI Backend Server for Compiler Syntax & Tree Visualizer

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from parser import parse_code, ParseError

app = FastAPI(
    title="BNFgen Compiler API",
    description="Formal language parsing, BNF generation, CST and AST synthesizer",
    version="1.0.0"
)

# Enable CORS for frontend Vite development server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ParseRequest(BaseModel):
    code: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "Python 3 FastAPI Compiler Engine",
        "version": "1.0.0"
    }

@app.post("/parse")
def parse_endpoint(req: ParseRequest):
    if not req.code or not req.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Source code input is empty. Please provide one or more statements."
        )

    try:
        result = parse_code(req.code)
        return result
    except ParseError as pe:
        return {
            "valid": False,
            "error": pe.message,
            "line": pe.line,
            "col": pe.col
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }

# Mount pre-built frontend distribution if available
import os
from fastapi.staticfiles import StaticFiles

dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.isdir(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)