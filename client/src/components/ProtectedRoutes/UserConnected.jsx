import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function UserConnected({ children }) {
  const { userConnected } = useAuth();

  return userConnected ? children : <Navigate to="/login" />;
}
