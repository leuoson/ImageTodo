import { invoke } from '@tauri-apps/api/core'

/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  filename?: string
}

/**
 * Screenshot result from Rust backend
 */
interface ScreenshotBackendResult {
  success: boolean
  path?: string
  error?: string
}

/**
 * Screenshot result for frontend
 */
export interface ScreenshotResult {
  success: boolean
  path?: string
  error?: string
}

/**
 * Take a screenshot using native screen capture (xcap)
 */
export async function takeScreenshot(
  _options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  try {
    const result = await invoke<ScreenshotBackendResult>('capture_screenshot')

    if (!result.success) {
      throw new Error(result.error || 'Screenshot failed')
    }

    return {
      success: true,
      path: result.path
    }
  } catch (error) {
    console.error('Screenshot failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Take screenshot and automatically download
 */
export async function takeAndDownloadScreenshot(
  options: ScreenshotOptions = {}
): Promise<void> {
  const result = await takeScreenshot(options)

  if (!result.success) {
    throw new Error(result.error || 'Screenshot failed')
  }

  console.log('Screenshot saved to:', result.path)
}

/**
 * Check if screenshot functionality is available
 */
export function isScreenshotSupported(): boolean {
  // xcap is always available in Tauri environment
  return true
}

/**
 * Get screenshot capabilities
 */
export function getScreenshotCapabilities() {
  return {
    supported: true,
    formats: ['png'] as const,
    nativeCapture: true
  }
}
