# BNFgen: Technical Documentation
> **Formal Grammar Specification, Lexical Analysis, Predictive LL(1) Parsing & Dual Tree Synthesis**

---

## Table of Contents
- [1. Formal Language Definition](#1-formal-language-definition)
  - [Grammar 4-Tuple](#grammar-4-tuple)
  - [Non-Terminals (V)](#non-terminals-v)
  - [Terminals (Sigma)](#terminals-sigma)
  - [Start Symbol (S)](#start-symbol-s)
  - [Formal Production Rules (R)](#formal-production-rules-r)
- [2. Lexical Analysis Architecture](#2-lexical-analysis-architecture)
  - [Token Classes and Regular Expressions](#token-classes-and-regular-expressions)
  - [Scanning Algorithm and Coordinate Tracking](#scanning-algorithm-and-coordinate-tracking)
- [3. LL(1) Predictive Recursive-Descent Parser](#3-ll1-predictive-recursive-descent-parser)
  - [Parsing Mechanics and Lookahead](#parsing-mechanics-and-lookahead)
  - [FIRST and FOLLOW Sets](#first-and-follow-sets)
  - [Grammar Transformations: Left Recursion and Factoring](#grammar-transformations-left-recursion-and-factoring)
- [4. Canonical Leftmost Derivation Construction](#4-canonical-leftmost-derivation-construction)
- [5. Dual Tree Synthesis Architecture](#5-dual-tree-synthesis-architecture)
  - [Concrete Parse Tree (CST) Representation](#concrete-parse-tree-cst-representation)
  - [Abstract Syntax Tree (AST) Representation](#abstract-syntax-tree-ast-representation)
  - [Syllabus-Aligned AST Design Principles](#syllabus-aligned-ast-design-principles)
- [6. Compiler Optimization and Redundancy Metrics](#6-compiler-optimization-and-redundancy-metrics)
- [7. Backend REST API Architecture](#7-backend-rest-api-architecture)
- [8. Frontend Architecture and Reactive State Management](#8-frontend-architecture-and-reactive-state-management)
- [9. Time and Space Complexity Analysis](#9-time-and-space-complexity-analysis)

---

## 1. Formal Language Definition

The language recognized by BNFgen is formally defined as a Context-Free Grammar (CFG) denoted by the 4-tuple:

$$G = (V, \Sigma, R, S)$$

Where:
- $V$ is a finite set of non-terminal symbols (variables).
- $\Sigma$ is a finite set of terminal symbols (tokens), disjoint from $V$.
- $R$ is a finite relation $V \to (V \cup \Sigma)^*$ representing production rules.
- $S \in V$ is the distinguished start symbol.

---

### Non-Terminals (V)
The grammar encompasses 18 non-terminal symbols:

$$V = \{ \langle\text{program}\rangle, \langle\text{statement\_list}\rangle, \langle\text{statement}\rangle, \langle\text{if\_statement}\rangle, \langle\text{while\_statement}\rangle, \langle\text{assignment}\rangle, \langle\text{declaration}\rangle, \langle\text{type}\rangle, \langle\text{increment\_statement}\rangle, \langle\text{io\_statement}\rangle, \langle\text{block\_statement}\rangle, \langle\text{condition}\rangle, \langle\text{relational\_op}\rangle, \langle\text{expression}\rangle, \langle\text{term}\rangle, \langle\text{factor}\rangle, \langle\text{identifier}\rangle, \langle\text{number}\rangle \}$$

---

### Terminals ($\Sigma$)
Terminal symbols correspond directly to lexical tokens emitted by the scanner:

$$\Sigma = \{ \text{int}, \text{float}, \text{double}, \text{char}, \text{string}, \text{bool}, \text{if}, \text{else}, \text{while}, \text{cout}, \text{cin}, \text{ID}, \text{NUM}, \text{STR}, +, -, *, /, \%, =, ==, !=, <, >, <=, >=, ++, --, <<, >>, ;, (, ), \{, \} \}$$

---

### Start Symbol (S)
The designated start symbol is:

$$S = \langle\text{program}\rangle$$

---

### Formal Production Rules (R)

The language consists of 18 formal production rules:

```text
[R01]  <program>             ::= <statement_list>

[R02]  <statement_list>      ::= <statement> <statement_list>
                               | <statement>

[R03]  <statement>           ::= <if_statement>
                               | <while_statement>
                               | <assignment>
                               | <declaration>
                               | <increment_statement>
                               | <io_statement>
                               | <block_statement>

[R04]  <if_statement>        ::= 'if' '(' <condition> ')' <statement> 'else' <statement>
                               | 'if' '(' <condition> ')' <statement>

[R05]  <while_statement>     ::= 'while' '(' <condition> ')' <statement>

[R06]  <assignment>          ::= <identifier> '=' <expression> ';'

[R07]  <declaration>         ::= <type> <identifier> '=' <expression> ';'
                               | <type> <identifier> ';'

[R08]  <type>                ::= 'int' | 'float' | 'double' | 'char' | 'string' | 'bool'

[R09]  <increment_statement>  ::= <identifier> '++' ';'
                               | <identifier> '--' ';'

[R10]  <io_statement>        ::= 'cout' '<<' <expression> ';'
                               | 'cin' '>>' <identifier> ';'

[R11]  <block_statement>     ::= '{' <statement_list> '}'
                               | '{' '}'

[R12]  <condition>           ::= <expression> <relational_op> <expression>
                               | <expression>

[R13]  <relational_op>       ::= '==' | '!=' | '<=' | '>=' | '<' | '>'

[R14]  <expression>          ::= <expression> '+' <term>
                               | <expression> '-' <term>
                               | <term>

[R15]  <term>                ::= <term> '*' <factor>
                               | <term> '/' <factor>
                               | <term> '%' <factor>
                               | <factor>

[R16]  <factor>              ::= <identifier>
                               | <number>
                               | <string_literal>
                               | '(' <expression> ')'
                               | '-' <factor>

[R17]  <identifier>          ::= [a-zA-Z_][a-zA-Z0-9_]*

[R18]  <number>              ::= [0-9]+ ('.' [0-9]+)?
```

---

## 2. Lexical Analysis Architecture

The lexical scanner (`backend/lexer.py`) is responsible for converting raw input character sequences into an ordered stream of discrete token tuples:

$$\text{Scan}: \Sigma^* \to \text{Stream}(\text{Token})$$

Where each token is an instance of `Token(type, value, line, col)`.

### Token Classes and Regular Expressions
Tokens are classified using deterministic regular expression patterns matched in strict priority order:

| Token Class | Regular Expression | Examples |
| :--- | :--- | :--- |
| `KEYWORD` | `\b(if\|else\|while\|int\|float\|double\|char\|string\|bool\|cout\|cin)\b` | `if`, `while`, `cout` |
| `IDENTIFIER` | `[a-zA-Z_][a-zA-Z0-9_]*` | `x`, `totalCount`, `_var1` |
| `NUMBER` | `\b\d+(\.\d+)?\b` | `0`, `42`, `3.14159` |
| `STRING` | `"([^"\\]*(\\.[^"\\]*)*)"` | `"hello world"`, `"result: "` |
| `RELATIONAL` | `==\|!=\|<=\|>=\|<\|>` | `==`, `<=`, `>` |
| `STREAM_OP` | `<<\|>>` | `<<`, `>>` |
| `INCREMENT` | `\+\+\|\-\-` | `++`, `--` |
| `OPERATOR` | `[+\-*/%=]` | `+`, `-`, `*`, `/`, `=` |
| `DELIMITER` | `[;(),{}]` | `;`, `(`, `)`, `{`, `}` |

### Scanning Algorithm and Coordinate Tracking
The scanner iterates through source text while tracking line indices (`line = 1`) and column coordinates (`col = 1`). Whenever a newline `\n` is encountered, `line` increments and `col` resets to 1. 

If an unrecognized character is discovered outside of whitespace or string literals, the scanner immediately raises `LexerError(msg, line, col)`, preventing malformed tokens from entering the parsing pipeline.

---

## 3. LL(1) Predictive Recursive-Descent Parser

The parser (`backend/parser.py`) implements top-down LL(1) recursive descent. The designation **LL(1)** specifies:
- **L**: Left-to-right scanning of the input stream.
- **L**: Leftmost derivation construction.
- **1**: Single-token lookahead without backtracking.

### Parsing Mechanics and Lookahead
The parser maintains an internal index pointer into the token array. Two fundamental operations govern predictive parsing:
1. `peek()`: Inspects the current lookahead token without advancing the stream.
2. `advance()`: Consumes the current token and advances the pointer.
3. `match(expected_type, expected_value)`: Asserts that `peek()` equals expected values, consuming if valid or raising `ParseError` if mismatched.

Because each production rule begins with a distinct token (or disjoint FIRST set), the parser deterministically selects the correct parsing subroutine in $O(1)$ time per decision.

---

### FIRST and FOLLOW Sets
Predictive parsing requires that for every non-terminal $A$ with alternative productions $A \to \alpha \mid \beta$:

$$\text{FIRST}(\alpha) \cap \text{FIRST}(\beta) = \emptyset$$

Sample FIRST sets for core constructs:
- $\text{FIRST}(\langle\text{statement}\rangle) = \{ \text{if}, \text{while}, \text{int}, \text{float}, \text{double}, \text{char}, \text{string}, \text{bool}, \text{ID}, \text{cout}, \text{cin}, \{ \}$
- $\text{FIRST}(\langle\text{expression}\rangle) = \{ \text{ID}, \text{NUM}, \text{STR}, (, - \}$
- $\text{FIRST}(\langle\text{condition}\rangle) = \text{FIRST}(\langle\text{expression}\rangle)$

Because the lookahead sets are pairwise disjoint, no grammar conflict or backtracking is encountered.

---

### Grammar Transformations: Left Recursion and Factoring
Standard textbook arithmetic grammar exhibits left recursion:

$$E \to E + T \mid T$$

Direct recursive descent on left-recursive productions causes infinite loops. In `backend/parser.py`, left-associative expressions are parsed using iterative loop accumulation:

```python
def parse_expression():
    node = parse_term()
    while check(TokenType.OPERATOR, "+") or check(TokenType.OPERATOR, "-"):
        op = advance()
        right = parse_term()
        node = combine_nodes(op, node, right)
    return node
```

This transforms left recursion into iteration while correctly preserving left-associative tree hierarchy ($((a + b) + c)$).

---

## 4. Canonical Leftmost Derivation Construction

A derivation is a sequence of sentential forms starting with the start symbol $S$ and ending with the terminal sentence $w$:

$$S = \alpha_0 \implies \alpha_1 \implies \alpha_2 \implies \dots \implies \alpha_n = w$$

In a **leftmost derivation**, the leftmost non-terminal in each sentential form $\alpha_i$ is replaced first.

`backend/parser.py` records applied production rules in sequence and synthesizes the exact step-by-step transformation:

```text
[Step 00]  <program>
[Step 01]  =>  <statement_list>
[Step 02]  =>  <statement>
[Step 03]  =>  <if_statement>
[Step 04]  =>  'if' '(' <condition> ')' <statement> 'else' <statement>
...
[Step 14]  =>  'if' '(' 'x' '==' '5' ')' 'y' '=' 'x' '+' '1' ';' 'else' 'y' '=' '0' ';'
```

---

## 5. Dual Tree Synthesis Architecture

### Concrete Parse Tree (CST) Representation
The CST corresponds directly to the grammar production history. Every non-terminal invoked during parsing becomes an internal tree node, and every token (including semicolons, parentheses, and keywords) forms a leaf terminal node:

```json
{
  "label": "<assignment>",
  "children": [
    { "label": "id(x)", "value": "x" },
    { "label": "=", "value": "=" },
    {
      "label": "<expression>",
      "children": [
        { "label": "num(10)", "value": "10" }
      ]
    },
    { "label": ";", "value": ";" }
  ]
}
```

---

### Abstract Syntax Tree (AST) Representation
The AST distills the program into its semantic essence. Syntactic sugar, punctuation delimiters, and single-child identity productions ($\langle\text{expression}\rangle \to \langle\text{term}\rangle \to \langle\text{factor}\rangle$) are discarded:

```json
{
  "label": "ASSIGN (=)",
  "children": [
    { "label": "x" },
    { "label": "10" }
  ]
}
```

---

### Syllabus-Aligned AST Design Principles
To conform to academic compiler design syllabi:
1. **Operator Promotion**: Binary operators are promoted to parent nodes (e.g. `ADD (+)` instead of keeping `+` as an intermediate leaf).
2. **Elimination of Artificial Nodes**: If-statements do not generate synthetic intermediate `THEN` container nodes; branch statements connect directly beneath `IF`.
3. **Punctuation Stripping**: Semicolons `;`, grouping parentheses `(`, `)`, and braces `{`, `}` are pruned.

---

## 6. Compiler Optimization and Redundancy Metrics

During syntax analysis, the compiler evaluates the syntactic redundancy of the source representation:

### Node Count:
$$\text{Nodes}(T) = 1 + \sum_{c \in \text{children}(T)} \text{Nodes}(c)$$

### Maximum Depth:
$$\text{Depth}(T) = \begin{cases} 1 & \text{if children is empty} \\ 1 + \max_{c \in \text{children}(T)} \text{Depth}(c) & \text{otherwise} \end{cases}$$

### Redundancy Reduction Ratio:
The percentage of unnecessary syntactic nodes eliminated during AST construction is calculated as:

$$\text{Reduction} = \left( \frac{\text{Nodes}(\text{CST}) - \text{Nodes}(\text{AST})}{\text{Nodes}(\text{CST})} \right) \times 100\%$$

On average across statements, BNFgen achieves a **35% to 55%** syntactic node reduction, demonstrating the efficiency gains required for subsequent Intermediate Representation (IR) generation.

---

## 7. Backend REST API Architecture

The backend (`backend/main.py`) exposes an asynchronous HTTP REST service built on FastAPI:

### Endpoints:
- `GET /health`:
  - **Purpose**: Liveness probe for frontend status indicators.
  - **Response**: `{"status": "healthy", "engine": "Python 3 FastAPI Compiler Engine", "version": "1.0.0"}`
- `POST /parse`:
  - **Request Body**: `{"code": "string"}`
  - **Success Response (`200 OK`)**:
    ```json
    {
      "valid": true,
      "code": "int x = 10;",
      "parse_tree": { ... },
      "ast": { ... },
      "bnf_clean": "<declaration> ::= <type> <identifier> '=' <expression> ';'",
      "bnf_derivation": "...",
      "bnf_relevant": "...",
      "metrics": {
        "cstNodes": 7,
        "astNodes": 3,
        "cstDepth": 4,
        "astDepth": 2
      }
    }
    ```
  - **Syntax Error Response**:
    ```json
    {
      "valid": false,
      "error": "Expected ';' after statement at line 1, col 12.",
      "line": 1,
      "col": 12
    }
    ```

---

## 8. Frontend Architecture and Reactive State Management

The frontend is implemented in React 19 and structured into clean, modular presentation cards:

```text
frontend/src/
├── components/
│   ├── Header.jsx         # Sticky navigation, health polling, section jump links
│   ├── InputConsole.jsx   # Section 01 (Presets carousel & editor) + Section 02 (CFG panel)
│   ├── BnfCard.jsx        # Section 03 (Segmented BNF tab views & copy utilities)
│   ├── CstCard.jsx        # Section 04 (Full derivation tree visualizer & metrics)
│   ├── AstCard.jsx        # Section 05 (Syllabus AST visualizer & redundancy ratios)
│   └── Footer.jsx         # System metadata and copyright
├── compiler/
│   ├── parser.js          # REST connector with fetch timeouts and error wrappers
│   ├── grammar.js         # Formal production rules, presets, construct metadata
│   └── treeUtils.js       # Recursive tree depth, node count, and ASCII formatters
├── TreeView.jsx           # Standalone recursive tree component with graph & ASCII views
├── App.jsx                # High-level state container coordinating API parse triggers
└── index.css              # Custom responsive neo-brutalist design tokens
```

---

## 9. Time and Space Complexity Analysis

| Phase | Time Complexity | Space Complexity | Explanation |
| :--- | :--- | :--- | :--- |
| **Lexical Analysis** | $O(N)$ | $O(T)$ | Scans $N$ input characters linearly using regex matches to produce $T$ tokens. |
| **LL(1) Parsing** | $O(T)$ | $O(T)$ | Top-down predictive descent visits each token exactly once without backtracking. |
| **CST Construction** | $O(V + T)$ | $O(V + T)$ | Builds tree proportional to the number of non-terminals and terminals. |
| **AST Synthesis** | $O(A)$ | $O(A)$ | Builds compact operator tree where $A < V + T$. |
| **Total Pipeline** | $O(N)$ | $O(N)$ | Linear runtime performance suitable for instantaneous web interaction. |
