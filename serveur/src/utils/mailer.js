// serveur/src/utils/mailer.js
// ===================================================================
// Utilitaire d'envoi d'emails (Nodemailer) en ESM.
// Variables lues : EMAIL_USER / EMAIL_PASS
// ===================================================================

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // <-- EMAIL_USER
    pass: process.env.EMAIL_PASS, // <-- EMAIL_PASS (App Password)
  },
});

export async function sendMail(options) {
  const mailOptions = {
    from: `"Astuces & Murmures" <${process.env.EMAIL_USER}>`,
    ...options,
  };
  return transporter.sendMail(mailOptions);
}
