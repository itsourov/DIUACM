import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/drizzle";
import Google from "next-auth/providers/google";
import { users, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...DrizzleAdapter(db),
    async createUser(user) {
      // Generate username from email (part before @)
      const username = user.email?.split("@")[0] || "";

      const newUser = {
        name: user.name || "",
        email: user.email!,
        username: username,
        emailVerified: user.emailVerified,
        image: user.image,
      };

      await db.insert(users).values(newUser);

      // Query the created user to return the complete object
      const [createdUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email!))
        .limit(1);

      return {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        emailVerified: createdUser.emailVerified,
        image: createdUser.image,
      };
    },
  },
  providers: [Google],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Only allow DIU email addresses
        const email = user.email || "";
        const allowedDomains = ["@diu.edu.bd", "@s.diu.edu.bd"];
        const isAllowedDomain = allowedDomains.some((domain) =>
          email.endsWith(domain)
        );

        if (!isAllowedDomain) {
          return false; // Reject sign-in for non-DIU emails
        }

        // Check if a user with this email already exists
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!))
          .limit(1);

        if (existingUser) {
          // Check if this OAuth account is already linked to the user
          const [existingAccount] = await db
            .select()
            .from(accounts)
            .where(
              and(
                eq(accounts.userId, existingUser.id),
                eq(accounts.provider, account.provider)
              )
            )
            .limit(1);

          if (!existingAccount) {
            // Link the OAuth account to the existing user
            await db.insert(accounts).values({
              userId: existingUser.id,
              type: account.type as "oauth",
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            });
          }
        }
      }
      return true;
    },
  },
});
