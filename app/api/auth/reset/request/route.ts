import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildPasswordResetUrl,
  canExposeDevelopmentResetUrl,
  createPasswordResetToken,
  sendPasswordResetEmail,
} from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email manzili noto'g'ri."),
});

const genericSuccess = {
  message:
    "Agar bu email bilan akkaunt mavjud bo'lsa, parolni tiklash havolasi yuborildi.",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Email manzilini tekshiring." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true },
    });

    if (!user?.email) {
      // Deliberately do not disclose whether this email has an account.
      return NextResponse.json(genericSuccess);
    }

    const { token, tokenHash, expires } = createPasswordResetToken();
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({
        data: { userId: user.id, token: tokenHash, expires },
      }),
    ]);

    const resetUrl = buildPasswordResetUrl(token);
    const delivery = await sendPasswordResetEmail({ email: user.email, resetUrl });

    // Local setup should remain testable before SMTP credentials are available.
    // The token is never exposed by a production response.
    if (canExposeDevelopmentResetUrl()) {
      return NextResponse.json({
        ...genericSuccess,
        ...(delivery !== "sent" ? { resetUrl } : {}),
      });
    }

    return NextResponse.json(genericSuccess);
  } catch (error) {
    // Keep the same response shape so this endpoint cannot be used for account
    // enumeration. The server log retains diagnostic context for operators.
    console.error("Password reset request failed", error);
    return NextResponse.json(genericSuccess);
  }
}
