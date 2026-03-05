import { describe, expect, it } from 'vitest'
import { serializeArgs } from './serialize-args'

describe('serializeArgs', () => {
  it('should serialize primitives', () => {
    expect(serializeArgs(true)).toBe('true')
    expect(serializeArgs(false)).toBe('false')
    expect(serializeArgs(42)).toBe('42')
    expect(serializeArgs(3.14)).toBe('3.14')
    expect(serializeArgs(null)).toBe('null')
    expect(serializeArgs(undefined)).toBe('undefined')
  })

  it('should serialize strings with single quotes', () => {
    expect(serializeArgs('hello')).toBe('\'hello\'')
    expect(serializeArgs('Button')).toBe('\'Button\'')
  })

  it('should escape single quotes in strings', () => {
    expect(serializeArgs('it\'s')).toBe('\'it\\\'s\'')
  })

  it('should serialize simple objects inline', () => {
    expect(serializeArgs({ primary: true })).toBe('{ primary: true }')
    expect(serializeArgs({ label: 'Button' })).toBe('{ label: \'Button\' }')
  })

  it('should serialize objects with multiple keys', () => {
    const result = serializeArgs({ primary: true, label: 'Button' })
    expect(result).toBe('{ primary: true, label: \'Button\' }')
  })

  it('should serialize empty objects', () => {
    expect(serializeArgs({})).toBe('{}')
  })

  it('should serialize empty arrays', () => {
    expect(serializeArgs([])).toBe('[]')
  })

  it('should serialize arrays inline when short', () => {
    expect(serializeArgs([1, 2, 3])).toBe('[1, 2, 3]')
    expect(serializeArgs(['a', 'b'])).toBe('[\'a\', \'b\']')
  })

  it('should use multiline for large objects', () => {
    const result = serializeArgs({
      primary: true,
      label: 'This is a very long label for a button component',
      size: 'large',
    })
    expect(result).toContain('\n')
    expect(result).toContain('primary: true')
    expect(result).toContain('label: \'This is a very long label for a button component\'')
    expect(result).toContain('size: \'large\'')
  })

  it('should handle nested objects', () => {
    const result = serializeArgs({ style: { color: 'red' } })
    expect(result).toContain('style: { color: \'red\' }')
  })

  it('should quote non-identifier keys', () => {
    const result = serializeArgs({ 'my-key': true })
    expect(result).toContain('\'my-key\': true')
  })

  it('should not quote valid identifier keys', () => {
    const result = serializeArgs({ myKey: true })
    expect(result).toBe('{ myKey: true }')
  })
})
