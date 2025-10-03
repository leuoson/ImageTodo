/**
 * Shortcuts library
 *
 * Note: Region capture shortcut is managed by Rust backend.
 * Frontend only saves the configuration to Tauri Store.
 * Rust backend reads the configuration and registers the shortcut.
 */

/**
 * Check if a shortcut is valid format
 */
export function isValidShortcut(shortcut: string): boolean {
  if (!shortcut || shortcut.trim() === '') {
    return false
  }

  // Basic validation for shortcut format
  // Should contain at least one modifier (Ctrl, Cmd, Alt, Shift) and one main key
  const parts = shortcut.split('+').map(part => part.trim())

  if (parts.length < 2) {
    return false
  }

  const modifiers = ['Ctrl', 'Cmd', 'Alt', 'Shift', 'Meta', 'Control']
  const hasModifier = parts.some(part => modifiers.includes(part))

  if (!hasModifier) {
    return false
  }

  // Check for valid main key (letter, number, or function key)
  const mainKeys = parts.filter(part => !modifiers.includes(part))
  if (mainKeys.length !== 1) {
    return false
  }

  const mainKey = mainKeys[0]
  const isValidMainKey = /^[A-Za-z0-9]$/.test(mainKey) || /^F\d+$/.test(mainKey)

  return isValidMainKey
}
