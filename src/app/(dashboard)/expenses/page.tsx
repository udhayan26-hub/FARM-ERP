import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getExpenses } from "@/actions/expense-actions";
import { ExpenseFormDialog } from "@/components/forms/expense-form";
import { ExportButton } from "@/components/shared/export-button";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  const exportData = expenses.map((e) => ({
    Date: new Date(e.date).toLocaleDateString(),
    Category: e.category.toUpperCase(),
    Description: e.description,
    Amount: `₹${e.amount}`,
    Notes: e.notes || "-",
  }));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Expenses" 
        description="Track all miscellaneous farm expenses"
      >
        <div className="flex gap-2">
          <ExportButton data={exportData} filename="expenses_list" placeholder="Export Expenses" />
          <ExpenseFormDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </ExpenseFormDialog>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <p className="mb-2">No expenses logged yet.</p>
                        <ExpenseFormDialog>
                          <Button variant="outline" size="sm">Add your first expense</Button>
                        </ExpenseFormDialog>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="capitalize">{exp.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{exp.description}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">
                        -₹{exp.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <DeleteExpenseButton id={exp.id} description={exp.description} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
