import { createHash, randomBytes } from "node:crypto";

import nodemailer from "nodemailer";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export type PasswordResetDelivery = "sent" | "not-configured" | "failed";

export function createPasswordResetToken() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: hashPasswordResetToken(token),
    expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  };
}

/** Store only a hash, so a database copy cannot be used as a reset link. */
export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function buildPasswordResetUrl(token: string) {
  const configuredUrl = [
    process.env.NEXTAUTH_URL,
    process.env.AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ]
    .map((value) => value?.trim())
    .find(Boolean);

  let baseUrl: URL;

  try {
    baseUrl = new URL(configuredUrl ?? "http://localhost:3000");
  } catch {
    baseUrl = new URL("http://localhost:3000");
  }

  if (!configuredUrl && process.env.VERCEL_URL) {
    baseUrl = new URL(`https://${process.env.VERCEL_URL}`);
  }

  const resetUrl = new URL("/reset-password", baseUrl);
  resetUrl.searchParams.set("token", token);
  return resetUrl.toString();
}

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim();
  if (!host || !from) {
    return null;
  }

  const parsedPort = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD;

  return {
    host,
    from,
    port,
    secure: port === 465,
    ...(user && pass ? { auth: { user, pass } } : {}),
  };
}

export async function sendPasswordResetEmail({
  email,
  resetUrl,
}: {
  email: string;
  resetUrl: string;
}): Promise<PasswordResetDelivery> {
  const config = smtpConfig();
  if (!config) {
    return "not-configured";
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      ...(config.auth ? { auth: config.auth } : {}),
    });

    await transporter.sendMail({
      from: config.from,
      to: email,
      subject: "Deutsch.gg parolini tiklash",
      text: [
        "Deutsch.gg parolini tiklash uchun quyidagi havolani oching:",
        resetUrl,
        "",
        "Havola 1 soat davomida amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, xatni e'tiborsiz qoldiring.",
      ].join("\n"),
      html: `
        <p>Deutsch.gg parolini tiklash uchun quyidagi havolani oching:</p>
        <p><a href="${resetUrl}">Parolni tiklash</a></p>
        <p>Havola 1 soat davomida amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, xatni e'tiborsiz qoldiring.</p>
      `,
    });
    return "sent";
  } catch (error) {
    console.error("Password reset email could not be sent", error);
    return "failed";
  }
}

export function canExposeDevelopmentResetUrl() {
  return process.env.NODE_ENV === "development";
}
