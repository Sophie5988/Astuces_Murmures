// serveur/src/controllers/user.controller.js
// ============================================================================
// 🧠 User Controller — Auth, Profil & Compte
// ----------------------------------------------------------------------------
// 🎯 MODIF MINIMALE (sans rien casser ailleurs) :
// - Cookies d'auth adaptés à l'environnement (DEV vs PROD) pour que le token
//   soit bien stocké sur http://localhost:5173 (DEV) et envoyé aux routes
//   protégées (/user/profile), ce qui débloque la persistance du profil.
// - Harmonisation des options cookies entre login / googleAuth / logout.
// - Le reste du code (register, verifyMail, updateProfile, etc.) est conservé.
// ----------------------------------------------------------------------------
// Rappels :
// - En DEV (HTTP), un cookie `secure: true` est ignoré par le navigateur.
// - sameSite diffère selon le contexte :
//     • DEV (même machine, souvent même domaine/port) : "Lax" suffit.
//     • PROD (front et API sur domaines différents) : "None" + secure: true.
// ============================================================================

import User from "../models/user.schema.js";
import TempUser from "../models/tempuser.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendConfirmationEmail } from "../email/email.js";
import dotenv from "dotenv";

dotenv.config();

// ============================================================================
// ⚙️ Options cookies (DEV vs PROD)
// ----------------------------------------------------------------------------
// - isProd : détecte production via MODE ou NODE_ENV
// - cookieBase : options communes (httpOnly, path)
// - cookieEnv  : variantes sécurisées selon environnement
// - cookieOpts : options finales utilisées dans login / googleAuth / logout
// ============================================================================
const isProd =
  process.env.MODE === "production" || process.env.NODE_ENV === "production";

const cookieBase = {
  httpOnly: true, // 🔒 non lisible côté JS
  path: "/", // dispo sur tout le site
};

const cookieEnv = isProd
  ? {
      // 🌐 PROD (front & API séparés, HTTPS) :
      secure: true,
      sameSite: "None",
    }
  : {
      // 💻 DEV (http://localhost) :
      // secure: false permet le stockage du cookie en HTTP
      secure: false,
      sameSite: "Lax",
    };

const cookieOpts = {
  ...cookieBase,
  ...cookieEnv,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

// ============================================================================
// Helpers
// ============================================================================
const createTokenEmail = (email) => {
  return jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "30m" });
};

// ============================================================================
// REGISTER (inchangé)
// ============================================================================
export const register = async (req, res) => {
  try {
    console.log("[register] payload:", req.body);

    const { username, email, password } = req.body;
    const existingUserMail = await User.findOne({ email });
    const existingUserPseudo = await User.findOne({ username });
    const existingTempUserMail = await TempUser.findOne({ email });
    const existingTempUserPseudo = await TempUser.findOne({ username });

    if (existingUserMail || existingUserPseudo) {
      return res.status(400).json({ message: "Déjà inscrit" });
    } else if (existingTempUserMail || existingTempUserPseudo) {
      return res.status(400).json({ message: "Vérifiez vos email" });
    }

    const token = createTokenEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const tempUser = new TempUser({
      username,
      email,
      password: hashedPassword,
      token,
    });
    await tempUser.save();

    console.log("[register] TempUser créé, envoi de l'email…");

    try {
      await sendConfirmationEmail(email, token);
    } catch (err) {
      console.error("[register] Envoi email échoué => suppression TempUser");
      await TempUser.deleteOne({ email });
      return res.status(500).json({
        message:
          "Échec d'envoi de l'email de confirmation. Vérifiez la configuration email du serveur.",
      });
    }

    res.status(200).json({
      message:
        "Veuillez confirmer votre inscription en consultant votre boite mail",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================================================================
// LOGIN — 🍪 Dépôt du cookie avec options DEV/PROD correctes
// ============================================================================
export const login = async (req, res) => {
  const { password } = req.body;
  const data = req.body?.data ?? req.body?.email ?? req.body?.username ?? null;

  console.log("[login] body:", req.body);

  if (!data || !password) {
    return res
      .status(400)
      .json({ message: "Identifiant ou mot de passe manquant" });
  }

  let user;
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  try {
    if (emailRegex.test(data)) {
      user = await User.findOne({ email: data });
    } else {
      user = await User.findOne({ username: data });
    }

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou nom d'utilisateur incorrect" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // 🎫 JWT subject = user id
    const token = jwt.sign({}, process.env.SECRET_KEY, {
      subject: user._id.toString(),
      expiresIn: "7d",
      algorithm: "HS256",
    });

    // 🍪 Cookie HTTPOnly — DEV: secure=false/sameSite=Lax, PROD: secure=true/sameSite=None
    res.cookie("token", token, cookieOpts);

    // On renvoie l'utilisateur (tel que tu le fais déjà)
    return res.status(200).json({ user, message: "Connexion réussie" });
  } catch (err) {
    console.error("[login] error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================================================================
// VERIFY MAIL (inchangé)
// ============================================================================
export const verifyMail = async (req, res) => {
  const { token } = req.params;
  console.log("[verifyMail] token:", token);

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const tempUser = await TempUser.findOne({ email: decoded.email, token });
    console.log("[verifyMail] tempUser:", tempUser);

    if (!tempUser) {
      return res.redirect(
        `${
          process.env.MODE === "development"
            ? process.env.CLIENT_URL
            : process.env.DEPLOY_FRONT_URL
        }/register?message=error`
      );
    }

    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
    });
    await newUser.save();
    await TempUser.deleteOne({ email: tempUser.email });

    res.redirect(
      `${
        process.env.MODE === "development"
          ? process.env.CLIENT_URL
          : process.env.DEPLOY_FRONT_URL
      }/register?message=success`
    );
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.redirect(
        `${
          process.env.MODE === "development"
            ? process.env.CLIENT_URL
            : process.env.DEPLOY_FRONT_URL
        }/register?message=error`
      );
    }
    return res.redirect(
      `${
        process.env.MODE === "development"
          ? process.env.CLIENT_URL
          : process.env.DEPLOY_FRONT_URL
      }/register?message=error`
    );
  }
};

// ============================================================================
// 🔎 currentUser — renvoie l'utilisateur connecté (sans password)
// ============================================================================
export const currentUser = async (req, res) => {
  const { token } = req.cookies;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
      const currentUser = await User.findById(decodedToken.sub).select(
        "-password"
      );

      if (currentUser) {
        res.status(200).json(currentUser);
      } else {
        res.status(400).json(null);
      }
    } catch (error) {
      res.status(400).json(null);
    }
  } else {
    res.status(400).json(null);
  }
};

// ============================================================================
// 🚪 logout — clearCookie avec les mêmes options (pour bien effacer le cookie)
// ============================================================================
export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    ...cookieBase,
    ...cookieEnv,
  });
  res.status(200).json({ message: "Déconnexion réussie" });
};

// ============================================================================
// ✏️ updateProfile — Mise à jour du profil utilisateur
// - Conserve ta logique existante (avatar + password)
// - Ajoute la persistance des champs civils (firstName, lastName, address,
//   postalCode→zip, city, phone) pour que le Header affiche le prénom.
// ============================================================================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      currentPassword,
      newPassword,
      avatar,
      firstName,
      lastName,
      address,
      postalCode, // front
      city,
      phone,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    // 🔐 Mot de passe (si demandé)
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Mot de passe actuel incorrect" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // 🖼️ Avatar (si fourni)
    if (avatar) user.avatar = avatar;

    // 👤 Champs civils (si fournis)
    if (typeof firstName === "string") user.firstName = firstName;
    if (typeof lastName === "string") user.lastName = lastName;
    if (typeof address === "string") user.address = address;
    if (typeof city === "string") user.city = city;
    if (typeof phone === "string") user.phone = phone;

    // 📮 Code postal : front = postalCode → DB = zip
    if (typeof postalCode === "string") user.zip = postalCode;

    await user.save();

    // Retour "propre" (sans password)
    const safeUser = await User.findById(user._id).select("-password");
    return res.status(200).json(safeUser);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Erreur serveur" });
  }
};

// ============================================================================
// 🔐 Google OAuth — utilise les mêmes options cookies que login()
// ============================================================================
export const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const profile = await response.json();

    if (profile.error) {
      return res.status(400).json({ message: "Token Google invalide" });
    }

    const { sub, email, name, picture } = profile;
    let user = await User.findOne({ email });

    if (!user) {
      let username = name;
      let existingUser = await User.findOne({ username });

      if (existingUser) {
        username = `${name}_${Date.now()}`;
      }
      user = await User.create({
        username,
        email,
        avatar: picture,
        provider: "google",
        googleId: sub,
      });
    } else {
      if (user.provider !== "google") {
        return res
          .status(400)
          .json({ message: "Email déjà utilisé avec un autre méthode" });
      }
    }

    const jwtToken = jwt.sign({}, process.env.SECRET_KEY, {
      subject: user._id.toString(),
      expiresIn: "7d",
      algorithm: "HS256",
    });

    // 🍪 même stratégie cookie qu'au login
    res.cookie("token", jwtToken, cookieOpts);

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Echec authentification google" });
  }
};
