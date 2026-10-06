# Recursive Descent LL(1) Predictive Parser, BNF Generator, CST & AST Builder (Python Backend)
# This module implements:
# 1. Formal Backus-Naur Form (BNF) Context-Free Grammar rules for C++ constructs.
# 2. Syntax analysis via recursive descent with 1-token lookahead (LL(1)).
# 3. Concrete Parse Tree (CST) construction preserving all grammar symbols and delimiters.
# 4. Abstract Syntax Tree (AST) synthesis pruning delimiters and hoisting operators.
# 5. Canonical leftmost derivation generation (S =>* input) and applied rule tracking.

# Import type hinting primitives from Python standard library
from typing import Dict, Any, List

# Import regular expressions library for string matching and identifier validation
import re

# Import the tokenizer, token model, and token categories from our lexer module
from lexer import tokenize, Token, TokenType

# Master list of formal Context-Free Grammar production rules in Backus-Naur Form
# Each tuple contains: (Left-Hand Side non-terminal, List of Right-Hand Side alternatives)
FULL_BNF_RULES = [
    ("<program>", ["<statement_list>"]),
    ("<statement_list>", ["<statement> <statement_list>", "<statement>"]),
    ("<statement>", ["<if_statement>", "<while_statement>", "<assignment>", "<declaration>", "<increment_statement>", "<io_statement>", "<block_statement>", "<return_statement>", "<function_definition>"]),
    ("<if_statement>", ["'if' '(' <condition> ')' <statement> 'else' <statement>", "'if' '(' <condition> ')' <statement>"]),
    ("<while_statement>", ["'while' '(' <condition> ')' <statement>"]),
    ("<assignment>", ["<identifier> '=' <expression> ';'"]),
    ("<declaration>", ["<type> <identifier> '=' <expression> ';'", "<type> <identifier> ';'"]),
    ("<type>", ["'int' | 'float' | 'double' | 'char' | 'string' | 'bool'"]),
    ("<increment_statement>", ["<identifier> '++' ';'", "<identifier> '--' ';'"]),
    ("<io_statement>", ["'cout' '<<' <expression> ';'", "'cin' '>>' <identifier> ';'"]),
    ("<block_statement>", ["'{' <statement_list> '}'", "'{' '}'"]),
    ("<return_statement>", ["'return' <expression> ';'", "'return' ';'"]),
    ("<function_definition>", ["<type> <identifier> '(' ')' <block_statement>"]),
    ("<condition>", ["<expression> <relational_op> <expression>", "<expression>"]),
    ("<relational_op>", ["'==' | '!=' | '<=' | '>=' | '<' | '>'"]),
    ("<expression>", ["<expression> '+' <term>", "<expression> '-' <term>", "<term>"]),
    ("<term>", ["<term> '*' <factor>", "<term> '/' <factor>", "<term> '%' <factor>", "<factor>"]),
    ("<factor>", ["<identifier>", "<number>", "<string_literal>", "'(' <expression> ')'", "'-' <factor>"]),
    ("<identifier>", ["[a-zA-Z_][a-zA-Z0-9_]*"]),
    ("<number>", ["[0-9]+ ('.' [0-9]+)?"]),
]

# Formats the raw BNF tuples into a clean, human-readable grammar string
def format_bnf_rules() -> str:
    lines = []
    # Iterate through each production rule in the grammar list
    for lhs, rhss in FULL_BNF_RULES:
        # Join alternatives with a pipe separator on indented new lines
        rhs_str = "\n             | ".join(rhss)
        # Pad LHS to 16 characters for aligned presentation
        lines.append(f"{lhs.ljust(16)} ::= {rhs_str}")
    # Return formatted rules separated by double blank lines
    return "\n\n".join(lines)

# Pre-computed full formal BNF grammar text displayed in the user interface
FULL_BNF_TEXT = format_bnf_rules()

# Custom exception class for recording exact syntax errors with line and column numbers
class ParseError(Exception):
    def __init__(self, message: str, line: int = 1, col: int = 1):
        super().__init__(message)  # Initialize base Exception message
        self.message = message     # Human-readable error description
        self.line = line           # 1-indexed line where the syntax error occurred
        self.col = col             # 1-indexed column where the syntax error occurred

# Recursively counts the total number of nodes in a parse tree or AST
def count_nodes(node: Dict[str, Any]) -> int:
    if not node:
        return 0
    # Retrieve the list of child nodes (defaults to empty list if none)
    children = node.get("children", [])
    # 1 represents the current node, plus the recursive count of all child nodes
    return 1 + sum(count_nodes(c) for c in children)

# Computes the maximum hierarchical depth of a tree from root to deepest leaf
def get_depth(node: Dict[str, Any]) -> int:
    if not node:
        return 0
    children = node.get("children", [])
    # If the node has no children, its depth is 1
    if not children:
        return 1
    # 1 for current level plus maximum depth among children
    return 1 + max(get_depth(c) for c in children)

# Recursively counts terminal leaf nodes (nodes with zero children)
def count_terminals(node: Dict[str, Any]) -> int:
    if not node:
        return 0
    children = node.get("children", [])
    # If no children exist, this node is a terminal token
    if not children:
        return 1
    # Sum terminals across all child subtrees
    return sum(count_terminals(c) for c in children)

# Classifies an operand node to display its formal non-terminal name in BNF representations
def describe_operand(node: Dict[str, Any]) -> str:
    if not node:
        return "<factor>"
    lbl = str(node.get("label", ""))
    # Check if the node represents an identifier variable
    if lbl.startswith("id(") or node.get("nodeType") in ("identifier", "operand-id"):
        return "<identifier>"
    # Check if the node represents a numeric constant
    if lbl.startswith("num(") or node.get("nodeType") in ("number", "operand-num"):
        return "<number>"
    # Check if the node represents a quoted string literal
    if lbl.startswith("str(") or node.get("nodeType") in ("string", "operand-str"):
        return "<string_literal>"
    # Regex test for raw identifier format
    if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", lbl):
        return "<identifier>"
    # Regex test for raw numeric format
    if re.match(r"^[0-9]+(\.[0-9]+)?$", lbl):
        return "<number>"
    # Quoted string check
    if lbl.startswith('"') or lbl.startswith("'"):
        return "<string_literal>"
    # Fallback to general expression
    return "<expression>"

# Decomposes a nested arithmetic expression AST into step-by-step BNF production lines
def decompose_expression(expr: Dict[str, Any]) -> List[str]:
    lines = []
    if not expr:
        return lines
    children = expr.get("children", [])
    # Binary expression with left and right sub-trees
    if len(children) == 2:
        # Extract the operator character inside brackets or parentheses
        m = re.search(r"[\[\(](.*?)[\]\)]", expr.get("label", ""))
        op = m.group(1) if m else "+"
        left, right = children[0], children[1]
        # Identify non-terminal classifications for LHS and RHS
        lhs_desc = describe_operand(left)
        rhs_desc = describe_operand(right)
        lines.append(f"<expression> ::= {lhs_desc} '{op}' {rhs_desc}")
        # Recurse if left child is also a composite expression
        if len(left.get("children", [])) == 2:
            lines.extend(decompose_expression(left))
        # Recurse if right child is also a composite expression
        if len(right.get("children", [])) == 2:
            lines.extend(decompose_expression(right))
    elif len(children) == 1:
        # Unary or single-child expression
        lines.append(f"<expression> ::= {describe_operand(children[0])}")
    return lines

# Synthesizes a clean statement BNF representation matching the exact input statement structure
def generate_clean_input_bnf(ast: Dict[str, Any]) -> str:
    if not ast:
        return "<statement> ::= <empty>"
    blocks = []

    # Inner helper function to inspect each AST statement node
    def process_statement(stmt):
        if not stmt:
            return
        lbl = stmt.get("label", "")
        children = stmt.get("children", [])

        # Handle conditional statement (if-else or simple if)
        if lbl in ("IF_STATEMENT", "IF"):
            # Find the condition node among children
            cond = next((c for c in children if c.get("label", "").startswith("CONDITION") or c.get("label", "").startswith("REL_OP")), None)
            # Find THEN body branch
            then_node = next((c for c in children if c.get("label") == "THEN"), None)
            then_b = then_node.get("children", [None])[0] if then_node else (children[1] if len(children) > 1 else None)
            # Find ELSE body branch if present
            else_node = next((c for c in children if c.get("label") == "ELSE"), None)
            else_b = else_node.get("children", [None])[0] if else_node else (children[2] if len(children) > 2 else None)

            # Produce BNF rule for if or if-else
            if_lines = [
                "<if_stmt> ::= 'if' '(' <condition> ')' <statement> 'else' <statement>" if else_b
                else "<if_stmt> ::= 'if' '(' <condition> ')' <statement>"
            ]
            # Decompose condition sub-expression
            if cond and len(cond.get("children", [])) == 2:
                m = re.search(r"[\[\(](.*?)[\]\)]", cond.get("label", ""))
                op = m.group(1) if m else "=="
                lhs = describe_operand(cond["children"][0])
                rhs = describe_operand(cond["children"][1])
                if_lines.append(f"<condition> ::= {lhs} '{op}' {rhs}")
            blocks.append("\n".join(if_lines))

            # Decompose THEN branch statement
            if then_b:
                branch_lines = []
                if then_b.get("label", "").startswith("ASSIGN"):
                    branch_lines.append("<statement> ::= <assignment>")
                    branch_lines.append("<assignment> ::= <identifier> '=' <expression> ';'")
                    expr = then_b.get("children", [None, None])[1]
                    branch_lines.extend(decompose_expression(expr))
                elif then_b.get("label") == "BLOCK":
                    branch_lines.append("<statement> ::= <block_statement>\n<block_statement> ::= '{' <statement_list> '}'")
                    blocks.append("\n".join(branch_lines))
                    for c in then_b.get("children", []):
                        process_statement(c)
                    return
                else:
                    branch_lines.append(f"<statement> ::= <{then_b.get('label', '').lower()}>")
                blocks.append("\n".join(branch_lines))

            # Decompose ELSE branch statement
            if else_b:
                else_lines = ["<statement> ::= <else_statement>"]
                if else_b.get("label", "").startswith("ASSIGN"):
                    else_lines.append("<assignment> ::= <identifier> '=' <expression> ';'")
                    expr = else_b.get("children", [None, None])[1]
                    else_lines.extend(decompose_expression(expr))
                else:
                    else_lines.append(f"<else_statement> ::= <{else_b.get('label', '').lower()}>")
                blocks.append("\n".join(else_lines))
            return

        # Handle while loop statement
        if lbl in ("WHILE_LOOP", "WHILE"):
            cond = next((c for c in children if c.get("label", "").startswith("CONDITION") or c.get("label", "").startswith("REL_OP")), None)
            body_node = next((c for c in children if c.get("label") == "BODY"), None)
            body = body_node.get("children", [None])[0] if body_node else (children[1] if len(children) > 1 else None)

            while_lines = ["<while_stmt> ::= 'while' '(' <condition> ')' <statement>"]
            if cond and len(cond.get("children", [])) == 2:
                m = re.search(r"[\[\(](.*?)[\]\)]", cond.get("label", ""))
                op = m.group(1) if m else "<"
                lhs = describe_operand(cond["children"][0])
                rhs = describe_operand(cond["children"][1])
                while_lines.append(f"<condition> ::= {lhs} '{op}' {rhs}")
            blocks.append("\n".join(while_lines))

            if body:
                if body.get("label") == "BLOCK":
                    blocks.append("<statement> ::= <block_statement>\n<block_statement> ::= '{' <statement_list> '}'")
                    for c in body.get("children", []):
                        process_statement(c)
                    return
                elif body.get("label", "").startswith("ASSIGN"):
                    b_lines = [
                        "<statement> ::= <assignment>",
                        "<assignment> ::= <identifier> '=' <expression> ';'"
                    ]
                    expr = body.get("children", [None, None])[1]
                    b_lines.extend(decompose_expression(expr))
                    blocks.append("\n".join(b_lines))
                else:
                    blocks.append(f"<statement> ::= <{body.get('label', '').lower()}>")
            return

        # Handle assignment statement (e.g., x = 10;)
        if lbl.startswith("ASSIGN"):
            lines = [
                "<statement> ::= <assignment>",
                "<assignment> ::= <identifier> '=' <expression> ';'"
            ]
            expr = children[1] if len(children) > 1 else None
            lines.extend(decompose_expression(expr))
            blocks.append("\n".join(lines))
            return

        # Handle variable declaration (e.g., int x = 5;)
        if lbl.startswith("VAR_DECL"):
            m = re.search(r"[\[\(](.*?)[\]\)]", lbl)
            type_name = m.group(1) if m else "int"
            lines = [
                "<statement> ::= <declaration>",
                f"<declaration> ::= '{type_name}' <identifier> '=' <expression> ';'"
            ]
            if len(children) > 1:
                lines.extend(decompose_expression(children[1]))
            blocks.append("\n".join(lines))
            return

        # Handle compound statement block ({ ... })
        if lbl == "BLOCK":
            blocks.append("<statement> ::= <block_statement>\n<block_statement> ::= '{' <statement_list> '}'")
            for c in children:
                process_statement(c)
            return

        # Handle stream I/O statements (cout << ... or cin >> ...)
        if lbl.startswith("COUT") or lbl.startswith("CIN"):
            is_cout = lbl.startswith("COUT")
            op = "<<" if is_cout else ">>"
            kw = "cout" if is_cout else "cin"
            blocks.append(f"<statement> ::= <io_statement>\n<io_statement> ::= '{kw}' '{op}' <expression> ';'")
            return

        # Handle increment/decrement statement (x++; or x--;)
        if lbl.startswith("INCR"):
            m = re.search(r"[\[\(](.*?)[\]\)]", lbl)
            op = m.group(1) if m else "++"
            blocks.append(f"<statement> ::= <increment_statement>\n<increment_statement> ::= <identifier> '{op}' ';'")
            return

        # Handle return statement (return 0; or return;)
        if lbl == "RETURN":
            if children:
                blocks.append("<statement> ::= <return_statement>\n<return_statement> ::= 'return' <expression> ';'")
                blocks.extend(decompose_expression(children[0]))
            else:
                blocks.append("<statement> ::= <return_statement>\n<return_statement> ::= 'return' ';'")
            return

        # Handle function definitions (e.g., int main() { ... })
        if lbl.startswith("FUNCTION"):
            m = re.search(r"[\[\(](.*?)[\]\)]", lbl)
            fn_name = m.group(1) if m else "main"
            blocks.append(f"<function_definition> ::= <type> '{fn_name}' '()' <block_statement>")
            for c in children:
                if c.get("label") == "BLOCK":
                    process_statement(c)
            return

        # Standalone Arithmetic Expression (e.g., 2 + 7, a * (b + c))
        if any(lbl.startswith(op) for op in ("ADD", "SUB", "MUL", "DIV", "MOD")):
            lines = decompose_expression(stmt)
            if lines:
                blocks.append("\n".join(lines))
                return

        # Standalone Relational Comparison (e.g., x == 5, count < 10)
        if lbl.startswith("REL_OP") or lbl.startswith("CONDITION"):
            m = re.search(r"[\[\(](.*?)[\]\)]", lbl)
            op = m.group(1) if m else "=="
            lhs = describe_operand(children[0]) if len(children) > 0 else "<expression>"
            rhs = describe_operand(children[1]) if len(children) > 1 else "<expression>"
            cond_lines = [f"<condition> ::= {lhs} '{op}' {rhs}"]
            if len(children) > 0 and len(children[0].get("children", [])) == 2:
                cond_lines.extend(decompose_expression(children[0]))
            if len(children) > 1 and len(children[1].get("children", [])) == 2:
                cond_lines.extend(decompose_expression(children[1]))
            blocks.append("\n".join(cond_lines))
            return

        # Single numeric constant
        if re.match(r"^[0-9]+(\.[0-9]+)?$", lbl):
            blocks.append("<expression> ::= <number>")
            return
        # Single variable identifier
        if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", lbl):
            blocks.append("<expression> ::= <identifier>")
            return

    # Trigger process_statement on the root AST node
    process_statement(ast)
    return "\n\n".join(filter(None, blocks))

# Generates formal step-by-step canonical leftmost derivation (S =>* Input)
def generate_leftmost_derivation(cst: Dict[str, Any]) -> str:
    # Helper: extracts clean string value from a tree node
    def extract_val(n):
        if "value" in n:
            return str(n["value"])
        lbl = str(n.get("label", ""))
        if lbl.startswith("id(") or lbl.startswith("num(") or lbl.startswith("str("):
            return lbl[4:-1]
        return lbl

    # Helper: formats the current list of symbols into a sentential form string
    def format_sentential(nodes):
        parts = []
        for n in nodes:
            if isinstance(n, str):
                parts.append(n)
            elif n.get("children"):
                parts.append(n.get("label", ""))
            else:
                parts.append(f"'{extract_val(n)}'")
        return " ".join(parts)

    # Initialize sentential form starting with the root CST non-terminal
    sentential = [cst]
    steps = [("[Step 00]", format_sentential(sentential), "Initial Start Symbol")]

    # Limit derivation expansion to 40 steps to prevent runaway loops
    max_steps = 40
    while max_steps > 0:
        max_steps -= 1
        leftmost_idx = -1
        # Locate the leftmost non-terminal (a node that has child branches)
        for i, item in enumerate(sentential):
            if isinstance(item, dict) and item.get("children"):
                leftmost_idx = i
                break
        # If no non-terminals remain, derivation has reached all terminal tokens
        if leftmost_idx == -1:
            break

        target = sentential[leftmost_idx]
        replacements = target["children"]
        # Format the applied BNF production rule string
        rule_str = f"{target['label']} ::= " + " ".join(c.get("label") if c.get("children") else f"'{extract_val(c)}'" for c in replacements)

        # Replace the non-terminal with its direct child nodes (leftmost replacement)
        sentential = sentential[:leftmost_idx] + replacements + sentential[leftmost_idx+1:]
        step_num = f"[Step {len(steps):02d}]"
        steps.append((step_num, format_sentential(sentential), rule_str))

    # Build the final step-by-step leftmost derivation text output
    out = ["/* Canonical Leftmost Derivation (S =>* Input) in BNF */\n"]
    for i, (num, form, rule) in enumerate(steps):
        if i == 0:
            out.append(f"{num}  {form}")
        else:
            out.append(f"{num}  =>  {form}\n             |-> Applied: {rule}\n")
    out.append("/* Derivation Complete: Input successfully recognized by grammar */")
    return "\n".join(out)

# Generates structural BNF representation showing the hierarchical tree decomposition
def generate_structural_bnf(cst: Dict[str, Any], indent: int = 0) -> str:
    if not cst:
        return ""
    pad = "  " * indent
    children = cst.get("children", [])
    # Terminal leaf node
    if not children:
        val = cst.get("value") or cst.get("label", "")
        return f"{pad}TERMINAL: '{val}'\n"
    # Non-terminal node with children
    res = f"{pad}{cst.get('label')} ::=\n"
    for c in children:
        if not c.get("children"):
            val = c.get("value") or c.get("label", "")
            res += f"{pad}  '{val}'\n"
        else:
            res += generate_structural_bnf(c, indent + 1)
    return res

# Main compiler entry point: scans, parses, validates, and builds trees for source code
def parse_code(source: str) -> Dict[str, Any]:
    # Check if input text is empty
    if not source or not source.strip():
        raise ParseError("Source code is empty.", 1, 1)

    # 1. Lexical Analysis: Convert text into tokens
    tokens = tokenize(source)
    current = 0           # Pointer index to the current token in the stream
    used_rules = set()    # Set tracking all BNF production rules applied during parsing

    # Helper: records that a specific BNF production rule was applied
    def record_rule(lhs: str, rhs: str):
        used_rules.add(f"{lhs.ljust(16)} ::= {rhs}")

    # Helper: returns the current token without consuming it (1-token lookahead)
    def peek() -> Token:
        return tokens[current]

    # Helper: checks if the parser has consumed all input tokens
    def is_at_end() -> bool:
        t = peek()
        return not t or t.type == TokenType.EOF

    # Helper: checks if the current token matches a given type or value
    def check(token_type: str = None, value: str = None) -> bool:
        t = peek()
        if not t:
            return False
        if token_type == TokenType.EOF:
            return t.type == TokenType.EOF
        if t.type == TokenType.EOF:
            return False
        if token_type and t.type != token_type:
            return False
        if value is not None and t.value != value:
            return False
        return True

    # Helper: advances the token pointer by 1 and returns the previous token
    def advance() -> Token:
        nonlocal current
        if current < len(tokens) - 1:
            current += 1
        return tokens[current - 1]

    # Helper: expects a specific token type or value, raising a ParseError if absent
    def expect(token_type: str = None, value: str = None, context: str = "syntax") -> Token:
        t = peek()
        if check(token_type, value):
            return advance()
        expected = f"'{value}'" if value else token_type
        found = "End of input" if t.type == TokenType.EOF else f"'{t.value}'"
        raise ParseError(f"Syntax error in {context}: Expected {expected} at line {t.line}, col {t.col}, but found {found}.", t.line, t.col)

    # 2. Recursive-Descent Parsing Methods for each grammar construct:

    # Parse entire program: <program> ::= <statement_list>
    def parse_program():
        cst_stmts = []
        ast_stmts = []
        record_rule("<program>", "<statement_list>")

        # Parse statements until End-Of-File
        while not is_at_end():
            s = parse_statement()
            cst_stmts.append(s["cst"])
            ast_stmts.append(s["ast"])

        record_rule("<statement_list>", "<statement> <statement_list>" if len(cst_stmts) > 1 else "<statement>")

        cst = cst_stmts[0] if len(cst_stmts) == 1 else {"label": "<statement_list>", "children": cst_stmts}
        ast = ast_stmts[0] if len(ast_stmts) == 1 else {"label": "BLOCK", "children": ast_stmts}
        return {"cst": cst, "ast": ast}

    # Parse an individual statement by checking the lookahead token
    def parse_statement():
        record_rule("<statement>", "<if_statement> | <while_statement> | <assignment> | <declaration> | <increment_statement> | <io_statement> | <block_statement> | <return_statement>")

        # Handle optional using namespace directive (e.g., using namespace std;)
        if check(TokenType.KEYWORD, "using"):
            advance()
            if check(TokenType.KEYWORD, "namespace"):
                advance()
            while not check(TokenType.DELIMITER, ";") and not is_at_end():
                advance()
            if check(TokenType.DELIMITER, ";"):
                advance()
            if not is_at_end():
                return parse_statement()
            return {"cst": {"label": "<using_directive>"}, "ast": {"label": "USING_DIRECTIVE"}}

        # Branch based on keyword lookahead:
        if check(TokenType.KEYWORD, "return"):
            return parse_return()
        if check(TokenType.KEYWORD, "if"):
            return parse_if()
        if check(TokenType.KEYWORD, "while"):
            return parse_while()
        if check(TokenType.DELIMITER, "{"):
            return parse_block()
        if check(TokenType.KEYWORD, "cout") or check(TokenType.KEYWORD, "cin"):
            return parse_io()
        if peek().value in {"int", "float", "double", "char", "string", "bool"}:
            return parse_decl()
        if check(TokenType.IDENTIFIER):
            # Inspect token immediately after identifier to distinguish increment vs assignment
            next_t = tokens[current + 1] if current + 1 < len(tokens) else None
            if next_t and next_t.value in ("++", "--"):
                return parse_increment()
            if next_t and next_t.value == "=":
                return parse_assignment()

        # Fallback to general arithmetic expression or relational condition
        return parse_expression_or_condition()

    # Parses expressions or conditions, ensuring proper semicolon or disallowing bare variables
    def parse_expression_or_condition():
        expr_or_cond = parse_condition()
        semi_t = None
        if check(TokenType.DELIMITER, ";"):
            semi_t = advance()
        elif not is_at_end():
            t = peek()
            raise ParseError(
                f"Syntax error: Expected ';' after expression at line {t.line}, col {t.col}, but found '{t.value}'.",
                t.line,
                t.col
            )
        # Disallow bare standalone identifiers (e.g., "x;" without operation or declaration)
        ast_obj = expr_or_cond.get("ast", {})
        if not ast_obj.get("children"):
            lbl = str(ast_obj.get("label", ""))
            if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", lbl):
                raise ParseError(
                    f"Syntax error: Bare identifier '{lbl}' is not a valid statement or expression.",
                    1,
                    1
                )

        if semi_t:
            return {
                "cst": {
                    "label": "<statement>",
                    "nodeType": "non-terminal",
                    "children": [expr_or_cond["cst"], {"label": semi_t.value, "nodeType": "delimiter"}]
                },
                "ast": expr_or_cond["ast"]
            }
        return expr_or_cond

    # Parse conditional: <if_statement> ::= 'if' '(' <condition> ')' <statement> [ 'else' <statement> ]
    def parse_if():
        if_t = expect(TokenType.KEYWORD, "if", "if statement")
        op_t = expect(TokenType.DELIMITER, "(", "if condition")
        cond = parse_condition()
        cp_t = expect(TokenType.DELIMITER, ")", "if condition")
        then_b = parse_statement()

        else_b = None
        else_t = None
        if check(TokenType.KEYWORD, "else"):
            else_t = advance()
            else_b = parse_statement()
            record_rule("<if_statement>", "'if' '(' <condition> ')' <statement> 'else' <statement>")
        else:
            record_rule("<if_statement>", "'if' '(' <condition> ')' <statement>")

        cst_children = [
            {"label": if_t.value, "nodeType": "keyword", "tokenType": "KEYWORD"},
            {"label": op_t.value, "nodeType": "delimiter", "tokenType": "DELIMITER"},
            cond["cst"],
            {"label": cp_t.value, "nodeType": "delimiter", "tokenType": "DELIMITER"},
            then_b["cst"]
        ]
        if else_b:
            cst_children.extend([
                {"label": else_t.value, "nodeType": "keyword", "tokenType": "KEYWORD"},
                else_b["cst"]
            ])

        ast_children = [
            cond["ast"],
            then_b["ast"]
        ]
        if else_b:
            ast_children.append(else_b["ast"])

        return {
            "cst": {"label": "<if_statement>", "nodeType": "non-terminal", "children": cst_children},
            "ast": {"label": "IF", "nodeType": "statement", "children": ast_children}
        }

    # Parse loop: <while_statement> ::= 'while' '(' <condition> ')' <statement>
    def parse_while():
        w_t = expect(TokenType.KEYWORD, "while", "while loop")
        op_t = expect(TokenType.DELIMITER, "(", "while condition")
        cond = parse_condition()
        cp_t = expect(TokenType.DELIMITER, ")", "while condition")
        body = parse_statement()
        record_rule("<while_statement>", "'while' '(' <condition> ')' <statement>")

        cst = {
            "label": "<while_statement>",
            "children": [{"label": w_t.value}, {"label": op_t.value}, cond["cst"], {"label": cp_t.value}, body["cst"]]
        }
        ast = {
            "label": "WHILE",
            "children": [
                cond["ast"],
                body["ast"]
            ]
        }
        return {"cst": cst, "ast": ast}

    # Parse block: <block_statement> ::= '{' <statement_list> '}'
    def parse_block():
        ob_t = expect(TokenType.DELIMITER, "{", "block statement")
        stmts_cst, stmts_ast = [], []
        record_rule("<block_statement>", "'{' <statement_list> '}'")

        while not check(TokenType.DELIMITER, "}") and not is_at_end():
            s = parse_statement()
            stmts_cst.append(s["cst"])
            stmts_ast.append(s["ast"])

        cb_t = expect(TokenType.DELIMITER, "}", "block statement")
        cst = {"label": "<block_statement>", "children": [{"label": ob_t.value}, {"label": "<statement_list>", "children": stmts_cst}, {"label": cb_t.value}]}
        ast = {"label": "BLOCK", "children": stmts_ast}
        return {"cst": cst, "ast": ast}

    # Parse assignment: <assignment> ::= <identifier> '=' <expression> ';'
    def parse_assignment():
        id_t = expect(TokenType.IDENTIFIER, None, "assignment target")
        eq_t = expect(TokenType.OPERATOR, "=", "assignment")
        expr = parse_expression()
        semi_t = expect(TokenType.DELIMITER, ";", "assignment termination")
        record_rule("<assignment>", "<identifier> '=' <expression> ';'")

        cst = {
            "label": "<assignment>",
            "children": [{"label": f"id({id_t.value})", "value": id_t.value}, {"label": eq_t.value}, expr["cst"], {"label": semi_t.value}]
        }
        ast = {
            "label": "ASSIGN (=)",
            "children": [{"label": id_t.value}, expr["ast"]]
        }
        return {"cst": cst, "ast": ast}

    # Parse variable declaration or function definition: <declaration> ::= <type> <identifier> ...
    def parse_decl():
        type_t = advance()
        id_t = expect(TokenType.IDENTIFIER, None, "declaration identifier")

        # Function definition e.g. int main() { ... }
        if check(TokenType.DELIMITER, "("):
            advance()
            while not check(TokenType.DELIMITER, ")") and not is_at_end():
                advance()
            expect(TokenType.DELIMITER, ")", "function parameter closing parenthesis")
            body = parse_block()
            record_rule("<declaration>", "<function_definition>")
            record_rule("<function_definition>", f"'{type_t.value}' '{id_t.value}' '()' <block_statement>")
            return {
                "cst": {
                    "label": "<function_definition>",
                    "children": [{"label": type_t.value}, {"label": f"id({id_t.value})"}, {"label": "()"}, body["cst"]]
                },
                "ast": {
                    "label": f"FUNCTION ({id_t.value})",
                    "children": [{"label": type_t.value}, body["ast"]]
                }
            }

        # Regular variable declaration (e.g., int x = 5; or int x;)
        init_expr = None
        eq_t = None
        if check(TokenType.OPERATOR, "="):
            eq_t = advance()
            init_expr = parse_expression()
        semi_t = expect(TokenType.DELIMITER, ";", "declaration semicolon")
        record_rule("<declaration>", "<type> <identifier> [ '=' <expression> ] ';'")

        cst_kids = [{"label": type_t.value}, {"label": f"id({id_t.value})", "value": id_t.value}]
        if init_expr:
            cst_kids.extend([{"label": eq_t.value}, init_expr["cst"]])
        cst_kids.append({"label": semi_t.value})

        ast_kids = [{"label": id_t.value}]
        if init_expr:
            ast_kids.append(init_expr["ast"])

        return {
            "cst": {"label": "<declaration>", "children": cst_kids},
            "ast": {"label": f"VAR_DECL ({type_t.value})", "children": ast_kids}
        }

    # Parse return statement: <return_statement> ::= 'return' [ <expression> ] ';'
    def parse_return():
        ret_t = advance()
        expr = None
        if not check(TokenType.DELIMITER, ";") and not is_at_end():
            expr = parse_expression()
        semi_t = expect(TokenType.DELIMITER, ";", "return statement semicolon")
        record_rule("<statement>", "<return_statement>")
        record_rule("<return_statement>", "'return' <expression> ';' | 'return' ';'")

        cst_kids = [{"label": ret_t.value}]
        ast_kids = []
        if expr:
            cst_kids.append(expr["cst"])
            ast_kids.append(expr["ast"])
        cst_kids.append({"label": semi_t.value})

        return {
            "cst": {"label": "<return_statement>", "children": cst_kids},
            "ast": {"label": "RETURN", "children": ast_kids} if ast_kids else {"label": "RETURN"}
        }

    # Parse increment/decrement: <increment_statement> ::= <identifier> ('++' | '--') ';'
    def parse_increment():
        id_t = expect(TokenType.IDENTIFIER, None, "increment target")
        op_t = advance()
        semi_t = expect(TokenType.DELIMITER, ";", "increment termination")
        record_rule("<increment_statement>", f"<identifier> '{op_t.value}' ';'")
        return {
            "cst": {"label": "<increment_statement>", "children": [{"label": f"id({id_t.value})", "value": id_t.value}, {"label": op_t.value}, {"label": semi_t.value}]},
            "ast": {"label": f"INCR ({op_t.value})", "children": [{"label": id_t.value}]}
        }

    # Parse stream I/O: <io_statement> ::= 'cout' '<<' ... ';' | 'cin' '>>' ... ';'
    def parse_io():
        io_t = advance()
        op = "<<" if io_t.value == "cout" else ">>"
        expect(TokenType.OPERATOR, op, f"{io_t.value} stream operator")
        cst_kids = [{"label": io_t.value}, {"label": op}]
        ast_kids = []
        if io_t.value == "cin":
            # Stream input: target must be an identifier variable
            id_t = expect(TokenType.IDENTIFIER, None, "cin target")
            cst_kids.append({"label": f"id({id_t.value})", "value": id_t.value})
            ast_kids.append({"label": id_t.value})
            while check(TokenType.OPERATOR, ">>"):
                op_t = advance()
                cst_kids.append({"label": op_t.value})
                next_id = expect(TokenType.IDENTIFIER, None, "cin chained target")
                cst_kids.append({"label": f"id({next_id.value})", "value": next_id.value})
                ast_kids.append({"label": next_id.value})
        else:
            # Stream output: target can be any valid expression (string, number, math, etc.)
            expr = parse_expression()
            cst_kids.append(expr["cst"])
            ast_kids.append(expr["ast"])
            while check(TokenType.OPERATOR, "<<"):
                op_t = advance()
                cst_kids.append({"label": op_t.value})
                next_expr = parse_expression()
                cst_kids.append(next_expr["cst"])
                ast_kids.append(next_expr["ast"])
        semi_t = expect(TokenType.DELIMITER, ";", "I/O termination")
        cst_kids.append({"label": semi_t.value})
        record_rule("<io_statement>", f"'{io_t.value}' '{op}' ... ';'")
        return {
            "cst": {"label": "<io_statement>", "children": cst_kids},
            "ast": {"label": f"{io_t.value.upper()} ({op})", "children": ast_kids}
        }

    # Parse condition: <condition> ::= <expression> [ <relational_op> <expression> ]
    def parse_condition():
        left = parse_expression()
        if check(TokenType.OPERATOR) and peek().value in ("==", "!=", "<", "<=", ">", ">="):
            record_rule("<condition>", "<expression> <relational_op> <expression>")
            op_t = advance()
            record_rule("<relational_op>", f"'{op_t.value}'")
            right = parse_expression()
            cst = {"label": "<condition>", "nodeType": "condition", "children": [left["cst"], {"label": op_t.value, "nodeType": "operator"}, right["cst"]]}
            ast = {"label": f"CONDITION ({op_t.value})", "nodeType": "condition", "op": op_t.value, "children": [left["ast"], right["ast"]]}
            return {"cst": cst, "ast": ast}
        return left

    # Parse expression (addition and subtraction): <expression> ::= <term> { ('+' | '-') <term> }
    def parse_expression():
        left = parse_term()
        while check(TokenType.OPERATOR, "+") or check(TokenType.OPERATOR, "-"):
            op_t = advance()
            record_rule("<expression>", f"<expression> '{op_t.value}' <term>")
            right = parse_term()
            op_name = "ADD (+)" if op_t.value == "+" else "SUB (-)"
            left = {
                "cst": {"label": "<expression>", "children": [left["cst"], {"label": op_t.value}, right["cst"]]},
                "ast": {"label": op_name, "children": [left["ast"], right["ast"]]}
            }
        record_rule("<expression>", "<term>")
        return left

    # Parse term (multiplication, division, modulo): <term> ::= <factor> { ('*' | '/' | '%') <factor> }
    def parse_term():
        left = parse_factor()
        while check(TokenType.OPERATOR) and peek().value in ("*", "/", "%"):
            op_t = advance()
            record_rule("<term>", f"<term> '{op_t.value}' <factor>")
            right = parse_factor()
            op_name = "MUL (*)" if op_t.value == "*" else ("DIV (/)" if op_t.value == "/" else "MOD (%)")
            left = {
                "cst": {"label": "<term>", "children": [left["cst"], {"label": op_t.value}, right["cst"]]},
                "ast": {"label": op_name, "children": [left["ast"], right["ast"]]}
            }
        record_rule("<term>", "<factor>")
        return left

    # Parse factor (atomic components): <factor> ::= '(' <expression> ')' | <id> | <num> | <str> | '-' <factor>
    def parse_factor():
        t = peek()
        # Grouped expression in parentheses
        if check(TokenType.DELIMITER, "("):
            op_t = advance()
            expr = parse_expression()
            cp_t = expect(TokenType.DELIMITER, ")", "parentheses")
            record_rule("<factor>", "'(' <expression> ')'")
            return {
                "cst": {"label": "<factor>", "children": [{"label": op_t.value}, expr["cst"], {"label": cp_t.value}]},
                "ast": expr["ast"]
            }
        # Variable identifier
        if check(TokenType.IDENTIFIER):
            id_t = advance()
            record_rule("<factor>", "<identifier>")
            return {"cst": {"label": f"id({id_t.value})", "value": id_t.value}, "ast": {"label": id_t.value}}
        # Numeric literal
        if check(TokenType.NUMBER):
            num_t = advance()
            record_rule("<factor>", "<number>")
            return {"cst": {"label": f"num({num_t.value})", "value": num_t.value}, "ast": {"label": num_t.value}}
        # String literal
        if check(TokenType.STRING):
            str_t = advance()
            record_rule("<factor>", "<string_literal>")
            return {"cst": {"label": f"str(\"{str_t.value}\")", "value": str_t.value}, "ast": {"label": f"\"{str_t.value}\""}}
        # Unary negation operator (e.g., -5)
        if check(TokenType.OPERATOR, "-"):
            minus_t = advance()
            fac = parse_factor()
            record_rule("<factor>", "'-' <factor>")
            return {
                "cst": {"label": "<factor>", "children": [{"label": minus_t.value}, fac["cst"]]},
                "ast": {"label": "NEG (-)", "children": [fac["ast"]]}
            }
        # If token does not match any factor, raise a descriptive syntax error
        raise ParseError(f"Unexpected token in expression: '{t.value}' at line {t.line}, col {t.col}.", t.line, t.col)

    # 3. Parse the program and generate CST and AST
    prog = parse_program()
    cst = prog["cst"]
    ast = prog["ast"]

    # 4. Calculate metrics and generate BNF representations
    cst_n = count_nodes(cst)
    ast_n = count_nodes(ast)

    clean_bnf = generate_clean_input_bnf(ast)
    derivation_bnf = generate_leftmost_derivation(cst)
    structural_bnf = generate_structural_bnf(cst)
    relevant_bnf = "\n".join(sorted(used_rules))
    rules_count = len(used_rules)
    cst_depth = get_depth(cst)
    cst_terminals = count_terminals(cst)
    ast_depth = get_depth(ast)

    # Return the complete dictionary result payload for the API
    return {
        "valid": True,
        "code": source,
        "parseTree": cst,
        "parse_tree": cst,
        "ast": ast,
        "bnfClean": clean_bnf,
        "bnf_clean": clean_bnf,
        "bnfRepresentation": clean_bnf,
        "bnf_representation": clean_bnf,
        "bnfDerivation": derivation_bnf,
        "bnf_derivation": derivation_bnf,
        "bnfStructural": structural_bnf,
        "bnf_structural": structural_bnf,
        "bnfRelevant": relevant_bnf,
        "bnf_relevant": relevant_bnf,
        "bnfFull": FULL_BNF_TEXT,
        "bnf_full": FULL_BNF_TEXT,
        "bnfRulesCount": rules_count,
        "bnf_rules_count": rules_count,
        "metrics": {
            "cstNodes": cst_n,
            "cst_nodes": cst_n,
            "cstDepth": cst_depth,
            "cst_depth": cst_depth,
            "cstTerminals": cst_terminals,
            "cst_terminals": cst_terminals,
            "astNodes": ast_n,
            "ast_nodes": ast_n,
            "astDepth": ast_depth,
            "ast_depth": ast_depth
        }
    }