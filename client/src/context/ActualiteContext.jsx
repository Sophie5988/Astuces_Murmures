// ============================================================================
// client/src/context/ActualiteContext.jsx
// ---------------------------------------------------------------------------
// Contexte Actualités (frontend)
// - Affiche pending en DEV si VITE_SHOW_PENDING=true (fichier .env.local côté client)
// - Affiche approved en PROD (flag absent).
// - Expose { actualites, addActualite } ; addActualite pousse en mémoire
//   (rendu optimiste après publication).
// ============================================================================

import { useContext, useEffect, useState, createContext } from "react";
import { useAuth } from "./AuthContext";
import { fetchActualites } from "../api/actualites";

const ActualiteContext = createContext();

export function ActualiteProvider({ children }) {
  const [actualites, setActualites] = useState([]);
  const { userConnected } = useAuth() || {};

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const showPending = import.meta.env.VITE_SHOW_PENDING === "true";

        const params = {
          page: 1,
          limit: 50,
          sortBy: "createdAt",
          order: "desc",
          ...(showPending ? { status: "pending" } : { status: "approved" }),
        };

        const data = await fetchActualites(params);

        if (!cancelled) {
          if (Array.isArray(data)) setActualites(data);
          else if (data?.items && Array.isArray(data.items))
            setActualites(data.items);
          else setActualites([]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[ActualiteContext] fetch error:", err?.message || err);
          setActualites([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userConnected?._id]);

  const addActualite = (values) => {
    setActualites((prev) => [values, ...prev]);
  };

  return (
    <ActualiteContext.Provider value={{ actualites, addActualite }}>
      {children}
    </ActualiteContext.Provider>
  );
}

export function useActualite() {
  return useContext(ActualiteContext);
}
