import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Calendar as CalendarIcon,
  FolderKanban,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import type { Project, Task, CalendarEvent } from "@shared/schema";
import { format, isAfter, isBefore, addDays } from "date-fns";

export default function Dashboard() {
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: allEvents = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar-events"],
  });

  const activeProjects = projects.filter(
    (p) => p.status !== "Delivered"
  );

  const upcomingDeadlines = allTasks
    .filter((t) => t.dueDate && t.status !== "Completed")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const upcomingEvents = allEvents
    .filter((e) => isAfter(new Date(e.startDate), new Date()))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 6);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "In Progress":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "Editing":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20";
      case "Delivered":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "To Do":
        return "bg-muted text-muted-foreground";
      case "In Progress":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "Completed":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (projectsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <FolderKanban className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Welcome to Project Hub</h2>
          <p className="text-muted-foreground mb-6">
            Start by creating your first photography project. Choose from templates
            for weddings, portraits, commercial shoots, or start from scratch.
          </p>
          <Link href="/projects/new">
            <Button size="lg" data-testid="button-create-first-project">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your photography projects and upcoming events
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold" data-testid="text-active-projects-count">
              {activeProjects.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold" data-testid="text-pending-tasks-count">
              {allTasks.filter((t) => t.status !== "Completed").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {allTasks.filter((t) => t.status === "In Progress").length} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold" data-testid="text-upcoming-events-count">
              {upcomingEvents.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold" data-testid="text-projects-this-month">
              {projects.filter(p => {
                const createdDate = new Date(p.createdAt!);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() && 
                       createdDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              New projects created
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming deadlines
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingDeadlines.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  const daysUntil = Math.ceil(
                    (new Date(task.dueDate!).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isOverdue = daysUntil < 0;
                  const isUrgent = daysUntil >= 0 && daysUntil <= 3;

                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover-elevate border"
                      data-testid={`task-deadline-${task.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {project?.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-xs font-mono text-muted-foreground">
                          {format(new Date(task.dueDate!), "MMM dd")}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            isOverdue
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : isUrgent
                              ? "bg-chart-3/10 text-chart-3 border-chart-3/20"
                              : ""
                          }
                        >
                          {isOverdue
                            ? `${Math.abs(daysUntil)}d overdue`
                            : daysUntil === 0
                            ? "Today"
                            : daysUntil === 1
                            ? "Tomorrow"
                            : `${daysUntil}d left`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming events scheduled
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const project = projects.find((p) => p.id === event.projectId);
                  const eventTypeColors = {
                    Photoshoot: "bg-primary/10 text-primary border-primary/20",
                    Meeting: "bg-chart-4/10 text-chart-4 border-chart-4/20",
                    Deadline: "bg-chart-3/10 text-chart-3 border-chart-3/20",
                  };

                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover-elevate border"
                      data-testid={`event-${event.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <Badge
                            variant="outline"
                            className={
                              eventTypeColors[event.type as keyof typeof eventTypeColors] || ""
                            }
                          >
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {project?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-muted-foreground">
                          {format(new Date(event.startDate), "MMM dd, h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Recent Projects</CardTitle>
          <Link href="/projects">
            <Button variant="ghost" size="sm" data-testid="button-view-all-projects">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`project-card-${project.id}`}>
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base truncate">{project.name}</CardTitle>
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    {project.clientName && (
                      <p className="text-sm text-muted-foreground truncate">
                        {project.clientName}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />
                        <span>{project.type}</span>
                      </div>
                      {project.shootDate && (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{format(new Date(project.shootDate), "MMM dd")}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
