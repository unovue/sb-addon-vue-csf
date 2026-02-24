/**
 * This file extracts nodes from compiled Vue code
 * After Vue compiles the SFC, we need to find specific patterns
 * to transform the code for Storybook CSF
 */

export interface CompiledNodes {
  // Export statements found in the compiled code
  exports: string[]
  // Default export if any
  defaultExport: unknown | null
  // Story-related imports
  storyImports: string[]
}

/**
 * Extract nodes from compiled JavaScript AST
 */
export async function extractCompiledASTNodes({
  ast,
  // eslint-disable-next-line unused-imports/no-unused-vars
  filename,
}: {
  ast: unknown
  filename: string
}): Promise<CompiledNodes> {
  const exports: string[] = []
  let defaultExport: unknown | null = null
  const storyImports: string[] = []

  // Walk the AST to find exports
  for (const node of (ast as any).body) {
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration) {
        if (node.declaration.type === 'VariableDeclaration') {
          for (const decl of node.declaration.declarations) {
            if (decl.id && decl.id.type === 'Identifier') {
              exports.push(decl.id.name)
            }
          }
        }
        else if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
          exports.push(node.declaration.id.name)
        }
      }
    }
    else if (node.type === 'ExportDefaultDeclaration') {
      defaultExport = node.declaration
    }
    else if (node.type === 'ImportDeclaration') {
      // Track imports from sb-addon-vue-csf
      if (node.source.value === 'sb-addon-vue-csf') {
        for (const spec of node.specifiers) {
          if (spec.type === 'ImportSpecifier' && spec.imported.type === 'Identifier') {
            storyImports.push(spec.imported.name)
          }
        }
      }
    }
  }

  return {
    exports,
    defaultExport,
    storyImports,
  }
}
