import { load } from '@tauri-apps/plugin-store'
import { type Locale } from '@/lib/i18n'

// Settings data structure
export interface AppSettings {
  locale: Locale
  screenshotShortcut: string
}

// Default settings
export const defaultSettings: AppSettings = {
  locale: 'zh-CN',
  screenshotShortcut: 'Alt+P'
}

// Store file name
const SETTINGS_STORE = 'settings.json'

/**
 * Save settings to Tauri store
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const store = await load(SETTINGS_STORE, { autoSave: true, defaults: {} })
    await store.set('settings', settings)
    await store.save()
  } catch (error) {
    console.error('Failed to save settings:', error)
    throw new Error('Failed to save settings')
  }
}

/**
 * Load settings from Tauri store
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const store = await load(SETTINGS_STORE, { autoSave: true, defaults: {} })
    const savedSettings = await store.get<AppSettings>('settings')
    
    if (savedSettings) {
      // Merge with defaults to ensure all properties exist
      return {
        ...defaultSettings,
        ...savedSettings
      }
    }
    
    return defaultSettings
  } catch (error) {
    console.error('Failed to load settings:', error)
    // Return defaults if loading fails
    return defaultSettings
  }
}

/**
 * Update a specific setting
 */
export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  try {
    const currentSettings = await loadSettings()
    const updatedSettings = {
      ...currentSettings,
      [key]: value
    }
    await saveSettings(updatedSettings)
  } catch (error) {
    console.error(`Failed to update setting ${key}:`, error)
    throw new Error(`Failed to update setting ${key}`)
  }
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(): Promise<void> {
  try {
    await saveSettings(defaultSettings)
  } catch (error) {
    console.error('Failed to reset settings:', error)
    throw new Error('Failed to reset settings')
  }
}

/**
 * Check if settings store exists
 */
export async function hasSettings(): Promise<boolean> {
  try {
    const store = await load(SETTINGS_STORE, { autoSave: true, defaults: {} })
    const settings = await store.get<AppSettings>('settings')
    return settings !== null && settings !== undefined
  } catch (error) {
    console.error('Failed to check settings existence:', error)
    return false
  }
}

/**
 * Validate settings object
 */
export function validateSettings(settings: any): settings is AppSettings {
  if (!settings || typeof settings !== 'object') {
    return false
  }

  // Check locale
  if (!settings.locale || !['en', 'zh-CN'].includes(settings.locale)) {
    return false
  }

  // Check screenshotShortcut (can be empty string)
  if (typeof settings.screenshotShortcut !== 'string') {
    return false
  }

  return true
}

/**
 * Migrate settings from old format if needed
 */
export async function migrateSettings(): Promise<void> {
  try {
    const store = await load(SETTINGS_STORE, { autoSave: true, defaults: {} })
    const rawSettings = await store.get('settings')
    
    if (rawSettings && !validateSettings(rawSettings)) {
      console.warn('Invalid settings format detected, resetting to defaults')
      await resetSettings()
    }
  } catch (error) {
    console.error('Failed to migrate settings:', error)
    // If migration fails, reset to defaults
    await resetSettings()
  }
}
