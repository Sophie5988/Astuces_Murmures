// client/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  signUp,
  signIn,
  authGoogle,
  getCurrentUser,
  signout,
  updateUserProfile,
} from "../api/auth.api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userConnected, setUserConnected] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Charge l'utilisateur au démarrage (cookie httpOnly)
  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentUser();
        setUserConnected(me ?? null);
      } catch {
        setUserConnected(null);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  const login = async (values) => {
    const res = await signIn(values);
    if (res?.user) setUserConnected(res.user);
    return res;
  };

  const register = async (values) => {
    return await signUp(values);
  };

  const loginWithGoogle = async (values) => {
    const res = await authGoogle(values);
    if (res) setUserConnected(res);
    return res;
  };

  const refreshUser = async () => {
    const me = await getCurrentUser();
    setUserConnected(me ?? null);
    return me;
  };

  const saveProfile = async (data) => {
    const updated = await updateUserProfile(data);
    if (updated?._id) setUserConnected(updated);
    return updated;
  };

  const logout = async () => {
    try {
      await signout();
    } finally {
      setUserConnected(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userConnected,
        loadingUser,
        login,
        register,
        loginWithGoogle,
        refreshUser,
        saveProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
