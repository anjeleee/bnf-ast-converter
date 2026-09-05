# Lexer for C-like statement source code (Python Backend)

import re

class TokenType:
    KEYWORD = "KEYWORD"
    IDENTIFIER = "IDENTIFIER"
    NUMBER = "NUMBER"
    STRING = "STRING"
    OPERATOR = "OPERATOR"
    DELIMITER = "DELIMITER"
    EOF = "EOF"

KEYWORDS = {
    "if", "else", "while", "for", "do",
    "int", "float", "double", "char", "string", "bool",
    "cout", "cin", "return"
}

MULTI_OPS = ["==", "!=", "<=", ">=", "++", "--", "<<", ">>", "&&", "||"]
SINGLE_OPS = set("=+-*/%<>!")
DELIMITERS = set(";,(){}[]")

class Token:
    def __init__(self, token_type: str, value: str, line: int, col: int):
        self.type = token_type
        self.value = value
        self.line = line
        self.col = col

    def __repr__(self):
        return f"Token({self.type}, {self.value!r}, L{self.line}:C{self.col})"

def tokenize(source: str):
    tokens = []
    index = 0
    line = 1
    col = 1
    length = len(source)

    def advance():
        nonlocal index, line, col
        ch = source[index]
        index += 1
        if ch == '\n':
            line += 1
            col = 1
        else:
            col += 1
        return ch

    def peek(offset=0):
        if index + offset < length:
            return source[index + offset]
        return ""

    while index < length:
        ch = peek()

        # Whitespace
        if ch.isspace():
            advance()
            continue

        # Comments
        if ch == '/' and peek(1) == '/':
            while index < length and peek() != '\n':
                advance()
            continue
        if ch == '/' and peek(1) == '*':
            advance()
            advance()
            while index < length and not (peek() == '*' and peek(1) == '/'):
                advance()
            if index < length:
                advance()
                advance()
            continue

        start_line = line
        start_col = col

        # Multi-char operators
        two = ch + peek(1)
        if two in MULTI_OPS:
            advance()
            advance()
            tokens.append(Token(TokenType.OPERATOR, two, start_line, start_col))
            continue

        # Single-char operators
        if ch in SINGLE_OPS:
            advance()
            tokens.append(Token(TokenType.OPERATOR, ch, start_line, start_col))
            continue

        # Delimiters
        if ch in DELIMITERS:
            advance()
            tokens.append(Token(TokenType.DELIMITER, ch, start_line, start_col))
            continue

        # Strings
        if ch in ('"', "'"):
            quote = advance()
            val = ""
            while index < length and peek() != quote:
                if peek() == '\\' and index + 1 < length:
                    advance()
                    val += advance()
                else:
                    val += advance()
            if index < length:
                advance()
            tokens.append(Token(TokenType.STRING, val, start_line, start_col))
            continue

        # Numbers
        if ch.isdigit():
            val = ""
            while index < length and peek().isdigit():
                val += advance()
            if peek() == '.' and peek(1).isdigit():
                val += advance()
                while index < length and peek().isdigit():
                    val += advance()
            tokens.append(Token(TokenType.NUMBER, val, start_line, start_col))
            continue

        # Identifiers & Keywords
        if ch.isalpha() or ch == '_':
            val = ""
            while index < length and (peek().isalnum() or peek() == '_'):
                val += advance()
            t_type = TokenType.KEYWORD if val in KEYWORDS else TokenType.IDENTIFIER
            tokens.append(Token(t_type, val, start_line, start_col))
            continue

        raise ValueError(f"Unexpected character {ch!r} at line {start_line}, col {start_col}")

    tokens.append(Token(TokenType.EOF, "<EOF>", line, col))
    return tokens