/**
 * Formal C++ Backus-Naur Form (BNF) Grammar Definitions and UI Preset Configurations.
 * Defines standard example test cases, the complete 19-rule Context-Free Grammar,
 * and academic construct feature card metadata for the client visualizer.
 */

// Array of clickable test presets loaded in the input console toolbar
export const EXAMPLES = [
  {
    id: "if-addition",                        // Conditional statement with variable addition
    label: "if (x == 5) y = x + 1;",          // Display text
    code: "if (x == 5) y = x + 1;"            // Source code loaded into the editor
  },
  {
    id: "if-arithmetic",                      // Conditional statement with numeric expression
    label: "if (x == 5) y = 2 + 7",           // Display text
    code: "if (x == 5) y = 2 + 7"             // Source code loaded into the editor
  },
  {
    id: "assign",                             // Unique identifier for assignment preset
    label: "total = a * (b + 2);",            // Display text
    code: "total = a * (b + 2);"              // Expression with operator precedence
  },
  {
    id: "arithmetic",                         // Unique identifier for arithmetic preset
    label: "2 + 7",                            // Display text on the preset chip button
    code: "2 + 7"                             // Source code loaded into the editor
  },
  {
    id: "decl",                               // Unique identifier for declaration preset
    label: "int x = 10;",                     // Display text
    code: "int x = 10;"                       // Typed variable initialization
  },
  {
    id: "if-else",                            // Unique identifier for conditional preset
    label: "if (x == 5) y = x + 1; else y = 0;",
    code: "if (x == 5) y = x + 1; else y = 0;"
  },
  {
    id: "while",                              // Unique identifier for loop preset
    label: "while (count < 10) count = count + 1;",
    code: "while (count < 10) count = count + 1;"
  },
  {
    id: "block",                              // Unique identifier for compound block preset
    label: "Compound Block",
    code: "{\n  int x = 1;\n  y = x + 2;\n  cout << y;\n}"
  },
  {
    id: "cout",                               // Unique identifier for stream output preset
    label: "cout << total;",
    code: 'cout << "Result: " << total;'
  },
  {
    id: "cin",                                // Unique identifier for stream input preset
    label: "cin >> userInput;",
    code: "cin >> userInput;"
  },
  {
    id: "return-stmt",                        // Unique identifier for return statement preset
    label: "return 0;",
    code: "return 0;"
  },
  {
    id: "full-program",                       // Unique identifier for full function preset
    label: "int main() { ... }",
    code: 'int main() {\n  int score = 95;\n  if (score >= 60) cout << "Pass";\n  return 0;\n}'
  }
];

// Complete formal Context-Free Grammar (CFG) in Backus-Naur Form for our C++ subset
export const FULL_BNF_TEXT = `<program>          ::= <statement_list>

<statement_list>   ::= <statement> <statement_list>
                     | <statement>

<statement>        ::= <if_statement>
                     | <while_statement>
                     | <assignment>
                     | <declaration>
                     | <increment_statement>
                     | <io_statement>
                     | <block_statement>
                     | <return_statement>
                     | <function_definition>

<if_statement>     ::= 'if' '(' <condition> ')' <statement> 'else' <statement>
                     | 'if' '(' <condition> ')' <statement>

<while_statement>  ::= 'while' '(' <condition> ')' <statement>

<assignment>       ::= <identifier> '=' <expression> ';'

<declaration>      ::= <type> <identifier> '=' <expression> ';'
                     | <type> <identifier> ';'

<type>             ::= 'int' | 'float' | 'double' | 'char' | 'string' | 'bool'

<increment_statement> ::= <identifier> '++' ';'
                     | <identifier> '--' ';'

<io_statement>     ::= 'cout' '<<' <expression> ';'
                     | 'cin' '>>' <identifier> ';'

<block_statement>  ::= '{' <statement_list> '}'
                     | '{' '}'

<return_statement> ::= 'return' <expression> ';'
                     | 'return' ';'

<function_definition> ::= <type> <identifier> '(' ')' <block_statement>

<condition>        ::= <expression> <relational_op> <expression>
                     | <expression>

<relational_op>    ::= '==' | '!=' | '<=' | '>=' | '<' | '>'

<expression>       ::= <expression> '+' <term>
                     | <expression> '-' <term>
                     | <term>

<term>             ::= <term> '*' <factor>
                     | <term> '/' <factor>
                     | <term> '%' <factor>
                     | <factor>

<factor>           ::= <identifier>
                     | <number>
                     | <string_literal>
                     | '(' <expression> ')'
                     | '-' <factor>

<identifier>       ::= [a-zA-Z_][a-zA-Z0-9_]*

<number>           ::= [0-9]+ ('.' [0-9]+)?`;

// Metadata list for the 8 core C++ language construct accordion in Card 02
export const GRAMMAR_FEATURES = [
  {
    id: "declarations",
    title: "C++ Variable Declarations",
    badge: "01 Declaration",
    desc: "Typed declarations supporting standard C++ primitives (int, float, double, char, string, bool) with optional initial assignment.",
    cfg: `<declaration> ::= <type> <identifier> '=' <expression> ';'
                | <type> <identifier> ';'`
  },
  {
    id: "assignments",
    title: "C++ Variable Assignments",
    badge: "02 Assignment",
    desc: "Assignment of evaluated arithmetic expressions or post-fix increment/decrement operations.",
    cfg: `<assignment>          ::= <identifier> '=' <expression> ';'
<increment_statement> ::= <identifier> '++' ';' | <identifier> '--' ';'`
  },
  {
    id: "arithmetic",
    title: "C++ Arithmetic Expressions",
    badge: "03 Expression",
    desc: "Full operator precedence (+, -, *, /, %) with parenthetical sub-expressions and unary negation.",
    cfg: `<expression> ::= <expression> '+' <term> | <expression> '-' <term> | <term>
<term>       ::= <term> '*' <factor> | <term> '/' <factor> | <factor>`
  },
  {
    id: "conditionals",
    title: "C++ Conditional Branching",
    badge: "04 Branching",
    desc: "C++ if and if-else decision statements with relational conditions (==, !=, <, >, <=, >=).",
    cfg: `<if_statement> ::= 'if' '(' <condition> ')' <statement> 'else' <statement>
                  | 'if' '(' <condition> ')' <statement>`
  },
  {
    id: "loops",
    title: "C++ Iteration & Loops",
    badge: "05 Loop",
    desc: "Predictive while loop control structures with evaluated boolean or arithmetic termination criteria.",
    cfg: `<while_statement> ::= 'while' '(' <condition> ')' <statement>`
  },
  {
    id: "blocks",
    title: "C++ Compound Statement Blocks",
    badge: "06 Block",
    desc: "Enclosed C++ local scope containing an arbitrary sequence of nested statements between braces { ... }.",
    cfg: `<block_statement> ::= '{' <statement_list> '}' | '{' '}'`
  },
  {
    id: "io_out",
    title: "C++ Stream Output (cout)",
    badge: "07 Stream Out",
    desc: "Standard C++ stream insertion output statement for printing expressions and string literals via cout <<.",
    cfg: `<io_statement> ::= 'cout' '<<' <expression> ';'`
  },
  {
    id: "io_in",
    title: "C++ Stream Input (cin)",
    badge: "08 Stream In",
    desc: "Standard C++ stream extraction input statement for reading into designated identifiers via cin >>.",
    cfg: `<io_statement> ::= 'cin' '>>' <identifier> ';'`
  }
];

/**
 * Counts non-empty lines in a BNF text block to determine applied rule counts.
 * @param {string} text - Raw BNF rules string.
 * @returns {number} - Count of valid non-empty lines.
 */
export function countBnfRules(text) {
  // If text is null or empty, return 0
  if (!text) return 0;
  // Split into lines, trim whitespace, and count non-empty entries
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean).length;
}
