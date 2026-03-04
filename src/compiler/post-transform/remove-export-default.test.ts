import { describe, expect, it } from 'vitest'
import MagicString from 'magic-string'
import type { CompiledNodes } from '$lib/parser/extract/compiled/nodes'
import { removeExportDefault } from './remove-export-default'

function createNodes(defaultExport: unknown = { start: 15, end: 30 }): CompiledNodes {
  return {
    exports: [],
    defaultExport,
    storyImports: [],
  }
}

describe('removeExportDefault', () => {
  it('should replace export default with variable declaration', () => {
    const code = new MagicString('export default _sfc_main')
    const nodes = createNodes({ start: 15, end: 24 })
    removeExportDefault(code, nodes)

    expect(code.toString()).toBe('const __vueCsfComponent = _sfc_main')
  })

  it('should handle export default with extra whitespace', () => {
    const code = new MagicString('export  default  _sfc_main')
    // No AST positions, fallback to regex
    const nodes = createNodes({})
    removeExportDefault(code, nodes)

    expect(code.toString()).toContain('const __vueCsfComponent = ')
  })

  it('should not modify code when no default export node', () => {
    const code = new MagicString('const foo = "bar"')
    const nodes = createNodes(null)
    removeExportDefault(code, nodes)

    expect(code.toString()).toBe('const foo = "bar"')
  })

  it('should preserve surrounding code', () => {
    const input = 'import { ref } from "vue";\nexport default _sfc_main;\nconst x = 1;'
    const code = new MagicString(input)
    const nodes = createNodes({})
    removeExportDefault(code, nodes)

    const result = code.toString()
    expect(result).toContain('import { ref } from "vue"')
    expect(result).toContain('const __vueCsfComponent = ')
    expect(result).toContain('const x = 1')
    expect(result).not.toContain('export default')
  })
})
