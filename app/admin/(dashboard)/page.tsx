import Link from "next/link";
import { Metadata } from "next";
import { getStats } from "./actions";
import {
  ActivitySquare,
  Users,
  Calendar,
  FileText,
  Award,
  FileBarChart2,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Admin Dashboard | DIU ACM",
  description: "Admin dashboard for DIU ACM website",
};

export default async function DashboardPage() {
  const { data } = await getStats();

  const stats = data || {
    users: 0,
    events: 0,
    blogs: 0,
    contests: 0,
    trackers: 0,
    contactSubmissions: 0,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your website data and activities
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">
              Registered users on the platform
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="px-0" asChild>
              <Link href="/admin/users" className="flex items-center">
                <span>View all users</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Events Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.events}</div>
            <p className="text-xs text-muted-foreground">
              Events created on the platform
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="px-0" asChild>
              <Link href="/admin/events" className="flex items-center">
                <span>Manage events</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Blogs Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blogs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blogs}</div>
            <p className="text-xs text-muted-foreground">
              Published blog posts
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="px-0" asChild>
              <Link href="/admin/blogs" className="flex items-center">
                <span>View all blogs</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Contests Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contests</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contests}</div>
            <p className="text-xs text-muted-foreground">
              Programming contests
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="px-0" asChild>
              <Link href="/admin/contests" className="flex items-center">
                <span>View contests</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Trackers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trackers</CardTitle>
            <FileBarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trackers}</div>
            <p className="text-xs text-muted-foreground">Created trackers</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="px-0" asChild>
              <Link href="/admin/trackers" className="flex items-center">
                <span>Manage trackers</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Contact Submissions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contact Submissions
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contactSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Contact form submissions
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="px-0" asChild>
              <Link href="/contact-submissions" className="flex items-center">
                <span>View submissions</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity Card */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Overview of recent activities across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
              <div className="space-y-3">
                <ActivitySquare className="h-10 w-10 mx-auto" />
                <p>Activity tracking will be available soon.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
