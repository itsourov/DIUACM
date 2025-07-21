import bcrypt from "bcryptjs";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createUserWithPassword(userData: {
  name: string;
  email: string;
  username: string;
  password: string;
  gender?: "male" | "female" | "other";
  phone?: string;
  codeforcesHandle?: string;
  atcoderHandle?: string;
  vjudgeHandle?: string;
  startingSemester?: string;
  department?: string;
  studentId?: string;
}) {
  const hashedPassword = await hashPassword(userData.password);

  const newUser = {
    name: userData.name,
    email: userData.email,
    username: userData.username,
    password: hashedPassword,
    gender: userData.gender,
    phone: userData.phone,
    codeforcesHandle: userData.codeforcesHandle,
    atcoderHandle: userData.atcoderHandle,
    vjudgeHandle: userData.vjudgeHandle,
    startingSemester: userData.startingSemester,
    department: userData.department,
    studentId: userData.studentId,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();
  return createdUser;
}
