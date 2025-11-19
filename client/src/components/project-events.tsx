import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import type { CalendarEvent, InsertCalendarEvent } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCalendarEventSchema } from "@shared/schema";
import { format } from "date-fns";

interface ProjectEventsProps {
  projectId: string;
  events: CalendarEvent[];
}

export function ProjectEvents({ projectId, events }: ProjectEventsProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertCalendarEvent>({
    resolver: zodResolver(insertCalendarEventSchema),
    defaultValues: {
      projectId,
      title: "",
      type: "Meeting",
      startDate: new Date(),
      endDate: undefined,
      description: "",
      location: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: InsertCalendarEvent) => {
      const res = await apiRequest("POST", "/api/calendar-events", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
      toast({
        title: "Event added",
        description: "The event has been added to your calendar",
      });
      setOpenDialog(false);
      form.reset({
        projectId,
        title: "",
        type: "Meeting",
        startDate: new Date(),
        endDate: undefined,
        description: "",
        location: "",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/calendar-events/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
      toast({
        title: "Event deleted",
        description: "The event has been removed",
      });
    },
  });

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

  const onSubmit = (data: InsertCalendarEvent) => {
    createEventMutation.mutate(data);
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Project Events</h2>
          <p className="text-sm text-muted-foreground">
            Schedule meetings and milestones for this project
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-event">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Schedule a meeting, photoshoot, or deadline
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Client consultation"
                          {...field}
                          data-testid="input-event-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-event-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Photoshoot">Photoshoot</SelectItem>
                          <SelectItem value="Meeting">Meeting</SelectItem>
                          <SelectItem value="Deadline">Deadline</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date & Time</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={new Date(field.value).toISOString().slice(0, 16)}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            data-testid="input-start-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date & Time</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            data-testid="input-end-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Studio A, Downtown"
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add details about this event..."
                          rows={3}
                          {...field}
                          data-testid="input-event-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEventMutation.isPending}>
                    {createEventMutation.isPending ? "Adding..." : "Add Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No events scheduled for this project
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map((event) => (
            <Card key={event.id} className="hover-elevate" data-testid={`event-card-${event.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg truncate">{event.title}</CardTitle>
                      <Badge variant="outline" className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(new Date(event.startDate), "MMM dd, yyyy 'at' h:mm a")}</span>
                      {event.endDate && (
                        <>
                          <span>-</span>
                          <span>{format(new Date(event.endDate), "h:mm a")}</span>
                        </>
                      )}
                    </div>
                    {event.location && (
                      <p className="text-sm text-muted-foreground mt-1">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEventMutation.mutate(event.id)}
                    data-testid={`button-delete-event-${event.id}`}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              {event.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
