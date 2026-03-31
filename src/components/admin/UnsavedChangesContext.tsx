"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface UnsavedChangesContextValue {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  confirmNavigation: (proceed: () => void) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue>({
  isDirty: false,
  setDirty: () => {},
  confirmNavigation: (proceed) => proceed(),
});

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);

  // Warn on browser close/refresh
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const setDirty = useCallback((dirty: boolean) => setIsDirty(dirty), []);

  const confirmNavigation = useCallback((proceed: () => void) => {
    if (!isDirty) {
      proceed();
      return;
    }
    setPending(() => proceed);
  }, [isDirty]);

  const handleConfirm = () => {
    setIsDirty(false);
    setPending(null);
    pending?.();
  };

  const handleCancel = () => setPending(null);

  return (
    <UnsavedChangesContext.Provider value={{ isDirty, setDirty, confirmNavigation }}>
      {children}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-serif text-lg text-dark mb-2">Unsaved changes</h3>
            <p className="font-sans font-light text-sm text-dark/60 mb-5">
              You have unsaved changes on this page. If you leave now, they&apos;ll be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-dark text-white font-sans text-sm hover:bg-dark/80 transition-colors"
              >
                Leave anyway
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-dark/10 text-dark font-sans text-sm hover:bg-stone transition-colors"
              >
                Keep editing
              </button>
            </div>
          </div>
        </div>
      )}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  return useContext(UnsavedChangesContext);
}
