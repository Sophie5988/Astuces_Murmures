// --- Importations nécessaires ---
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { authGoogle, signIn } from "../../api/auth.api";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import bgLogin from "../../assets/images/login.webp"; // 🔹 Image de fond pour la page login

// --- Composant Login ---
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- Valeurs par défaut du formulaire ---
  const defaultValues = {
    data: "",
    password: "",
  };

  // --- Validation du formulaire avec Yup ---
  const schema = yup.object({
    data: yup.string().required("Ce champ est obligatoire"),
    password: yup.string().required("Le mot de passe est obligatoire"),
  });

  // --- Initialisation du formulaire avec react-hook-form ---
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // --- Connexion via Google OAuth ---
  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await authGoogle(tokenResponse);
        if (response.message) {
          toast.error(response.message);
        } else {
          toast.success("Bienvenue");
          login(response);
          navigate("/");
        }
      } catch (error) {
        toast.error("Erreur de connexion via Google");
      }
    },
    onError: () => toast.error("Google Login échoué"),
  });

  // --- Soumission du formulaire classique (Email / Mot de passe) ---
  async function submit(values) {
    try {
      const userConnected = await signIn(values);

      if (userConnected.user) {
        toast.success("Bien connecté");
        login(userConnected.user);

        navigate("/");
        reset(defaultValues);
      } else {
        toast.error(userConnected.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgLogin})` }} // 🔹 Image en background
    >
      {/* --- Conteneur du cadre de connexion --- */}
      <div className="max-w-3xl bg-[#ddd9c4] w-400 h-200 mx-auto mt-5 p-6 rounded-2xl shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)]">
        {/* --- Titre principal --- */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mt-15 mb-5">
          Bienvenue
        </h1>
        <p className="text-lg text-center text-gray-600 mb-15">
          Connectez-vous à votre compte
        </p>

        {/* --- Formulaire de connexion --- */}
        <form
          className="flex flex-col gap-4 mb-6 mx-auto max-w-[400px]"
          onSubmit={handleSubmit(submit)}
        >
          {/* --- Champ Email/Pseudo --- */}
          <div className="text-lg flex flex-col mb-2">
            <label htmlFor="data" className="mb-1 mt-5 font-medium">
              Pseudo ou Email
            </label>
            <input
              {...register("data")}
              type="text"
              id="data"
              className="text-lg w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed] mt-2 mb-10"
            />
            {errors.data && (
              <p className="text-red-500 text-sm">{errors.data.message}</p>
            )}
          </div>

          {/* --- Champ Mot de passe --- */}
          <div className="text-lg flex flex-col mb-2">
            <label htmlFor="password" className="mb-1 font-medium">
              Mot de passe
            </label>
            <input
              {...register("password")}
              type="password"
              id="password"
              className="text-lg w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed] mt-2 mb-10"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* --- Lien vers inscription --- */}
          <NavLink
            to="/register"
            className="text-green-800 text-lg hover:underline"
          >
            Pas encore inscrit ?
          </NavLink>

          {/* --- Bouton de soumission --- */}
          <button className="text-lg w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed] mt-5 mb-10">
            Se connecter
          </button>
        </form>

        {/* --- Bouton connexion Google --- */}
        <button
          onClick={loginGoogle}
          className="w-full h-15 flex justify-center items-center rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed] mt-5 mb-10"
        >
          <FcGoogle className="text-xl" />
          <span className="font-medium text-xl">Se connecter avec Google</span>
        </button>
      </div>
    </div>
  );
}
