import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  DollarSign,
  ListChecks,
  Users,
  Edit,
} from "lucide-react";
import type { Project, Task, Contact, BudgetItem, CalendarEvent } from "@shared/schema";
import { TaskManagement } from "@/components/task-management";
import { BudgetTracker } from "@/components/budget-tracker";
import { ContactList } from "@/components/contact-list";
import { ProjectEvents } from "@/components/project-events";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id;
  const { toast } = useToast();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/projects", projectId, "tasks"],
    enabled: !!projectId,
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/projects", projectId, "contacts"],
    enabled: !!projectId,
  });

  const { data: budgetItems = [] } = useQuery<BudgetItem[]>({
    queryKey: ["/api/projects", projectId, "budget"],
    enabled: !!projectId,
  });

  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/projects", projectId, "events"],
    enabled: !!projectId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest("PATCH", `/api/projects/${projectId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Status updated",
        description: "Project status has been updated successfully",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist
          </p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const totalPlanned = budgetItems.reduce((sum, item) => sum + item.plannedCost, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actualCost, 0);
  const profitLoss = (project.budget || 0) - totalActual;

  const upcomingDeadlines = tasks
    .filter((t) => t.dueDate && t.status !== "Completed")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  const keyContacts = contacts.slice(0, 3);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/projects">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold mb-2 truncate" data-testid="text-project-name">
              {project.name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {project.clientName && (
                <p className="text-muted-foreground">{project.clientName}</p>
              )}
              <Badge variant="outline" className="shrink-0">{project.type}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={project.status}
            onValueChange={(value) => updateStatusMutation.mutate(value)}
          >
            <SelectTrigger className="w-40" data-testid="select-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Editing">Editing</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            {project.shootDate && (
              <p className="text-xs text-muted-foreground mt-3">
                Shoot: {format(new Date(project.shootDate), "MMM dd, yyyy")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Key Deadlines</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map((task) => (
                  <div key={task.id} className="text-sm">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(task.dueDate!), "MMM dd")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Snapshot</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Total Budget</p>
                <p className="text-lg font-mono font-semibold" data-testid="text-total-budget">
                  ${(project.budget || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual Costs</p>
                <p className="text-sm font-mono font-medium" data-testid="text-actual-costs">
                  ${totalActual.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profit/Loss</p>
                <p
                  className={`text-sm font-mono font-medium ${
                    profitLoss >= 0 ? "text-chart-2" : "text-destructive"
                  }`}
                  data-testid="text-profit-loss"
                >
                  {profitLoss >= 0 ? "+" : ""}${profitLoss.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="tasks" data-testid="tab-tasks">
            <ListChecks className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="budget" data-testid="tab-budget">
            <DollarSign className="h-4 w-4 mr-2" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="contacts" data-testid="tab-contacts">
            <Users className="h-4 w-4 mr-2" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <TaskManagement projectId={projectId!} tasks={tasks} />
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <BudgetTracker
            projectId={projectId!}
            budgetItems={budgetItems}
            projectBudget={project.budget || 0}
          />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <ContactList projectId={projectId!} contacts={contacts} />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <ProjectEvents projectId={projectId!} events={events} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
