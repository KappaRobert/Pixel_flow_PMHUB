import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus } from "lucide-react";
import type { BudgetItem, InsertBudgetItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBudgetItemSchema } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BudgetTrackerProps {
  projectId: string;
  budgetItems: BudgetItem[];
  projectBudget: number;
}

const categories = [
  "Studio Rental",
  "Assistant Fee",
  "Transportation",
  "Equipment Rental",
  "Makeup Artist",
  "Other",
];

export function BudgetTracker({ projectId, budgetItems, projectBudget }: BudgetTrackerProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertBudgetItem>({
    resolver: zodResolver(insertBudgetItemSchema),
    defaultValues: {
      projectId,
      description: "",
      plannedCost: 0,
      actualCost: 0,
      paymentStatus: "Unpaid",
      category: "",
    },
  });

  const createBudgetItemMutation = useMutation({
    mutationFn: async (data: InsertBudgetItem) => {
      const res = await apiRequest("POST", "/api/budget-items", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "budget"] });
      toast({
        title: "Budget item added",
        description: "The expense has been recorded successfully",
      });
      setOpenDialog(false);
      form.reset({
        projectId,
        description: "",
        plannedCost: 0,
        actualCost: 0,
        paymentStatus: "Unpaid",
        category: "",
      });
    },
  });

  const updateBudgetItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BudgetItem> }) => {
      return await apiRequest("PATCH", `/api/budget-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "budget"] });
    },
  });

  const deleteBudgetItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/budget-items/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "budget"] });
      toast({
        title: "Budget item deleted",
        description: "The expense has been removed",
      });
    },
  });

  const totalPlanned = budgetItems.reduce((sum, item) => sum + item.plannedCost, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actualCost, 0);
  const profitLoss = projectBudget - totalActual;

  const chartData = [
    {
      name: "Budget Overview",
      Planned: totalPlanned,
      Actual: totalActual,
      Budget: projectBudget,
    },
  ];

  const onSubmit = (data: InsertBudgetItem) => {
    createBudgetItemMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Budget Tracker</h2>
          <p className="text-sm text-muted-foreground">
            Track expenses and monitor project profitability
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-budget-item">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget Item</DialogTitle>
              <DialogDescription>
                Record a planned or actual expense for this project
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Studio rental for 4 hours"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plannedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Planned Cost ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-planned-cost"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="actualCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Cost ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-actual-cost"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <Button type="submit" disabled={createBudgetItemMutation.isPending}>
                    {createBudgetItemMutation.isPending ? "Adding..." : "Add Expense"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-semibold" data-testid="text-budget-total">
              ${projectBudget.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-semibold" data-testid="text-budget-actual">
              ${totalActual.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Planned: ${totalPlanned.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-mono font-semibold ${
                profitLoss >= 0 ? "text-chart-2" : "text-destructive"
              }`}
              data-testid="text-budget-profit-loss"
            >
              {profitLoss >= 0 ? "+" : ""}${profitLoss.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {projectBudget > 0 ? `${((profitLoss / projectBudget) * 100).toFixed(1)}% margin` : 'No budget set'}
            </p>
          </CardContent>
        </Card>
      </div>

      {budgetItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Budget" fill="hsl(var(--chart-3))" />
                <Bar dataKey="Planned" fill="hsl(var(--chart-1))" />
                <Bar dataKey="Actual" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expense Items</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No budget items added yet
            </p>
          ) : (
            <div className="space-y-2">
              {budgetItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover-elevate"
                  data-testid={`budget-item-${item.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{item.description}</p>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Planned: <span className="font-mono">${item.plannedCost.toLocaleString()}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Actual: <span className="font-mono">${item.actualCost.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={item.paymentStatus}
                      onValueChange={(value) => {
                        updateBudgetItemMutation.mutate({
                          id: item.id,
                          data: { paymentStatus: value },
                        });
                      }}
                    >
                      <SelectTrigger className="w-28" data-testid={`select-payment-status-${item.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge
                      variant="outline"
                      className={
                        item.paymentStatus === "Paid"
                          ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                          : "bg-chart-3/10 text-chart-3 border-chart-3/20"
                      }
                    >
                      {item.paymentStatus}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBudgetItemMutation.mutate(item.id)}
                      data-testid={`button-delete-budget-item-${item.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
