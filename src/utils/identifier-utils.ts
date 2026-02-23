/**
 * Converts a story name to a valid JavaScript export name
 * e.g., 'My story!' -> 'MyStory', 'my-story' -> 'MyStory'
 */
export function storyNameToExportName(name: string): string {
  return (
    name
      // Remove special characters except letters, numbers, spaces, and hyphens
      .replace(/[^a-z0-9\s-]/gi, '')
      // Split on spaces and hyphens
      .split(/[\s-]+/)
      // Capitalize first letter of each word
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      // Join without spaces
      .join('')
  )
}

/**
 * Validates if a string is a valid JavaScript identifier
 */
export function isValidIdentifier(name: string): boolean {
  return /^[a-z_$][\w$]*$/i.test(name)
}

/**
 * Converts a string to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[^a-z0-9]+(.)/gi, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, chr => chr.toLowerCase())
}

/**
 * Converts a string to PascalCase
 */
export function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str)
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
}
