import type { SFCDescriptor } from '@vue/compiler-sfc'
import { parse } from '@vue/compiler-sfc'

export interface VueSfcAst {
  descriptor: SFCDescriptor
  errors: (Error | SyntaxError)[]
}

/**
 * Parse Vue SFC code into AST
 */
export function getVueSfcAST({ code, filename }: { code: string, filename: string }): VueSfcAst {
  const { descriptor, errors } = parse(code, {
    filename,
    sourceMap: false,
  })

  return {
    descriptor,
    errors: errors as (Error | SyntaxError)[],
  }
}

/**
 * Check if the file is a Vue stories file
 */
export function isVueStoriesFile(filename: string): boolean {
  return /\.stories\.vue$/.test(filename)
}
