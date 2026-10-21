"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  activeWorkspace,
  createEmptyState,
  portalReducer,
} from "@/lib/portal/state";
import { readStoredState, writeStoredState } from "@/lib/portal/storage";
import type {
  DemoWorkspace,
  PortalAction,
  PortalState,
} from "@/lib/portal/types";

type Context = {
  ready: boolean;
  state: PortalState;
  workspace: DemoWorkspace | null;
  dispatch: Dispatch<PortalAction>;
};
const PortalContext = createContext<Context | null>(null);
export function PortalProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState({
    ready: false,
    state: createEmptyState(),
  });
  useEffect(() => {
    setSnapshot({ ready: true, state: readStoredState() });
  }, []);
  useEffect(() => {
    if (snapshot.ready) writeStoredState(snapshot.state);
  }, [snapshot]);
  const dispatch = useCallback(
    (action: PortalAction) =>
      setSnapshot((previous) =>
        previous.ready
          ? { ...previous, state: portalReducer(previous.state, action) }
          : previous,
      ),
    [],
  );
  const value = useMemo(
    () => ({
      ...snapshot,
      workspace: activeWorkspace(snapshot.state),
      dispatch,
    }),
    [snapshot, dispatch],
  );
  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}
export function usePortal() {
  const value = useContext(PortalContext);
  if (!value) throw new Error("PortalProvider is required");
  return value;
}
