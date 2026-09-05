// Formal BNF definitions, quick preset examples, and supported grammar features

export const EXAMPLES = [
  {
    id: "arithmetic",
    label: "2 + 7",
    code: "2 + 7"
  },
  {
    id: "assign",
    label: "total = a * (b + 2);",
    code: "total = a * (b + 2);"
  },
  {
    id: "decl",
    label: "int x = 10;",
    code: "int x = 10;"
  },
  {
    id: "if-else",
    label: "if (x == 5) y = x + 1; else y = 0;",
    code: "if (x == 5) y = x + 1; else y = 0;"
  },
  {
    id: "while",
    label: "while (count < 10) count = count + 1;",
    code: "while (count < 10) count = count + 1;"
  },
  {
    id: "block",
    label: "Compound Block",
    code: "{\n  int x = 1;\n  y = x + 2;\n  cout << y;\n}"
  },
  {
    id: "cout",
    label: "cout << total;",
    code: 'cout << "Result: " << total;'
  },
  {
    id: "cin",
    label: "cin >> userInput;",
    code: "cin >> userInput;"
  }
];

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

export const GRAMMAR_FEATURES = [
  {
    id: "declarations",
    title: "Variable Declarations",
    badge: "01 Declaration",
    desc: "Typed declarations supporting int, float, double, char, string, and bool types with optional initial assignment.",
    cfg: `<declaration> ::= <type> <identifier> '=' <expression> ';'
                | <type> <identifier> ';'`
  },
  {
    id: "assignments",
    title: "Variable Assignments",
    badge: "02 Assignment",
    desc: "Assignment of evaluated arithmetic expressions or post-fix increment/decrement operations.",
    cfg: `<assignment>          ::= <identifier> '=' <expression> ';'
<increment_statement> ::= <identifier> '++' ';' | <identifier> '--' ';'`
  },
  {
    id: "arithmetic",
    title: "Arithmetic Expressions",
    badge: "03 Expression",
    desc: "Full operator precedence (+, -, *, /, %) with parenthetical sub-expressions and unary negation.",
    cfg: `<expression> ::= <expression> '+' <term> | <expression> '-' <term> | <term>
<term>       ::= <term> '*' <factor> | <term> '/' <factor> | <factor>`
  },
  {
    id: "conditionals",
    title: "Conditional Branching",
    badge: "04 Branching",
    desc: "If and if-else decision statements with relational conditions (==, !=, <, >, <=, >=).",
    cfg: `<if_statement> ::= 'if' '(' <condition> ')' <statement> 'else' <statement>
                  | 'if' '(' <condition> ')' <statement>`
  },
  {
    id: "loops",
    title: "Iteration & Loops",
    badge: "05 Loop",
    desc: "Predictive while loop control structures with evaluated boolean or arithmetic termination criteria.",
    cfg: `<while_statement> ::= 'while' '(' <condition> ')' <statement>`
  },
  {
    id: "blocks",
    title: "Compound Statement Blocks",
    badge: "06 Block",
    desc: "Enclosed scope containing an arbitrary sequence of nested statements between curly braces { ... }.",
    cfg: `<block_statement> ::= '{' <statement_list> '}' | '{' '}'`
  },
  {
    id: "io_out",
    title: "Stream Output (cout)",
    badge: "07 Stream Out",
    desc: "C++ style stream insertion output statement for printing expressions and string literals.",
    cfg: `<io_statement> ::= 'cout' '<<' <expression> ';'`
  },
  {
    id: "io_in",
    title: "Stream Input (cin)",
    badge: "08 Stream In",
    desc: "C++ style stream extraction input statement for reading into designated identifiers.",
    cfg: `<io_statement> ::= 'cin' '>>' <identifier> ';'`
  }
];

export function countBnfRules(text) {
  if (!text) return 0;
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean).length;
}
