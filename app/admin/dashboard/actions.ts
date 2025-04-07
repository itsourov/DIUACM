"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    // Get total counts
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    const contestCount = await prisma.contest.count();
    const rankListCount = await prisma.rankList.count();
    const trackerCount = await prisma.tracker.count();

  

    // Get upcoming events
    const upcomingEvents = await prisma.event.findMany({
      take: 5,
      where: {
        startingAt: {
          gte: new Date()
        }
      },
      orderBy: {
        startingAt: 'asc'
      },
      select: {
        id: true,
        title: true,
        startingAt: true,
        type: true,
      }
    });

    return {
      counts: {
        userCount,
        eventCount,
        contestCount,
        rankListCount,
        trackerCount
      },
      upcomingEvents
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}