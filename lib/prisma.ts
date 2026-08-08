import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const hasDatabaseConfig = Boolean(process.env.DATABASE_URL?.trim());

function createUnavailablePrismaClient(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get() {
      throw new Error("DATABASE_URL is not configured. Set a valid MongoDB connection string before using Prisma.");
    },
  });
}

/**
 * Keep a single client during Next.js hot reloads. Creating a new client per
 * request quickly exhausts SQLite connections in development.
 */
export const prisma = globalForPrisma.prisma ?? (hasDatabaseConfig ? new PrismaClient() : createUnavailablePrismaClient());

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
    message.includes("internalerror") ||
    message.includes("must provide a nonempty url") ||
    message.includes("environment variable `database_url`")
  );
}
