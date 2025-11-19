import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Plus, Search, FolderKanban, Calendar as CalendarIcon } from "lucide-react";
import type { Project } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Manage all your photography projects in one place
          </p>
        </div>
        <Link href="/projects/new">
          <Button data-testid="button-create-project">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects by name, client, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-projects"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 rounded-full bg-primary/10 p-6">
            <FolderKanban className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {searchQuery ? "No projects found" : "No projects yet"}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery
              ? "Try adjusting your search query"
              : "Start by creating your first photography project"}
          </p>
          {!searchQuery && (
            <Link href="/projects/new">
              <Button data-testid="button-create-first-project">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover-elevate active-elevate-2 cursor-pointer h-full" data-testid={`project-card-${project.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg truncate">{project.name}</CardTitle>
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
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FolderKanban className="h-3 w-3" />
                      <span>{project.type}</span>
                    </div>
                    {project.shootDate && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{format(new Date(project.shootDate), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </div>
                  {project.budget > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-sm font-mono font-medium">
                        ${project.budget.toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
