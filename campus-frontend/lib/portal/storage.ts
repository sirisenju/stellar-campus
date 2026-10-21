import { createEmptyState, decodeState } from "./state";
import type { PortalState } from "./types";
export const STORAGE_KEY = "stellarcampus.portal.v1";
export function readStoredState(): PortalState {
  try {
    return decodeState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return createEmptyState();
  }
}
export function writeStoredState(state: PortalState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
