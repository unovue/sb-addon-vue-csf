import { describe, expect, it } from 'vitest'
import {
  isValidIdentifier,
  storyNameToExportName,
} from './identifier-utils.ts'

describe('identifier-utils', () => {
  describe('storyNameToExportName', () => {
    it('should convert simple names', () => {
      expect(storyNameToExportName('Primary')).toBe('Primary')
      expect(storyNameToExportName('Secondary')).toBe('Secondary')
    })

    it('should convert names with spaces', () => {
      expect(storyNameToExportName('My Story')).toBe('MyStory')
      expect(storyNameToExportName('Another Story Name')).toBe('AnotherStoryName')
    })

    it('should convert names with special characters', () => {
      expect(storyNameToExportName('My story!')).toBe('MyStory')
      expect(storyNameToExportName('Story #1')).toBe('Story1')
    })

    it('should convert names with hyphens', () => {
      expect(storyNameToExportName('my-story')).toBe('MyStory')
      expect(storyNameToExportName('my-long-story-name')).toBe('MyLongStoryName')
    })

    it('should preserve PascalCase names', () => {
      expect(storyNameToExportName('WithCustomTemplate')).toBe('WithCustomTemplate')
      expect(storyNameToExportName('PascalCase')).toBe('PascalCase')
    })
  })

  describe('isValidIdentifier', () => {
    it('should return true for valid identifiers', () => {
      expect(isValidIdentifier('myVar')).toBe(true)
      expect(isValidIdentifier('MyVar')).toBe(true)
      expect(isValidIdentifier('_private')).toBe(true)
      expect(isValidIdentifier('$dollar')).toBe(true)
      expect(isValidIdentifier('var123')).toBe(true)
    })

    it('should return false for invalid identifiers', () => {
      expect(isValidIdentifier('123var')).toBe(false)
      expect(isValidIdentifier('my-var')).toBe(false)
      expect(isValidIdentifier('my var')).toBe(false)
      expect(isValidIdentifier('my.var')).toBe(false)
    })
  })
})
