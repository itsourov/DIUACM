import { v4 as uuid } from "uuid";
import { encode as defaultEncode } from "next-auth/jwt";

import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { Profile, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import Google from "@auth/core/providers/google";

const adapter = PrismaAdapter(prisma);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      profile(profile: Profile): User {
        return {
          id: profile.sub,
          name: profile.name,
          emailVerified: new Date(),
          email: profile.email,
          username: profile.email?.split("@")[0] ?? undefined,
          image: profile.picture,
        } as User;
      },
    }),
    Credentials({
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const validatedCredentials = loginSchema.safeParse(credentials);

        if (!validatedCredentials.success) return null;

        const { identifier, password } = validatedCredentials.data;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password ?? "");
        return isValid ? user : null;
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        const email = profile?.email;

        // Check if email domain is allowed
        if (
          !email ||
          !(email.endsWith("@diu.edu.bd") || email.endsWith("@s.diu.edu.bd"))
        ) {
          return false;
        }

        // Check if there's an existing user with this email
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: {
            accounts: {
              where: {
                provider: "google",
              },
            },
          },
        });

        if (existingUser) {
          // If user exists but doesn't have a Google account linked,
          // we'll create the link
          if (existingUser.accounts.length === 0) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                accessToken: account.access_token,
                expiresAt: account.expires_at,
                tokenType: account.token_type,
                scope: account.scope,
                idToken: account.id_token,
                sessionState: account.session_state?.toString(),
              },
            });
          }
          // Set the user ID to the existing user's ID
          user.id = existingUser.id;
        }

        return true;
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormData = z.infer<typeof loginSchema>;
