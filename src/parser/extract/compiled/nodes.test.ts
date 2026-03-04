import { describe, expect, it } from 'vitest'
import { extractCompiledASTNodes } from './nodes'

// Helper to create a minimal AST for testing
function createAST(body: unknown[]) {
  return { body }
}

describe('extractCompiledASTNodes', () => {
  it('should extract named exports from variable declarations', async () => {
    const ast = createAST([
      {
        type: 'ExportNamedDeclaration',
        declaration: {
          type: 'VariableDeclaration',
          declarations: [
            { id: { type: 'Identifier', name: 'Primary' } },
          ],
        },
      },
    ])

    const result = await extractCompiledASTNodes({ ast, filename: 'test.stories.vue' })

    expect(result.exports).toEqual(['Primary'])
    expect(result.defaultExport).toBeNull()
  })

  it('should extract named exports from function declarations', async () => {
    const ast = createAST([
      {
        type: 'ExportNamedDeclaration',
        declaration: {
          type: 'FunctionDeclaration',
          id: { name: 'myFunction' },
        },
      },
    ])

    const result = await extractCompiledASTNodes({ ast, filename: 'test.stories.vue' })

    expect(result.exports).toEqual(['myFunction'])
  })

  it('should extract default export', async () => {
    const declaration = { type: 'ObjectExpression', properties: [] }
    const ast = createAST([
      { type: 'ExportDefaultDeclaration', declaration },
    ])

    const result = await extractCompiledASTNodes({ ast, filename: 'test.stories.vue' })

    expect(result.defaultExport).toBe(declaration)
  })

  it('should track sb-addon-vue-csf imports', async () => {
    const ast = createAST([
      {
        type: 'ImportDeclaration',
        source: { value: 'sb-addon-vue-csf' },
        specifiers: [
          { type: 'ImportSpecifier', imported: { type: 'Identifier', name: 'defineMeta' } },
          { type: 'ImportSpecifier', imported: { type: 'Identifier', name: 'Story' } },
        ],
      },
    ])

    const result = await extractCompiledASTNodes({ ast, filename: 'test.stories.vue' })

    expect(result.storyImports).toEqual(['defineMeta', 'Story'])
  })

  it('should not track imports from other packages', async () => {
    const ast = createAST([
      {
        type: 'ImportDeclaration',
        source: { value: 'vue' },
        specifiers: [
          { type: 'ImportSpecifier', imported: { type: 'Identifier', name: 'ref' } },
        ],
      },
    ])

    const result = await extractCompiledASTNodes({ ast, filename: 'test.stories.vue' })

    expect(result.storyImports).toEqual([])
  })

  it('should handle empty AST body', async () => {
    const ast = createAST([])

    const result = await extractCompiledASTNodes({ ast, filename: 'test.stories.vue' })

    expect(result.exports).toEqual([])
    expect(result.defaultExport).toBeNull()
    expect(result.storyImports).toEqual([])
  })

  it('should handle multiple exports together', async () => {
    const ast = createAST([
      {
        type: 'ImportDeclaration',
        source: { value: 'sb-addon-vue-csf' },
        specifiers: [
          { type: 'ImportSpecifier', imported: { type: 'Identifier', name: 'defineMeta' } },
        ],
      },
      {
        type: 'ExportNamedDeclaration',
        declaration: {
          type: 'VariableDeclaration',
          declarations: [
            { id: { type: 'Identifier', name: 'Primary' } },
            { id: { type: 'Identifier', name: 'Secondary' } },
          ],
        },
      },
      {
        type: 'ExportDefaultDeclaration',
        declaration: { type: 'Identifier', name: '_sfc_main' },
      },
    ])

    const result = await extractCompiledASTNodes({ ast, filename: 'test.stories.vue' })

    expect(result.exports).toEqual(['Primary', 'Secondary'])
    expect(result.defaultExport).toEqual({ type: 'Identifier', name: '_sfc_main' })
    expect(result.storyImports).toEqual(['defineMeta'])
  })
})
