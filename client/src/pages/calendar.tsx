import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent, Task, Project } from "@shared/schema";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { useState } from "react";
import { Link } from "wouter";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const { data: allEvents = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar-events"],
  });

  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const getAllEventsForDate = (date: Date) => {
    const calendarEvents = allEvents.filter((event) => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });

    const taskDeadlines = allTasks
      .filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), date))
      .map((task) => ({
        id: task.id,
        type: "Deadline" as const,
        title: task.title,
        startDate: task.dueDate!,
        projectId: task.projectId,
      }));

    const photoShoots = projects
      .filter((project) => project.shootDate && isSameDay(new Date(project.shootDate), date))
      .map((project) => ({
        id: project.id,
        type: "Photoshoot" as const,
        title: project.name,
        startDate: project.shootDate!,
        projectId: project.id,
      }));

    return [...calendarEvents, ...taskDeadlines, ...photoShoots];
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Photoshoot":
        return "bg-primary/10 text-primary border-primary/20";
      case "Meeting":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20";
      case "Deadline":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (view === "month") {
      setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === "prev" ? subDays(currentDate, 1) : addDays(currentDate, 1));
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const events = getAllEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <Card
              key={day.toString()}
              className={`min-h-24 p-2 ${
                !isCurrentMonth ? "opacity-40" : ""
              } ${isDayToday ? "ring-2 ring-primary" : ""}`}
              data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
            >
              <div className="text-right text-sm font-medium mb-1">
                <span className={isDayToday ? "bg-primary text-primary-foreground rounded-full px-2 py-1" : ""}>
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-1">
                {events.slice(0, 2).map((event) => (
                  <Link key={event.id} href={`/projects/${event.projectId}`}>
                    <Badge
                      variant="outline"
                      className={`${getEventTypeColor(event.type)} text-xs truncate w-full justify-start cursor-pointer hover-elevate`}
                      data-testid={`event-${event.id}`}
                    >
                      {event.title}
                    </Badge>
                  </Link>
                ))}
                {events.length > 2 && (
                  <p className="text-xs text-muted-foreground">+{events.length - 2} more</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => {
          const events = getAllEventsForDate(day);
          const isDayToday = isToday(day);

          return (
            <Card key={day.toString()} className={isDayToday ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                    <div className={`text-lg ${isDayToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {events.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No events</p>
                ) : (
                  events.map((event) => (
                    <Link key={event.id} href={`/projects/${event.projectId}`}>
                      <div className="p-2 rounded-md border hover-elevate cursor-pointer">
                        <Badge variant="outline" className={`${getEventTypeColor(event.type)} text-xs mb-1`}>
                          {event.type}
                        </Badge>
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.startDate), "h:mm a")}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const events = getAllEventsForDate(currentDate);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{format(currentDate, "EEEE, MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No events scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((event) => {
                  const project = projects.find((p) => p.id === event.projectId);
                  return (
                    <Link key={event.id} href={`/projects/${event.projectId}`}>
                      <Card className="hover-elevate active-elevate-2 cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{event.title}</CardTitle>
                              <p className="text-sm text-muted-foreground truncate">
                                {project?.name}
                              </p>
                            </div>
                            <Badge variant="outline" className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{format(new Date(event.startDate), "h:mm a")}</span>
                            {event.endDate && (
                              <>
                                <span>-</span>
                                <span>{format(new Date(event.endDate), "h:mm a")}</span>
                              </>
                            )}
                          </div>
                          {("description" in event && event.description) && (
                            <p className="text-sm mt-2">{event.description}</p>
                          )}
                          {("location" in event && event.location) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              📍 {event.location}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Calendar</h1>
        <p className="text-muted-foreground">
          View all your photoshoots, meetings, and deadlines
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate("prev")}
            data-testid="button-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate("next")}
            data-testid="button-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
            data-testid="button-today"
          >
            Today
          </Button>
          <h2 className="text-xl font-semibold ml-4" data-testid="text-current-date">
            {view === "month" && format(currentDate, "MMMM yyyy")}
            {view === "week" && `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`}
            {view === "day" && format(currentDate, "MMMM d, yyyy")}
          </h2>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week" | "day")}>
          <TabsList>
            <TabsTrigger value="month" data-testid="view-month">Month</TabsTrigger>
            <TabsTrigger value="week" data-testid="view-week">Week</TabsTrigger>
            <TabsTrigger value="day" data-testid="view-day">Day</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}
    </div>
  );
}
