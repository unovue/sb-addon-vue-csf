/**
 * Converts a story name to a valid JavaScript export name
 * e.g., 'My story!' -> 'MyStory', 'my-story' -> 'MyStory', 'WithCustomTemplate' -> 'WithCustomTemplate'
 */
export function storyNameToExportName(name: string): string {
  return storyIdToExportName(storyNameToId(name))
}

/**
 * Converts a story name to a kebab-case ID
 * e.g., 'WithCustomTemplate' -> 'with-custom-template', 'Start Case' -> 'start-case'
 */
function storyNameToId(name: string): string {
  // Add a space before all caps to separate words in PascalCase, then sanitize
  const withSpaces = name.replace(/([A-Z])/g, ' $1').trim()
  // Convert to kebab-case: lowercase and replace spaces/special chars with hyphens
  return sanitize(withSpaces)
}

/**
 * Converts a kebab-case story ID to an export name
 * e.g., 'some-story' -> 'SomeStory'
 */
function storyIdToExportName(storyId: string): string {
  return storyId
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * Sanitize a string to a valid story ID (kebab-case)
 * Removes illegal characters and converts spaces to hyphens
 */
function sanitize(name: string): string {
  return (
    name
      // Remove special characters except letters, numbers, spaces, and hyphens
      .replace(/[^a-z0-9\s-]/gi, '')
      // Replace spaces and multiple hyphens with single hyphen
      .replace(/[\s-]+/g, '-')
      .toLowerCase()
  )
}

/**
 * Validates if a string is a valid JavaScript identifier
 */
export function isValidIdentifier(name: string): boolean {
  return /^[a-z_$][\w$]*$/i.test(name)
}
