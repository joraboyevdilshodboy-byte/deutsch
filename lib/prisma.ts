import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  const configured = process.env.DATABASE_URL?.trim() || process.env.MONGODB_URI?.trim();
  return configured || "";
}

export const hasDatabaseConfig = Boolean(getDatabaseUrl());

function createUnavailablePrismaClient(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get() {
      throw new Error("Database connection is not configured. Set DATABASE_URL or MONGODB_URI to a valid MongoDB connection string before using Prisma.");
    },
  });
}

/**
 * Keep a single client during Next.js hot reloads. Creating a new client per
 * request quickly exhausts SQLite connections in development.
 */
export const prisma = globalForPrisma.prisma ?? (hasDatabaseConfig ? new PrismaClient({ datasources: { db: { url: getDatabaseUrl() } } }) : createUnavailablePrismaClient());

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
