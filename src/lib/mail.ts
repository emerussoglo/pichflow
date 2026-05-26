import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Ton adresse gmail
    pass: process.env.GMAIL_APP_PASSWORD, // Le code de 16 caractères
  },
});

export async function sendOTPEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"PichFlow" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: "Votre code de vérification PichFlow",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Vérification de votre compte</h2>
        <p>Merci de rejoindre <strong>PichFlow</strong>. Utilisez le code suivant pour valider votre inscription :</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; padding: 20px; background: #f4f4f4; text-align: center; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #888;">Ce code expirera dans 10 minutes. Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}