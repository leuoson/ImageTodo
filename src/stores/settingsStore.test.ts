import { beforeEach, describe, expect, it } from "vitest";

import {
  getSettingsStoreState,
  resetSettingsStoreState,
  useSettingsStore,
} from "@/stores/settingsStore";
import type { IsoDateString } from "@/types";

beforeEach(() => {
  resetSettingsStoreState();
  localStorage.clear();
});

describe("settingsStore", () => {
  it("updates theme and background", () => {
    useSettingsStore.getState().setTheme("dark");
    useSettingsStore.getState().updateBackground({ opacity: 0.5 });

    const { settings } = getSettingsStoreState();
    expect(settings.appearance.theme).toBe("dark");
    expect(settings.appearance.background.opacity).toBe(0.5);
  });

  it("updates window settings and app preferences", () => {
    useSettingsStore.getState().updateWindow({ alwaysOnTop: true });
    useSettingsStore.getState().updateWindowPosition({ x: 256 });
    useSettingsStore.getState().updateAppPreferences({ autoBackup: true });

    const { settings } = getSettingsStoreState();
    expect(settings.window.alwaysOnTop).toBe(true);
    expect(settings.window.position.x).toBe(256);
    expect(settings.app.autoBackup).toBe(true);
  });

  it("records sync timestamps", () => {
    const timestamp = new Date().toISOString() as IsoDateString;
    useSettingsStore.getState().recordSyncTime(timestamp);

    const state = getSettingsStoreState();
    expect(state.settings.sync.lastSyncTime).toBe(timestamp);
    expect(state.lastUpdatedAt).toBe(timestamp);
  });

  it("resets to defaults", () => {
    useSettingsStore.getState().setTheme("dark");
    useSettingsStore.getState().reset();
    const state = getSettingsStoreState();
    expect(state.settings.appearance.theme).toBe("system");
  });
});
