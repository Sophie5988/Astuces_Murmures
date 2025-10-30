// serveur/src/email/email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const {
  EMAIL_USER,
  EMAIL_PASS,
  MODE,
  API_URL, // ex: "http://localhost:5000"
  DEPLOY_BACK_URL, // ex: "https://ton-backend.com"
} = process.env;

// Transporteur Nodemailer (Gmail)
// - garde "tls.rejectUnauthorized=false" comme tu l'avais (utile en dev/proxy)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, // ⚠️ mot de passe d’application Gmail (pas ton mdp normal)
  },
  tls: { rejectUnauthorized: false },
});

console.log(EMAIL_USER);

// Construit l’URL de vérification vers ton backend
// ✅ on garde EXACTEMENT la route qui marchait chez toi : /user/verifyMail/:token
function buildVerifyUrl(token) {
  const base = MODE === "development" ? API_URL : DEPLOY_BACK_URL;
  return `${base}/user/verifyMail/${token}`;
}

// Envoi de l’email de confirmation d’inscription
export const sendConfirmationEmail = async (email, token) => {
  const verifyUrl = buildVerifyUrl(token);

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Confirmation d'inscription",
    html: `
      <p>Bienvenue sur notre site !</p>
      <p>Cliquez sur le lien suivant pour valider votre inscription :</p>
      <p><a href="${verifyUrl}">Confirmer</a></p>
      <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
      <p>${verifyUrl}</p>
    `,
  };

  console.log("MAIL CREATED");
  await transporter.sendMail(mailOptions);
  console.log("MAIL SEND");
};

export default transporter;
