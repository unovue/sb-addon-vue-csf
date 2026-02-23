/**
 * ESTree type declarations
 */

declare module 'estree' {
  export interface Node {
    type: string
    loc?: {
      start: { line: number, column: number }
      end: { line: number, column: number }
    }
  }

  export interface Program extends Node {
    type: 'Program'
    body: Statement[]
  }

  export interface Statement extends Node {}

  export interface Expression extends Node {}

  export interface ImportDeclaration extends Statement {
    type: 'ImportDeclaration'
    source: { value: string }
    specifiers: ImportSpecifier[]
  }

  export interface ImportSpecifier extends Node {
    type: 'ImportSpecifier'
    imported: Identifier
    local: Identifier
  }

  export interface ExportNamedDeclaration extends Statement {
    type: 'ExportNamedDeclaration'
    declaration: VariableDeclaration | FunctionDeclaration | null
    specifiers: ExportSpecifier[]
  }

  export interface ExportDefaultDeclaration extends Statement {
    type: 'ExportDefaultDeclaration'
    declaration: Expression | FunctionDeclaration | ClassDeclaration
  }

  export interface VariableDeclaration extends Statement {
    type: 'VariableDeclaration'
    declarations: VariableDeclarator[]
    kind: 'var' | 'let' | 'const'
  }

  export interface VariableDeclarator extends Node {
    type: 'VariableDeclarator'
    id: Identifier
    init?: Expression
  }

  export interface FunctionDeclaration extends Statement {
    type: 'FunctionDeclaration'
    id: Identifier | null
    params: Pattern[]
    body: BlockStatement
  }

  export interface ClassDeclaration extends Statement {
    type: 'ClassDeclaration'
    id: Identifier
  }

  export interface BlockStatement extends Statement {
    type: 'BlockStatement'
    body: Statement[]
  }

  export interface Identifier extends Node {
    type: 'Identifier'
    name: string
  }

  export interface ExportSpecifier extends Node {
    type: 'ExportSpecifier'
    local: Identifier
    exported: Identifier
  }

  export interface Pattern extends Node {}
}
