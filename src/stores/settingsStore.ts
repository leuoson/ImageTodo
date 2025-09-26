import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { IsoDateString } from "@/types";

export type ThemeOption = "light" | "dark" | "system";
export type FontSizeOption = "small" | "medium" | "large";
export type BackgroundType = "glass" | "transparent" | "solid" | "semi";

export interface BackgroundSettings {
  readonly type: BackgroundType;
  readonly opacity: number;
  readonly color?: string;
  readonly glassIntensity?: number;
}

export interface WindowSettings {
  readonly position: { readonly x: number; readonly y: number };
  readonly size: { readonly width: number; readonly height: number };
  readonly alwaysOnTop: boolean;
  readonly pinned: boolean;
  readonly opacity: number;
}

export interface AppearanceSettings {
  readonly theme: ThemeOption;
  readonly fontSize: FontSizeOption;
  readonly background: BackgroundSettings;
}

export interface AppPreferences {
  readonly autoStart: boolean;
  readonly minimizeToTray: boolean;
  readonly showInDock: boolean;
  readonly autoBackup: boolean;
  readonly backupInterval: number;
}

export interface SyncSettings {
  readonly enabled: boolean;
  readonly provider: "none" | "custom";
  readonly lastSyncTime: IsoDateString | null;
  readonly autoSync: boolean;
}

export interface AppSettings {
  readonly version: string;
  readonly window: WindowSettings;
  readonly appearance: AppearanceSettings;
  readonly app: AppPreferences;
  readonly sync: SyncSettings;
}

export interface SettingsStoreState {
  readonly settings: AppSettings;
  readonly lastUpdatedAt: IsoDateString | null;
}

export interface SettingsStoreActions {
  readonly setTheme: (theme: ThemeOption) => void;
  readonly setFontSize: (size: FontSizeOption) => void;
  readonly updateBackground: (background: Partial<BackgroundSettings>) => void;
  readonly updateWindow: (updates: Partial<WindowSettings>) => void;
  readonly updateWindowPosition: (position: Partial<WindowSettings["position"]>) => void;
  readonly updateAppPreferences: (updates: Partial<AppPreferences>) => void;
  readonly recordSyncTime: (timestamp: IsoDateString) => void;
  readonly reset: () => void;
}

export type SettingsStore = SettingsStoreState & SettingsStoreActions;

const now = (): IsoDateString => new Date().toISOString() as IsoDateString;

const defaultSettings: AppSettings = {
  version: "1.0.0",
  window: {
    position: { x: 100, y: 100 },
    size: { width: 320, height: 400 },
    alwaysOnTop: false,
    pinned: false,
    opacity: 1,
  },
  appearance: {
    theme: "system",
    fontSize: "medium",
    background: {
      type: "glass",
      opacity: 0.9,
      glassIntensity: 0.6,
      color: "#ffffff",
    },
  },
  app: {
    autoStart: false,
    minimizeToTray: true,
    showInDock: true,
    autoBackup: false,
    backupInterval: 60,
  },
  sync: {
    enabled: false,
    provider: "none",
    lastSyncTime: null,
    autoSync: false,
  },
};

const defaultState: SettingsStoreState = {
  settings: defaultSettings,
  lastUpdatedAt: null,
};

const persistKey = "imagetodo-settings";

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setTheme(theme) {
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, theme },
          },
          lastUpdatedAt: now(),
        }));
      },
      setFontSize(size) {
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: { ...state.settings.appearance, fontSize: size },
          },
          lastUpdatedAt: now(),
        }));
      },
      updateBackground(partial) {
        set((state) => ({
          settings: {
            ...state.settings,
            appearance: {
              ...state.settings.appearance,
              background: { ...state.settings.appearance.background, ...partial },
            },
          },
          lastUpdatedAt: now(),
        }));
      },
      updateWindow(updates) {
        set((state) => ({
          settings: {
            ...state.settings,
            window: { ...state.settings.window, ...updates },
          },
          lastUpdatedAt: now(),
        }));
      },
      updateWindowPosition(position) {
        set((state) => ({
          settings: {
            ...state.settings,
            window: {
              ...state.settings.window,
              position: { ...state.settings.window.position, ...position },
            },
          },
          lastUpdatedAt: now(),
        }));
      },
      updateAppPreferences(updates) {
        set((state) => ({
          settings: {
            ...state.settings,
            app: { ...state.settings.app, ...updates },
          },
          lastUpdatedAt: now(),
        }));
      },
      recordSyncTime(timestamp) {
        set((state) => ({
          settings: {
            ...state.settings,
            sync: { ...state.settings.sync, lastSyncTime: timestamp },
          },
          lastUpdatedAt: timestamp,
        }));
      },
      reset() {
        set({ ...defaultState });
        localStorage.removeItem(persistKey);
      },
    }),
    {
      name: persistKey,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    },
  ),
);

export const getSettingsStoreState = () => useSettingsStore.getState();

export const resetSettingsStoreState = () => {
  useSettingsStore.setState({ ...defaultState });
  localStorage.removeItem(persistKey);
};
