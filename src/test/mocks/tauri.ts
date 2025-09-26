import { vi } from "vitest";

export const mockTauriAPI = () => {
  const dragRegion = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
  (window as unknown as Record<string, unknown>)["__TAURI_DRAG_REGION__"] = dragRegion;
};
