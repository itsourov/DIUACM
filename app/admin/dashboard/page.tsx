import { Suspense } from "react";
import { db } from "@/db/drizzle";
import {
  users,
  events,
  blogPosts,
  galleries,
  contests,
  trackers,
} from "@/db/schema";
import { count, eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Award,
  FileBarChart2,
  Plus,
  Activity,
} from "lucide-react";
import Link from "next/link";

async function getDashboardStats() {
  const [
    totalUsers,
    totalEvents,
    publishedEvents,
    totalBlogs,
    publishedBlogs,
    totalGalleries,
    publishedGalleries,
    totalContests,
    totalTrackers,
    recentUsers,
    recentEvents,
    recentBlogs,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(events),
    db
      .select({ count: count() })
      .from(events)
      .where(eq(events.status, "published")),
    db.select({ count: count() }).from(blogPosts),
    db
      .select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published")),
    db.select({ count: count() }).from(galleries),
    db
      .select({ count: count() })
      .from(galleries)
      .where(eq(galleries.status, "published")),
    db.select({ count: count() }).from(contests),
    db.select({ count: count() }).from(trackers),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5),
    db
      .select({
        id: events.id,
        title: events.title,
        status: events.status,
        startingAt: events.startingAt,
      })
      .from(events)
      .orderBy(desc(events.createdAt))
      .limit(5),
    db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        status: blogPosts.status,
        author: blogPosts.author,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt))
      .limit(5),
  ]);

  return {
    totalUsers: totalUsers[0].count,
    totalEvents: totalEvents[0].count,
    publishedEvents: publishedEvents[0].count,
    totalBlogs: totalBlogs[0].count,
    publishedBlogs: publishedBlogs[0].count,
    totalGalleries: totalGalleries[0].count,
    publishedGalleries: publishedGalleries[0].count,
    totalContests: totalContests[0].count,
    totalTrackers: totalTrackers[0].count,
    recentUsers,
    recentEvents,
    recentBlogs,
  };
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

function RecentItemsSkeleton() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="space-y-1">
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-5 w-16 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

async function DashboardContent() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
      href: "/admin/users",
    },
    {
      title: "Events",
      value: stats.totalEvents,
      subtitle: `${stats.publishedEvents} published`,
      icon: CalendarDays,
      description: "Total events",
      href: "/admin/events",
    },
    {
      title: "Blog Posts",
      value: stats.totalBlogs,
      subtitle: `${stats.publishedBlogs} published`,
      icon: FileText,
      description: "Total blog posts",
      href: "/admin/blogs",
    },
    {
      title: "Galleries",
      value: stats.totalGalleries,
      subtitle: `${stats.publishedGalleries} published`,
      icon: ImageIcon,
      description: "Photo galleries",
      href: "/admin/galleries",
    },
    {
      title: "Contests",
      value: stats.totalContests,
      icon: Award,
      description: "Programming contests",
      href: "/admin/contests",
    },
    {
      title: "Trackers",
      value: stats.totalTrackers,
      icon: FileBarChart2,
      description: "Progress trackers",
      href: "/admin/trackers",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the DIUACM admin dashboard. Here&apos;s an overview of
            your platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/events/create">
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.subtitle && (
                    <span className="text-sm text-muted-foreground">
                      ({stat.subtitle})
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={stat.href}>View all</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Users</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Events</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentEvents.length > 0 ? (
              stats.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.startingAt
                        ? new Date(event.startingAt).toLocaleDateString()
                        : "No date set"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      event.status === "published" ? "default" : "secondary"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No events found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Blog Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Blog Posts</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/blogs">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentBlogs.length > 0 ? (
              stats.recentBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{blog.title}</p>
                    <p className="text-xs text-muted-foreground">
                      By {blog.author}
                    </p>
                  </div>
                  <Badge
                    variant={
                      blog.status === "published" ? "default" : "secondary"
                    }
                  >
                    {blog.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No blog posts found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-16 flex-col gap-2">
              <Link href="/admin/events/create">
                <Plus className="h-5 w-5" />
                Create Event
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col gap-2">
              <Link href="/admin/blogs/create">
                <Plus className="h-5 w-5" />
                Write Blog Post
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col gap-2">
              <Link href="/admin/galleries/create">
                <Plus className="h-5 w-5" />
                Create Gallery
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col gap-2">
              <Link href="/admin/users">
                <Users className="h-5 w-5" />
                Manage Users
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <RecentItemsSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
