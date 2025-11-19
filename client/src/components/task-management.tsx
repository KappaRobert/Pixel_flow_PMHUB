import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import type { Task, InsertTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { format } from "date-fns";

const sections = ["Pre-Production", "Shoot Day", "Post-Production", "General"];

interface TaskManagementProps {
  projectId: string;
  tasks: Task[];
}

export function TaskManagement({ projectId, tasks }: TaskManagementProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      projectId,
      title: "",
      section: "General",
      status: "To Do",
      assignee: "",
      dueDate: undefined,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created",
        description: "Your task has been added successfully",
      });
      setOpenDialog(false);
      form.reset({
        projectId,
        title: "",
        section: "General",
        status: "To Do",
        assignee: "",
        dueDate: undefined,
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/tasks/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "The task has been removed",
      });
    },
  });

  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section);
    } else {
      newCollapsed.add(section);
    }
    setCollapsedSections(newCollapsed);
  };

  const getStatusColor = (status: string) => {
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

  const tasksBySection = sections.map((section) => ({
    section,
    tasks: tasks.filter((task) => task.section === section),
  }));

  const onSubmit = (data: InsertTask) => {
    createTaskMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Task Management</h2>
          <p className="text-sm text-muted-foreground">
            {tasks.filter((t) => t.status === "Completed").length} of {tasks.length} tasks completed
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-task">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for this project
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Book makeup artist"
                          {...field}
                          data-testid="input-task-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-section">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sections.map((section) => (
                              <SelectItem key={section} value={section}>
                                {section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="To Do">To Do</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assignee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignee</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name or team member"
                            {...field}
                            data-testid="input-assignee"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            data-testid="input-due-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tasksBySection.map(({ section, tasks: sectionTasks }) => (
          <Card key={section}>
            <CardHeader
              className="cursor-pointer hover-elevate"
              onClick={() => toggleSection(section)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {collapsedSections.has(section) ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <CardTitle className="text-lg">{section}</CardTitle>
                  <Badge variant="outline">
                    {sectionTasks.length}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sectionTasks.filter((t) => t.status === "Completed").length} completed
                </p>
              </div>
            </CardHeader>
            {!collapsedSections.has(section) && (
              <CardContent>
                {sectionTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No tasks in this section
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sectionTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 p-3 rounded-lg border hover-elevate"
                        data-testid={`task-${task.id}`}
                      >
                        <Checkbox
                          checked={task.status === "Completed"}
                          onCheckedChange={(checked) => {
                            updateTaskMutation.mutate({
                              id: task.id,
                              data: { status: checked ? "Completed" : "To Do" },
                            });
                          }}
                          data-testid={`checkbox-task-${task.id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${task.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {task.assignee && (
                              <Badge variant="outline" className="text-xs">
                                {task.assignee}
                              </Badge>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Due {format(new Date(task.dueDate), "MMM dd")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={task.status}
                            onValueChange={(value) => {
                              updateTaskMutation.mutate({
                                id: task.id,
                                data: { status: value },
                              });
                            }}
                          >
                            <SelectTrigger className="w-32" data-testid={`select-task-status-${task.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="To Do">To Do</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            data-testid={`button-delete-task-${task.id}`}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
