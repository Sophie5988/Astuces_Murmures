// ============================================================================
// src/components/Auth/RequireAuth.jsx
// ---------------------------------------------------------------------------
// Garde de route simple : si pas connecté -> redirect /login
// Usage (ex.) :
//   <Route path="/actualites/preview" element={
//      <RequireAuth><ActualitePreview /></RequireAuth>
//   } />
// ============================================================================
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth({ children }) {
  const { userConnected } = useAuth();
  const location = useLocation();

  if (!userConnected) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
