import { register, unregister, isRegistered } from '@tauri-apps/plugin-global-shortcut'

// Currently registered shortcuts
let currentShortcut: string | null = null // Full screenshot shortcut
let currentRegionCaptureShortcut: string | null = null // Region capture shortcut

/**
 * Convert shortcut format to Tauri-compatible format
 */
function convertToTauriFormat(shortcut: string): string {
  // Tauri global shortcut format: modifier+key (lowercase)
  const parts = shortcut.split('+').map(part => part.trim())
  const converted = parts.map(part => {
    switch (part.toLowerCase()) {
      case 'ctrl': return 'ctrl'
      case 'cmd': return 'cmd'
      case 'alt': return 'alt'
      case 'shift': return 'shift'
      default: return part.toLowerCase()
    }
  })
  return converted.join('+')
}

/**
 * Register a global shortcut for screenshot functionality
 */
export async function registerScreenshotShortcut(shortcut: string): Promise<void> {
  if (!shortcut || shortcut.trim() === '') {
    throw new Error('Shortcut cannot be empty')
  }

  console.log(`Attempting to register shortcut: ${shortcut}`)

  try {
    // Unregister current shortcut if exists
    if (currentShortcut) {
      console.log(`Unregistering current shortcut: ${currentShortcut}`)
      await unregisterScreenshotShortcut()
    }

    // Convert shortcut format for Tauri (might need different format)
    const tauriShortcut = convertToTauriFormat(shortcut)
    console.log(`Converted shortcut format: ${tauriShortcut}`)

    // Check if shortcut is already registered by another app
    const alreadyRegistered = await isRegistered(tauriShortcut)
    if (alreadyRegistered) {
      throw new Error('Shortcut is already in use by another application')
    }

    // Register new shortcut
    await register(tauriShortcut, () => {
      console.log(`Shortcut ${tauriShortcut} triggered!`)
      // Trigger screenshot functionality
      handleScreenshotTrigger()
    })

    currentShortcut = shortcut
    console.log(`Global shortcut registered successfully: ${shortcut} (Tauri format: ${tauriShortcut})`)
  } catch (error) {
    console.error('Failed to register global shortcut:', error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('already in use') || error.message.includes('conflict')) {
        throw new Error('Shortcut conflicts with system shortcuts')
      }
      if (error.message.includes('invalid') || error.message.includes('format')) {
        throw new Error('Invalid shortcut combination')
      }
    }

    throw new Error('Failed to register shortcut')
  }
}

/**
 * Unregister the current global shortcut
 */
export async function unregisterScreenshotShortcut(): Promise<void> {
  if (!currentShortcut) {
    return
  }

  try {
    const tauriShortcut = convertToTauriFormat(currentShortcut)
    await unregister(tauriShortcut)
    console.log(`Global shortcut unregistered: ${currentShortcut} (Tauri format: ${tauriShortcut})`)
    currentShortcut = null
  } catch (error) {
    console.error('Failed to unregister global shortcut:', error)
    // Don't throw error for unregistration failures
    currentShortcut = null
  }
}

/**
 * Update global shortcut (unregister old and register new)
 */
export async function updateScreenshotShortcut(newShortcut: string): Promise<void> {
  if (newShortcut === currentShortcut) {
    return // No change needed
  }

  if (!newShortcut || newShortcut.trim() === '') {
    // Clear shortcut
    await unregisterScreenshotShortcut()
    return
  }

  await registerScreenshotShortcut(newShortcut)
}

/**
 * Get currently registered shortcut
 */
export function getCurrentShortcut(): string | null {
  return currentShortcut
}

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

/**
 * Handle screenshot trigger
 */
function handleScreenshotTrigger(): void {
  console.log('Screenshot shortcut triggered!')

  // Import screenshot function dynamically to avoid circular dependencies
  import('@/lib/screenshot').then(({ takeAndDownloadScreenshot }) => {
    takeAndDownloadScreenshot()
      .then(() => {
        console.log('Screenshot taken successfully')
        // Show success notification
        import('sonner').then(({ toast }) => {
          toast.success('截图已保存')
        }).catch(() => {
          // Fallback if toast fails
          console.log('Screenshot saved successfully')
        })
      })
      .catch((error) => {
        console.error('Screenshot failed:', error)
        // Show error notification
        import('sonner').then(({ toast }) => {
          toast.error('截图失败')
        }).catch(() => {
          // Fallback if toast fails
          console.error('Screenshot failed')
        })
      })
  }).catch((error) => {
    console.error('Failed to load screenshot module:', error)
  })
}

/**
 * Initialize shortcuts on app startup
 */
export async function initializeShortcuts(shortcut?: string): Promise<void> {
  try {
    if (shortcut && shortcut.trim() !== '') {
      await registerScreenshotShortcut(shortcut)
    }
  } catch (error) {
    console.error('Failed to initialize shortcuts:', error)
    // Don't throw error during initialization to prevent app startup failure
  }
}

/**
 * Cleanup shortcuts on app shutdown
 */
export async function cleanupShortcuts(): Promise<void> {
  try {
    await unregisterScreenshotShortcut()
  } catch (error) {
    console.error('Failed to cleanup shortcuts:', error)
    // Don't throw error during cleanup
  }
}

/**
 * Test if global shortcut system is available
 */
export async function isShortcutSystemAvailable(): Promise<boolean> {
  try {
    // Try to register and immediately unregister a test shortcut
    const testShortcut = 'ctrl+shift+f12'
    console.log('Testing shortcut system with:', testShortcut)
    await register(testShortcut, () => {
      console.log('Test shortcut triggered!')
    })
    await unregister(testShortcut)
    console.log('Shortcut system is available')
    return true
  } catch (error) {
    console.error('Global shortcut system not available:', error)
    return false
  }
}
