import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPasswordResetToken } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const confirmationSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i, "Tiklash havolasi yaroqsiz."),
  password: z
    .string()
    .min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak.")
    .max(128, "Parol juda uzun."),
});

const invalidTokenResponse = () =>
  NextResponse.json(
    { error: "Tiklash havolasi yaroqsiz yoki muddati tugagan." },
    { status: 400 },
  );

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const parsed = confirmationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ma'lumotlarni tekshiring." },
      { status: 400 },
    );
  }

  const tokenHash = hashPasswordResetToken(parsed.data.token);

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      select: { userId: true, expires: true },
    });

    if (!resetToken) {
      return invalidTokenResponse();
    }

    if (resetToken.expires <= new Date()) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } });
      return invalidTokenResponse();
    }

    const passwordHash = await hash(parsed.data.password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          sessionVersion: { increment: 1 },
        },
      }),
      // One use invalidates all outstanding reset links for the account.
      prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
    ]);

    return NextResponse.json({
      message: "Parol yangilandi. Endi yangi parol bilan tizimga kirishingiz mumkin.",
    });
  } catch (error) {
    console.error("Password reset confirmation failed", error);
    return invalidTokenResponse();
  }
}
