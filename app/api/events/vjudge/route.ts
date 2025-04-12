import { prisma } from "@/lib/prisma";
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch events that have 'vjudge.net' in the eventLink and have non-archived ranklists
        const activeContests = await prisma.event.findMany({
            where: {
                eventLink: {
                  contains: "vjudge.net",
                },
                rankLists: {
                  some: {
                    rankList: {
                      isArchived: false,
                    },
                  },
                },
              },
            select: {
                id:true,
                title:true,
                eventLink: true,
            }
        });

        return NextResponse.json({ 
            success: true, 
            data: activeContests 
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching active contests:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch active contests' 
        }, { status: 500 });
    }
}