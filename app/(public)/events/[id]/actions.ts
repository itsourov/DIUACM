"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getEventDetails(id: number) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event };
  } catch (error) {
    console.error("Error fetching event details:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getEventSolveStats(eventId: number) {
  try {
    const solveStats = await prisma.userSolveStatOnEvent.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            department: true,
            studentId: true,
          },
        },
      },
      orderBy: [
        { solveCount: "desc" },
        { upsolveCount: "desc" },
      ],
    });

    return { success: true, data: solveStats };
  } catch (error) {
    console.error("Error fetching solve stats:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getEventAttendanceList(eventId: number) {
  try {
   
    
    const attendance = await prisma.eventAttendance.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            department: true,
            studentId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    

    return { success: true, data: attendance };
  } catch (error) {
    console.error("Error fetching attendance list:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function checkIfUserHasAttendance(eventId: number) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }
    
    const attendance = await prisma.eventAttendance.findFirst({
      where: {
        eventId,
        userId: session.user.id,
      },
    });
    
    return { 
      success: true, 
      hasAttendance: !!attendance 
    };
  } catch (error) {
    console.error("Error checking attendance:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function submitAttendance(eventId: number, password: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to give attendance" };
    }
    
    // Verify the event exists and is open for attendance
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return { success: false, error: "Event not found" };
    }
    
    if (!event.openForAttendance) {
      return { success: false, error: "This event is not open for attendance" };
    }
    
    // Check if the event requires a password
    if (event.eventPassword && event.eventPassword !== password) {
      return { success: false, error: "Incorrect event password" };
    }
    
    // Check if the user is allowed to attend based on the event's participation scope
    // (For simplicity, we're skipping complex scope checks here)
    
    // Check if the event is within the attendance window (15 min before start to 15 min after end)
    const now = new Date();
    const startWindowTime = new Date(event.startingAt);
    startWindowTime.setMinutes(startWindowTime.getMinutes() - 15);
    
    const endWindowTime = new Date(event.endingAt);
    endWindowTime.setMinutes(endWindowTime.getMinutes() + 15);
    
    if (now < startWindowTime || now > endWindowTime) {
      if (event.strictAttendance) {
        return { 
          success: false, 
          error: "Attendance is only allowed from 15 minutes before the event starts to 15 minutes after the event ends" 
        };
      }
    }
    
    // Check if the user already has attendance for this event
    const existingAttendance = await prisma.eventAttendance.findFirst({
      where: {
        eventId,
        userId: session.user.id,
      },
    });
    
    if (existingAttendance) {
      return { success: false, error: "You've already given attendance for this event" };
    }
    
    // Create the attendance record
    await prisma.eventAttendance.create({
      data: {
        eventId,
        userId: session.user.id,
      },
    });
    
    revalidatePath(`/events/${eventId}`);
    
    return { success: true, message: "Attendance recorded successfully" };
  } catch (error) {
    console.error("Error submitting attendance:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}