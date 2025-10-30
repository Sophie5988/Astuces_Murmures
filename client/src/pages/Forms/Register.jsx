import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { signUp } from "../../api/auth.api";
import { useEffect } from "react";
import bgFormulaire from "../../assets/images/formulaire BIS.webp"; // 🔹 Image de fond pour la page login

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const message = params.get("message");
  console.log(message);

  useEffect(() => {
    if (message === "error") {
      toast.error("Délai dépassé. Veuillez vous réinscrire");
      navigate("/register", { replace: true });
    } else if (message === "success") {
      toast.success("Inscription validée");
      navigate("/");
    }
  }, [message, navigate]);

  const defaultValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    rgpd: false,
  };

  const schema = yup.object({
    username: yup.string().required("Ce champ est obligatoire"),
    email: yup
      .string()
      .email()
      .required("Le champ est obligatoire")
      .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Format email non valide"),
    password: yup
      .string()
      .required("Le mot de passe est obligatoire")
      .min(5, "Trop court")
      .max(10, "trop long"),
    confirmPassword: yup
      .string()
      .required("La confirmation de mot de passe est obligatoire")
      .oneOf(
        [yup.ref("password"), ""],
        "Les mots de passe ne correspondent pas"
      ),
    rgpd: yup
      .boolean()
      .oneOf([true], "Vous devez accepter les termes et conditions"),
  });

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

  async function submit(values) {
    try {
      // faire appel à une méthode qui fait la requete HTTP
      const responseFromBackend = await signUp(values);
      if (responseFromBackend.message !== "Déjà inscrit") {
        toast.success(responseFromBackend.message);
        navigate("/login");
        reset(defaultValues);
      } else {
        toast.error(responseFromBackend.message);
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div
      className="w-full min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgFormulaire})` }} // 🔹 Image en background
    >
      {/* --- Conteneur du cadre de connexion --- */}
      <div className="max-w-3xl bg-[#ddd9c4] w-450 h-230 mt-1 p-6 ml-15 rounded-2xl shadow-[5px_5px_5px_rgba(0,0,0,0.65)] hover:shadow-[8px_8px_8px_rgba(0,0,0,0.7)]">
        {/* --- Titre principal --- */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mt-3 mb-5">
          Inscription
        </h1>

        <form
          className="flex flex-col gap-4 mb-5 mx-auto max-w-[400px]"
          onSubmit={handleSubmit(submit)}
        >
          <div className="flex flex-col mb-1">
            <label htmlFor="username" className="mb-1">
              Pseudo*
            </label>
            <input
              {...register("username")}
              type="text"
              id="username"
              className="text-lg w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed] mt-2 mb-5"
            />
            {errors.username && (
              <p className="text-red-500">{errors.username.message}</p>
            )}
          </div>
          <div className="flex flex-col mb-1">
            <label htmlFor="email" className="mb-1">
              Email*
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className="text-lg w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed] mt-2 mb-5"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col mb-1">
            <label htmlFor="password" className="mb-1">
              Mot de passe*
            </label>
            <input
              {...register("password")}
              type="password"
              id="password"
              className="text-lg w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed] mt-2 mb-5"
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col mb-1">
            <label htmlFor="confirmPassword" className="mb-1">
              Confirmation du mot de passe*
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              id="confirmPassword"
              className="text-lg w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 focus:outline-none bg-[#f5f2ed] mt-2 mb-5"
            />
            {errors.confirmPassword && (
              <p className="text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="flex flex-col mb-1">
            <label htmlFor="rgpd" className="mb-1">
              <input
                {...register("rgpd")}
                type="checkbox"
                className="mr-4"
                id="rgpd"
              />
              En soumettant ce formulaire, j’accepte les conditions générales
              ainsi que la politique de confidentialité. En fournissant vos
              informations personnelles, vous consentez à leur traitement afin
              de répondre à votre demande et à ce que nous vous contactions par
              les coordonnées fournies. Pour plus d’informations, veuillez
              consulter{" "}
              <NavLink
                to="/politique"
                className="text-green-500 hover:underline"
              >
                notre politique de confidentialité
              </NavLink>
            </label>
            {errors.rgpd && (
              <p className="text-red-500">{errors.rgpd.message}</p>
            )}
          </div>
          <NavLink to="/login" className="text-blue-600 text-semibold">
            Déjà inscrit ?
          </NavLink>
          <button className="bg-[#b3aa7b] text-white px-4 py-2 rounded hover:bg-[#68613c]">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
