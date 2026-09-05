import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "./components/Header.jsx";
import InputConsole from "./components/InputConsole.jsx";
import BnfCard from "./components/BnfCard.jsx";
import CstCard from "./components/CstCard.jsx";
import AstCard from "./components/AstCard.jsx";
import Footer from "./components/Footer.jsx";

import { EXAMPLES } from "./compiler/grammar.js";
import { checkBackendHealth, parseCode, validateCode, ParseError } from "./compiler/parser.js";
import "./index.css";

export default function App() {
  const [code, setCode] = useState(EXAMPLES[0].code);
  const [result, setResult] = useState(null);
  const [isValidated, setIsValidated] = useState(true);
  const [validationSuccess, setValidationSuccess] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [engineStatus, setEngineStatus] = useState("Python 3 FastAPI (Port 8000)");
  const [activeNav, setActiveNav] = useState("input");

  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Check Python backend connectivity on mount
  useEffect(() => {
    async function verifyBackend() {
      const isHealthy = await checkBackendHealth();
      setEngineStatus(isHealthy ? "Python FastAPI (Port 8000)" : "Python Backend Offline");
    }
    verifyBackend();
  }, []);

  // Scroll spy to update navigation pill indicators
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const bnfEl = document.getElementById("bnf-section");
      const cstEl = document.getElementById("cst-section");
      const astEl = document.getElementById("ast-section");

      if (astEl && scrollPos >= astEl.offsetTop) {
        setActiveNav("ast");
      } else if (cstEl && scrollPos >= cstEl.offsetTop) {
        setActiveNav("cst");
      } else if (bnfEl && scrollPos >= bnfEl.offsetTop) {
        setActiveNav("bnf");
      } else {
        setActiveNav("input");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update code from presets or user typing
  function handleCodeChange(newCode) {
    setCode(newCode);
    setIsValidated(false);
    setValidationSuccess(false);
    setError("");
  }

  // Validate syntax handler
  async function handleValidate() {
    if (!code || !code.trim()) {
      setError("Input is empty. Please enter a programming statement to validate.");
      setValidationSuccess(false);
      setIsValidated(false);
      return;
    }

    try {
      await validateCode(code);
      setError("");
      setValidationSuccess(true);
      setIsValidated(true);
    } catch (err) {
      setError(err instanceof ParseError ? err.message : "Syntax validation failed.");
      setValidationSuccess(false);
      setIsValidated(false);
    }
  }

  // Parse and synthesize trees handler
  const executeParse = useCallback(
    async (sourceToParse, shouldScroll = true) => {
      const src = sourceToParse !== undefined ? sourceToParse : codeRef.current;
      if (!src || !src.trim()) {
        setError("Please enter at least one programming statement before generating results.");
        setResult(null);
        setValidationSuccess(false);
        setIsValidated(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await parseCode(src);
        setResult(data);
        setEngineStatus("Python FastAPI (Port 8000)");
        setValidationSuccess(true);
        setIsValidated(true);

        if (shouldScroll) {
          setTimeout(() => {
            const firstResult = document.getElementById("bnf-section");
            if (firstResult) {
              firstResult.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 100);
        }
      } catch (err) {
        const msg = err instanceof ParseError ? err.message : "Parsing error encountered.";
        setError(msg);
        setResult(null);
        setValidationSuccess(false);
        setIsValidated(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial parse on mount only
  useEffect(() => {
    executeParse(EXAMPLES[0].code, false);
  }, [executeParse]);

  function clearInput() {
    setCode("");
    setResult(null);
    setIsValidated(false);
    setValidationSuccess(false);
    setError("");
  }

  function scrollToSection(id) {
    setActiveNav(id);
    const element = document.getElementById(`${id}-section`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="page-wrapper">
      <main className="app-shell">
        {/* Header Navigation */}
        <Header
          activeNav={activeNav}
          scrollToSection={scrollToSection}
          loading={loading}
          engineStatus={engineStatus}
        />

        {/* Section 01 & 02: Source Code Input & Grammar Features Console */}
        <InputConsole
          code={code}
          onChangeCode={handleCodeChange}
          engineStatus={engineStatus}
          isValidated={isValidated}
          validationSuccess={validationSuccess}
          error={error}
          loading={loading}
          onValidate={handleValidate}
          onExecuteParse={() => executeParse()}
          onClear={clearInput}
        />

        {/* Stacked Results Sections: Section 03 (BNF), Section 04 (CST), Section 05 (AST) */}
        <div className="results-stacked-container" aria-label="Parser and Grammar Results">
          <BnfCard result={result} />
          <CstCard result={result} />
          <AstCard result={result} />
        </div>

        {/* Application Footer */}
        <Footer engineStatus={engineStatus} />
      </main>
    </div>
  );
}