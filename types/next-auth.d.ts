import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      level?: string | null;
      streak?: number;
      longestStreak?: number;
      totalXp?: number;
    };
  }

  interface User {
    level?: string | null;
    sessionVersion?: number;
    streak?: number;
    longestStreak?: number;
    totalXp?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    level?: string | null;
    sessionVersion?: number;
    streak?: number;
    longestStreak?: number;
    totalXp?: number;
  }
}
