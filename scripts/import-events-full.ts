import {
  PrismaClient,
  Visibility,
  EventType,
  AttendanceScope,
} from "@prisma/client";
import axios from "axios";

// Initialize Prisma client
const prisma = new PrismaClient();

// Define types based on the API response
interface AttenderPivot {
  event_id: number;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

interface DIUACMUser {
  id: string;
  name: string;
  email: string;
  username: string;
  image: string | null;
  email_verified_at: string | null;
  password: string;
  gender: string;
  phone: string | null;
  codeforces_handle: string | null;
  atcoder_handle: string | null;
  vjudge_handle: string | null;
  starting_semester: string | null;
  department: string | null;
  student_id: string | null;
  max_cf_rating: number | null;
  created_at: string;
  updated_at: string;
  pivot: AttenderPivot;
}

interface TrackerData {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface RankListPivot {
  event_id: number;
  rank_list_id: number;
  weight: number;
}

interface RankListData {
  id: number;
  tracker_id: number;
  title: string;
  session: string;
  description: string | null;
  weight_of_upsolve: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  pivot: RankListPivot;
  tracker: TrackerData;
}

interface DIUACMEvent {
  id: number;
  title: string;
  description: string | null;
  status: string;
  starting_at: string;
  ending_at: string;
  event_link: string | null;
  event_password: string | null;
  open_for_attendance: boolean;
  strict_attendance: boolean;
  type: string;
  attendance_scope: string;
  created_at: string;
  updated_at: string;
  attenders: DIUACMUser[];
  rank_lists: RankListData[];
}

// Map status strings to Visibility enum
function mapVisibility(status: string): Visibility {
  switch (status.toLowerCase()) {
    case "published":
      return Visibility.PUBLISHED;
    case "draft":
      return Visibility.DRAFT;
    case "private":
      return Visibility.PRIVATE;
    default:
      return Visibility.DRAFT;
  }
}

// Map event type strings to EventType enum
function mapEventType(type: string): EventType {
  switch (type.toLowerCase()) {
    case "contest":
      return EventType.CONTEST;
    case "class":
      return EventType.CLASS;
    default:
      return EventType.OTHER;
  }
}

// Map attendance scope strings to AttendanceScope enum
function mapAttendanceScope(scope: string): AttendanceScope {
  switch (scope.toLowerCase()) {
    case "open_for_all":
      return AttendanceScope.OPEN_FOR_ALL;
    case "only_girls":
      return AttendanceScope.ONLY_GIRLS;
    case "junior_programmers":
      return AttendanceScope.JUNIOR_PROGRAMMERS;
    case "selected_persons":
      return AttendanceScope.SELECTED_PERSONS;
    default:
      throw new Error(`Unknown attendance scope: ${scope}`);
  }
}

// Main function to import events and related data
async function importEventsWithData() {
  try {
    console.log("Fetching events from API...");

    // Fetch events from the API
    const response = await axios.get<DIUACMEvent[]>(
      "https://admin.diuacm.com/api/events"
    );
    const events = response.data;
    console.log(`Fetched ${events.length} events`);

    // Track statistics
    let eventsCreated = 0;
    let eventsSkipped = 0;
    let trackersCreated = 0;
    let rankListsCreated = 0;
    let attendancesCreated = 0;
    let attendancesSkipped = 0;
    let usersNotFound = 0;

    // Process each event
    for (const event of events) {
      console.log(`Processing event: ${event.title} (ID: ${event.id})`);

      // Check if event already exists
      const existingEvent = await prisma.event.findFirst({
        where: {
          id: event.id,
        },
      });

      if (existingEvent) {
        console.log(`Event with ID ${event.id} already exists, skipping...`);
        eventsSkipped++;
        continue;
      }

      // Process trackers and rank lists first
      const trackerMap = new Map<number, string>(); // Map old tracker IDs to new CUIDs

      // Process each rank list and its associated tracker
      for (const rankListItem of event.rank_lists) {
        const trackerData = rankListItem.tracker;

        // Check if tracker already exists by slug
        let tracker = await prisma.tracker.findUnique({
          where: { slug: trackerData.slug },
        });

        // Create tracker if it doesn't exist
        if (!tracker) {
          console.log(`Creating tracker: ${trackerData.title}`);
          tracker = await prisma.tracker.create({
            data: {
              title: trackerData.title,
              slug: trackerData.slug,
              description: trackerData.description,
              status: mapVisibility(trackerData.status),
              createdAt: new Date(trackerData.created_at),
              updatedAt: new Date(trackerData.updated_at),
            },
          });
          trackersCreated++;
        }

        trackerMap.set(trackerData.id, tracker.id);
      }

      // Create event
      const createdEvent = await prisma.event.create({
        data: {
          id: event.id,
          title: event.title,
          description: event.description,
          status: mapVisibility(event.status),
          startingAt: new Date(event.starting_at),
          endingAt: new Date(event.ending_at),
          eventLink: event.event_link,
          eventPassword: event.event_password,
          openForAttendance: event.open_for_attendance,
          strictAttendance: event.strict_attendance,
          type: mapEventType(event.type),
          participationScope: mapAttendanceScope(event.attendance_scope),
          createdAt: new Date(event.created_at),
          updatedAt: new Date(event.updated_at),
        },
      });

      console.log(
        `Created event: ${createdEvent.title} (ID: ${createdEvent.id})`
      );
      eventsCreated++;

      // Now process rank lists
      for (const rankListItem of event.rank_lists) {
        const trackerId = trackerMap.get(rankListItem.tracker_id);

        if (!trackerId) {
          console.log(
            `Tracker ID ${rankListItem.tracker_id} not found in map, skipping rank list...`
          );
          continue;
        }

        // Check if rank list already exists
        const existingRankList = await prisma.rankList.findFirst({
          where: {
            trackerId,
            keyword: rankListItem.session, // Using session as keyword as per requirement
          },
        });

        if (existingRankList) {
          console.log(
            `Rank list with session ${rankListItem.session} already exists for tracker ${trackerId}`
          );

          // Create event rank list connection
          await prisma.eventRankList.create({
            data: {
              eventId: createdEvent.id,
              rankListId: existingRankList.id,
              weight: rankListItem.pivot.weight,
            },
          });
        } else {
          // Create new rank list
          console.log(
            `Creating rank list: ${rankListItem.title} with keyword ${rankListItem.session}`
          );
          const newRankList = await prisma.rankList.create({
            data: {
              trackerId,
              keyword: rankListItem.session,
              description: rankListItem.description,
              weightOfUpsolve: rankListItem.weight_of_upsolve,
              isArchived: rankListItem.is_archived,
              createdAt: new Date(rankListItem.created_at),
              updatedAt: new Date(rankListItem.updated_at),
            },
          });
          rankListsCreated++;

          // Create event rank list connection
          await prisma.eventRankList.create({
            data: {
              eventId: createdEvent.id,
              rankListId: newRankList.id,
              weight: rankListItem.pivot.weight,
            },
          });
        }
      }

      // Process attendances
      for (const attender of event.attenders) {
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: attender.id },
        });

        if (!user) {
          console.log(
            `User with ID ${attender.id} (${attender.name}) not found, skipping attendance...`
          );
          usersNotFound++;
          continue;
        }

        // Check if attendance already exists
        const existingAttendance = await prisma.eventAttendance.findFirst({
          where: {
            userId: attender.id,
            eventId: createdEvent.id,
          },
        });

        if (existingAttendance) {
          console.log(
            `Attendance for user ${attender.name} at event ${createdEvent.title} already exists`
          );
          attendancesSkipped++;
          continue;
        }

        // Create attendance
        await prisma.eventAttendance.create({
          data: {
            userId: attender.id,
            eventId: createdEvent.id,
            createdAt: attender.pivot.created_at
              ? new Date(attender.pivot.created_at)
              : new Date(),
            updatedAt: attender.pivot.updated_at
              ? new Date(attender.pivot.updated_at)
              : new Date(),
          },
        });
        attendancesCreated++;
      }
    }

    // Print summary
    console.log("\n=== IMPORT SUMMARY ===");
    console.log(`Events created: ${eventsCreated}`);
    console.log(`Events skipped: ${eventsSkipped}`);
    console.log(`Trackers created: ${trackersCreated}`);
    console.log(`Rank lists created: ${rankListsCreated}`);
    console.log(`Attendances created: ${attendancesCreated}`);
    console.log(`Attendances skipped: ${attendancesSkipped}`);
    console.log(`Users not found: ${usersNotFound}`);
  } catch (error) {
    console.error("Error during import:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importEventsWithData().catch(console.error);
