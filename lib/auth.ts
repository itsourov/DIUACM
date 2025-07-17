import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/drizzle";
import Google from "next-auth/providers/google";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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
});
