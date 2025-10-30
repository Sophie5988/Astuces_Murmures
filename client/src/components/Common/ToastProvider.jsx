// src/components/Common/ToastProvider.jsx
// ============================================================================
// Provider de toasts minimaliste (ZEN) + hook d’accès.
// ✅ Fix critique : suppression de "this" dans success/info/error,
//    pour éviter l’erreur "can't access property 'push', this is undefined"
//    quand on destructure les méthodes.
// ✅ Si le Provider n’est pas monté → on renvoie un "no-op" (aucun crash).
// ============================================================================

import { createContext, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

// ---- Hook public -----------------------------------------------------------
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    const noop = () => {};
    return { success: noop, info: noop, error: noop, push: noop };
  }
  return ctx;
}

// ---- Provider --------------------------------------------------------------
export default function ToastProvider({ children }) {
  const [items, setItems] = useState([]); // { id, type, msg }

  const api = useMemo(() => {
    const push = (type, msg) => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { id, type, msg }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    const success = (msg) => push("success", msg);
    const info = (msg) => push("info", msg);
    const error = (msg) => push("error", msg);

    return { push, success, info, error };
  }, []);

  return (
    <ToastCtx.Provider value={api}>
      {children}

      {/* Conteneur overlay des toasts */}
      <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-xl shadow-lg px-4 py-3 w-72",
              "border backdrop-blur-sm transition-all duration-300",
              t.type === "success" &&
                "bg-emerald-50/95 border-emerald-200 text-emerald-900",
              t.type === "info" &&
                "bg-blue-50/95 border-blue-200 text-blue-900",
              t.type === "error" &&
                "bg-rose-50/95 border-rose-200 text-rose-900",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <p className="text-sm font-medium">{t.msg}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
