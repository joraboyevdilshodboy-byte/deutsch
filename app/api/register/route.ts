import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isDatabaseConnectionError, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const registrationSchema = z.object({
  name: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(2, "Ism kamida 2 belgidan iborat bo'lishi kerak.").max(80).optional(),
  ),
  email: z.string().trim().toLowerCase().email("Email manzili noto'g'ri."),
  password: z
    .string()
    .min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak.")
    .max(128, "Parol juda uzun."),
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Yuborilgan ma'lumot JSON bo'lishi kerak." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Ma'lumotlarni tekshiring.",
      },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email bilan akkaunt allaqachon mavjud." },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, level: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Bu email bilan akkaunt allaqachon mavjud." },
        { status: 409 },
      );
    }

    if (isDatabaseConnectionError(error)) {
      console.error("Registration failed because the database is unavailable", error);
      return NextResponse.json(
        { error: "Ma'lumotlar bazasi sozlamalari mavjud emas yoki noto'g'ri. Vercel environment variablesni tekshiring." },
        { status: 503 },
      );
    }

    console.error("Registration failed", error);
    return NextResponse.json(
      { error: "Akkaunt yaratib bo'lmadi. Keyinroq qayta urinib ko'ring." },
      { status: 500 },
    );
  }
}
