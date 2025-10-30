import { Outlet, useLocation } from "react-router-dom";
import "./App.css";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { BlogProvider } from "./context/BlogContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ActualiteProvider } from "./context/ActualiteContext";

function App() {
  const location = useLocation();
  const clientId = import.meta.env.VITE_GOOGLE_AUTH;

  // Header affiché sur toutes les pages sauf Homepage ("/")
  const showHeader = location.pathname !== "/";

  // Footer affiché uniquement sur ces pages :
  const footerRoutes = ["/accueil", "/contact", "/profile", "/about"];
  const showFooter = footerRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5ef] text-gray-800">
      <GoogleOAuthProvider clientId={clientId}>
        <AuthProvider>
          <BlogProvider>
            <ActualiteProvider>
              {showHeader && <Header />}

              <main className="flex-1">
                <Outlet />
              </main>

              {showFooter && <Footer />}
            </ActualiteProvider>
          </BlogProvider>
        </AuthProvider>
      </GoogleOAuthProvider>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
