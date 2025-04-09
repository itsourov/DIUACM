"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function deleteRanklist(ranklistId: string, trackerId: string) {
  try {
    await prisma.rankList.delete({
      where: { id: ranklistId },
    });

    revalidatePath(`/admin/trackers/${trackerId}/ranklists`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
