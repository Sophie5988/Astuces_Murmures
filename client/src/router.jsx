// ===============================
// router.jsx - Routes principales (corrigé)
// ===============================
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Register from "./pages/Forms/Register";
import Login from "./pages/Forms/Login";
import Profile from "./pages/Profile/Profile.jsx";
import Contact from "./pages/Contact/Conctact.jsx";
import ErrorPage from "./pages/ErrorPage";
import { rootLoader } from "./loaders/rootLoader";
import UserNotConnected from "./components/ProtectedRoutes/UserNotConnected";
import USerConnected from "./components/ProtectedRoutes/USerConnected";
import AdminLogin from "./pages/Admin/AdminLogin";

// ********* PAGES *********
import Homepage from "./pages/Homepage/Homepage"; // Page d’ouverture
import Accueil from "./pages/Accueil/Accueil.jsx"; // Vraie page d’accueil
import Blog from "./pages/Blog/Blog.jsx";
import BlogDetails from "./pages/Blog/BlogDetails";
import About from "./pages/About/About.jsx";
import Eshop from "./pages/Eshop/Eshop.jsx";
import Panier from "./pages/Eshop/Panier.jsx";
import Politique from "./pages/Politique/Politique.jsx";
import Mentions from "./pages/Mentions/Mentions.jsx";
import Cgv from "./pages/Cgv/Cgv.jsx";
import Pci from "./pages/Pci/Pci.jsx";
import Livraison from "./pages/Eshop/Livraison.jsx";
import BlogLibrary from "./pages/Blog/BlogLibrary";
import Actualites from "./pages/Actualites/Actualites.jsx";

// Actualités
import ActualitePreview from "./pages/Actualites/ActualitePreview.jsx";
import ActualiteDetail from "./pages/Actualites/ActualiteDetail.jsx";

// ADMIN
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";

// =============================================
// ROUTER
// =============================================
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    children: [
      { path: "/", element: <Homepage /> },
      { path: "/accueil", element: <Accueil /> },

      // Connexions
      {
        path: "/register",
        element: (
          <UserNotConnected>
            <Register />
          </UserNotConnected>
        ),
      },
      {
        path: "/login",
        element: (
          <UserNotConnected>
            <Login />
          </UserNotConnected>
        ),
      },

      // Profil utilisateur (protégé)
      {
        path: "/profile",
        element: (
          <USerConnected>
            <Profile />
          </USerConnected>
        ),
      },

      // Pages
      { path: "/contact", element: <Contact /> },
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:id", element: <BlogDetails /> },
      { path: "/blog/list", element: <BlogLibrary /> },
      { path: "/actualites", element: <Actualites /> },
      { path: "/about", element: <About /> },
      { path: "/eshop", element: <Eshop /> },
      { path: "/panier", element: <Panier /> },

      // Actualités detail
      { path: "/actualites/preview", element: <ActualitePreview /> },
      { path: "/actualites/detail", element: <ActualiteDetail /> },

      // Admin
      { path: "/admin", element: <AdminDashboard /> },
      { path: "/admin/login", element: <AdminLogin /> },

      // Réglementations
      { path: "/politique", element: <Politique /> },
      { path: "/mentions", element: <Mentions /> },
      { path: "/pci", element: <Pci /> },
      { path: "/cgv", element: <Cgv /> },
      { path: "/livraison", element: <Livraison /> },
    ],
  },
]);
