import html2canvas from 'html2canvas'

/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  element?: HTMLElement
  filename?: string
  quality?: number
  format?: 'png' | 'jpeg'
  width?: number
  height?: number
}

/**
 * Screenshot result
 */
export interface ScreenshotResult {
  dataUrl: string
  blob: Blob
  filename: string
}

/**
 * Take a screenshot of the current page or specific element
 */
export async function takeScreenshot(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
  const {
    element = document.body,
    filename = `screenshot-${Date.now()}.png`,
    quality = 0.9,
    format = 'png',
    width,
    height
  } = options

  try {
    // Configure html2canvas options
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      scale: window.devicePixelRatio || 1,
      width: width,
      height: height,
      backgroundColor: null, // Transparent background
      removeContainer: true,
      logging: false, // Disable console logs
      imageTimeout: 15000, // 15 second timeout for images
      onclone: (clonedDoc) => {
        // Remove any elements that shouldn't be in screenshot
        const elementsToRemove = clonedDoc.querySelectorAll('[data-screenshot-exclude]')
        elementsToRemove.forEach(el => el.remove())
      }
    })

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL(`image/${format}`, quality)

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      }, `image/${format}`, quality)
    })

    return {
      dataUrl,
      blob,
      filename
    }
  } catch (error) {
    console.error('Screenshot failed:', error)
    throw new Error('Failed to take screenshot')
  }
}

/**
 * Download screenshot as file
 */
export function downloadScreenshot(result: ScreenshotResult): void {
  try {
    const link = document.createElement('a')
    link.download = result.filename
    link.href = result.dataUrl
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Download failed:', error)
    throw new Error('Failed to download screenshot')
  }
}

/**
 * Copy screenshot to clipboard
 */
export async function copyScreenshotToClipboard(result: ScreenshotResult): Promise<void> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported')
    }

    const clipboardItem = new ClipboardItem({
      [result.blob.type]: result.blob
    })

    await navigator.clipboard.write([clipboardItem])
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    throw new Error('Failed to copy screenshot to clipboard')
  }
}

/**
 * Take screenshot of the entire application window
 */
export async function takeAppScreenshot(): Promise<ScreenshotResult> {
  // Find the main app container
  const appElement = document.querySelector('[data-tauri-drag-region]')?.parentElement || document.body
  
  return takeScreenshot({
    element: appElement as HTMLElement,
    filename: `imagetodo-screenshot-${Date.now()}.png`
  })
}

/**
 * Take screenshot and automatically download
 */
export async function takeAndDownloadScreenshot(options: ScreenshotOptions = {}): Promise<void> {
  try {
    const result = await takeScreenshot(options)
    downloadScreenshot(result)
  } catch (error) {
    console.error('Screenshot and download failed:', error)
    throw error
  }
}

/**
 * Take screenshot and copy to clipboard
 */
export async function takeAndCopyScreenshot(options: ScreenshotOptions = {}): Promise<void> {
  try {
    const result = await takeScreenshot(options)
    await copyScreenshotToClipboard(result)
  } catch (error) {
    console.error('Screenshot and copy failed:', error)
    throw error
  }
}

/**
 * Check if screenshot functionality is available
 */
export function isScreenshotSupported(): boolean {
  try {
    // Check if html2canvas is available
    if (typeof html2canvas !== 'function') {
      return false
    }

    // Check if canvas is supported
    const canvas = document.createElement('canvas')
    if (!canvas.getContext || !canvas.getContext('2d')) {
      return false
    }

    return true
  } catch (error) {
    console.error('Screenshot support check failed:', error)
    return false
  }
}

/**
 * Get screenshot capabilities
 */
export function getScreenshotCapabilities() {
  return {
    supported: isScreenshotSupported(),
    clipboardSupported: !!(navigator.clipboard && navigator.clipboard.write),
    downloadSupported: true, // Always supported in browsers
    formats: ['png', 'jpeg'] as const
  }
}
