import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { z } from "zod";

import { hasDatabaseConfig, prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

function normalizeAppUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function resolveAppBaseUrl() {
  const isVercel = Boolean(process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL);

  const explicitCandidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    "https://deutsch.gg",
    "https://www.deutsch.gg",
    "https://deutsch-gg.vercel.app",
  ]
    .map((value) => value?.trim())
    .filter(Boolean) as string[];

  for (const candidate of explicitCandidates) {
    const normalized = normalizeAppUrl(candidate);
    if (!normalized.includes("localhost") && !normalized.includes("127.0.0.1")) {
      return normalized;
    }
  }

  if (isVercel || process.env.NODE_ENV === "production") {
    return "https://deutsch-gg.vercel.app";
  }

  return "http://localhost:3000";
}

const appBaseUrl = resolveAppBaseUrl();

process.env.NEXTAUTH_URL = appBaseUrl;
process.env.AUTH_URL = appBaseUrl;

type AppUser = {
  id: string;
  level?: string | null;
  sessionVersion?: number;
  streak?: number;
  longestStreak?: number;
  totalXp?: number;
};

const providers: Array<
  | ReturnType<typeof CredentialsProvider>
  | ReturnType<typeof GoogleProvider>
> = [
  CredentialsProvider({
    name: "Email va parol",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Parol", type: "password" },
    },
    async authorize(credentials) {
      const parsedCredentials = credentialsSchema.safeParse(credentials);

      if (!parsedCredentials.success) {
        return null;
      }

      const { email, password } = parsedCredentials.data;

      if (!hasDatabaseConfig) {
        return null;
      }

      try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordMatches = await compare(password, user.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          level: user.level,
          sessionVersion: user.sessionVersion,
        };
      } catch (error) {
        console.error("Auth authorize error:", error);
        return null;
      }
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthConfig = {
  trustHost: true,
  providers,
  useSecureCookies: process.env.NODE_ENV === "production",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "production"
      ? undefined
      : "deutsch-gg-local-development-secret-change-me"),
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email?.trim().toLowerCase();
      if (!email) {
        return false;
      }

      if (!hasDatabaseConfig) {
        return false;
      }

      try {
        const appUser = await prisma.user.upsert({
          where: { email },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            emailVerified: new Date(),
          },
          create: {
            email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
          },
        });

        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {
            userId: appUser.id,
            type: account.type,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state:
              typeof account.session_state === "string"
                ? account.session_state
                : undefined,
          },
          create: {
            userId: appUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state:
              typeof account.session_state === "string"
                ? account.session_state
                : undefined,
          },
        });

        (user as AppUser).id = appUser.id;
        (user as AppUser).level = appUser.level;
        (user as AppUser).sessionVersion = appUser.sessionVersion;
        return true;
      } catch (error) {
        console.error("Google sign-in could not be persisted", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        const appUser = user as AppUser;
        token.id = appUser.id;
        token.level = appUser.level;
        token.sessionVersion = appUser.sessionVersion ?? 0;
        token.streak = appUser.streak ?? 0;
        token.longestStreak = appUser.longestStreak ?? 0;
        token.totalXp = appUser.totalXp ?? 0;
      } else if (token.id) {
        if (!hasDatabaseConfig || process.env.NEXT_RUNTIME === "edge") {
          return token;
        }

        try {
          const currentUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              level: true,
              sessionVersion: true,
              streak: true,
              longestStreak: true,
              totalXp: true,
            },
          });
          if (!currentUser || currentUser.sessionVersion !== token.sessionVersion) {
            return {};
          }
          token.level = currentUser.level;
          token.streak = currentUser.streak;
          token.longestStreak = currentUser.longestStreak;
          token.totalXp = currentUser.totalXp;
        } catch (error) {
          console.error("Could not verify auth session", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? token.sub ?? "";
        session.user.level = token.level as string | undefined;
        session.user.streak = (token.streak as number | undefined) ?? 0;
        session.user.longestStreak = (token.longestStreak as number | undefined) ?? 0;
        session.user.totalXp = (token.totalXp as number | undefined) ?? 0;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
