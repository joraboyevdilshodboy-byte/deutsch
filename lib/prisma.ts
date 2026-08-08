import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Keep a single client during Next.js hot reloads. Creating a new client per
 * request quickly exhausts SQLite connections in development.
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function isDatabaseConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as Error & { code?: string }).code;
  const message = error.message.toLowerCase();

  return (
    code === "P2010" ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P2024" ||
    message.includes("server selection timeout") ||
    message.includes("no available servers") ||
    message.includes("internalerror")
  );
}
