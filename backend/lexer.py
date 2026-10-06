# Lexical Analyzer (Scanner / Tokenizer) for C++ Source Code
# This module converts raw source code text into a stream of meaningful tokens.
# Each token has a category (type), text value, and source coordinates (line and column).

# Import regular expressions library (used for pattern matching if needed)
import re

# Enum-like class defining all recognized token categories in our compiler
class TokenType:
    KEYWORD = "KEYWORD"        # Reserved language words (e.g., if, while, int, cout)
    IDENTIFIER = "IDENTIFIER"  # Variable names or function names (e.g., total, count, x)
    NUMBER = "NUMBER"          # Numeric literals, integer or floating point (e.g., 42, 3.14)
    STRING = "STRING"          # String literal enclosed in quotes (e.g., "Result: ")
    OPERATOR = "OPERATOR"      # Mathematical, relational, or assignment symbols (e.g., +, ==, =)
    DELIMITER = "DELIMITER"    # Punctuation and grouping symbols (e.g., ;, (, ), {, })
    EOF = "EOF"                # Special End-Of-File marker indicating input termination

# Set of reserved C++ keywords recognized by our language grammar
KEYWORDS = {
    "if", "else", "while", "for", "do",
    "int", "float", "double", "char", "string", "bool",
    "cout", "cin", "return", "using", "namespace"
}

# List of two-character operators that must be checked before single-character operators
MULTI_OPS = ["==", "!=", "<=", ">=", "++", "--", "<<", ">>", "&&", "||"]

# Set of single-character operators supported by arithmetic and comparison expressions
SINGLE_OPS = set("=+-*/%<>!")

# Set of punctuation delimiters that separate expressions, statements, and blocks
DELIMITERS = set(";,(){}[]")

# Token data structure representing an individual scanned unit of the program
class Token:
    # Initialize a token with its category type, actual string value, line number, and column number
    def __init__(self, token_type: str, value: str, line: int, col: int):
        self.type = token_type      # Category string (e.g., TokenType.KEYWORD)
        self.value = value          # Raw text of the token (e.g., "if", "x", "100")
        self.line = line            # 1-indexed line number where the token appears
        self.col = col              # 1-indexed column number where the token begins

    # String representation for debugging and console inspection
    def __repr__(self):
        return f"Token({self.type}, {self.value!r}, L{self.line}:C{self.col})"

# Primary tokenization function that scans the input source code string from start to finish
def tokenize(source: str):
    tokens = []              # List that will hold all scanned Token objects
    index = 0                # Current read position index within the source text string
    line = 1                 # Current line tracker (starts at line 1)
    col = 1                  # Current column tracker (starts at column 1)
    length = len(source)     # Total character count of the source string

    # Helper function: consumes the current character, moves index forward, and updates line/column
    def advance():
        nonlocal index, line, col
        ch = source[index]   # Get the character at current index
        index += 1           # Increment index by 1
        if ch == '\n':       # If it's a newline, advance to the next line and reset column to 1
            line += 1
            col = 1
        else:                # Otherwise, increment the current column number
            col += 1
        return ch            # Return the character consumed

    # Helper function: inspects characters ahead without advancing the current index pointer
    def peek(offset=0):
        if index + offset < length:       # Check if the requested offset is within string boundaries
            return source[index + offset] # Return the character at the offset position
        return ""                         # Return empty string if beyond the end of source text

    # Main scanning loop: iterate through characters until reaching the end of the source string
    while index < length:
        ch = peek()          # Look at the current character without consuming it yet

        # 1. Skip whitespace characters (spaces, tabs, newlines, carriage returns)
        if ch.isspace():
            advance()        # Move past whitespace
            continue

        # 2. Skip preprocessor directives (e.g., #include <iostream>, #define MAX 100)
        if ch == '#':
            while index < length and peek() != '\n':
                advance()    # Consume characters until reaching the end of the line
            continue

        # 3. Skip single-line comments (e.g., // this is a comment)
        if ch == '/' and peek(1) == '/':
            while index < length and peek() != '\n':
                advance()    # Consume characters until reaching the end of the line
            continue

        # 4. Skip multi-line comments (e.g., /* block comment */)
        if ch == '/' and peek(1) == '*':
            advance()        # Consume the leading '/'
            advance()        # Consume the leading '*'
            while index < length and not (peek() == '*' and peek(1) == '/'):
                advance()    # Consume until the closing '*/' pattern is found
            if index < length:
                advance()    # Consume closing '*'
                advance()    # Consume closing '/'
            continue

        # Record the exact starting coordinates of the current token before consuming characters
        start_line = line
        start_col = col

        # 5. Check for multi-character operators (e.g., '==', '!=', '<<', '++', '<=')
        two = ch + peek(1)
        if two in MULTI_OPS:
            advance()        # Consume first operator character
            advance()        # Consume second operator character
            tokens.append(Token(TokenType.OPERATOR, two, start_line, start_col))
            continue

        # 6. Check for single-character operators (e.g., '+', '-', '*', '/', '=', '<')
        if ch in SINGLE_OPS:
            advance()        # Consume the single operator character
            tokens.append(Token(TokenType.OPERATOR, ch, start_line, start_col))
            continue

        # 7. Check for delimiters and punctuation (e.g., ';', '(', ')', '{', '}')
        if ch in DELIMITERS:
            advance()        # Consume the delimiter character
            tokens.append(Token(TokenType.DELIMITER, ch, start_line, start_col))
            continue

        # 8. Check for string literals enclosed in double or single quotes
        if ch in ('"', "'"):
            quote = advance() # Consume the opening quote mark and store it
            val = ""
            while index < length and peek() != quote:
                # Handle backslash escape sequences (e.g., \", \n, \\)
                if peek() == '\\' and index + 1 < length:
                    advance()            # Consume the backslash
                    val += advance()     # Append the escaped character
                else:
                    val += advance()     # Append regular character to string value
            if index < length:
                advance()     # Consume the closing quote mark
            tokens.append(Token(TokenType.STRING, val, start_line, start_col))
            continue

        # 9. Check for numbers (both integer and floating-point numeric literals)
        if ch.isdigit():
            val = ""
            # Consume all consecutive numeric digits
            while index < length and peek().isdigit():
                val += advance()
            # If followed by a decimal point and more digits, parse as float (e.g., 3.14)
            if peek() == '.' and peek(1).isdigit():
                val += advance()         # Consume the decimal point
                while index < length and peek().isdigit():
                    val += advance()     # Consume digits following the decimal point
            tokens.append(Token(TokenType.NUMBER, val, start_line, start_col))
            continue

        # 10. Check for identifiers and reserved keywords (starts with a letter or underscore)
        if ch.isalpha() or ch == '_':
            val = ""
            # Consume all consecutive letters, numbers, or underscores
            while index < length and (peek().isalnum() or peek() == '_'):
                val += advance()
            # Classify as KEYWORD if in keyword set, otherwise classify as IDENTIFIER
            t_type = TokenType.KEYWORD if val in KEYWORDS else TokenType.IDENTIFIER
            tokens.append(Token(t_type, val, start_line, start_col))
            continue

        # If an unhandled character is encountered, raise a descriptive lexical error
        raise ValueError(f"Unexpected character {ch!r} at line {start_line}, col {start_col}")

    # Append an End-Of-File (EOF) token so the parser knows the input stream is finished
    tokens.append(Token(TokenType.EOF, "<EOF>", line, col))
    return tokens