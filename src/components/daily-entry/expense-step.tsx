import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ExpenseStep() {
  const [expenses, setExpenses] = useState([{ id: Date.now(), category: "", amount: "", desc: "" }]);

  const addExpense = () => {
    setExpenses([...expenses, { id: Date.now(), category: "", amount: "", desc: "" }]);
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between border">
        <div>
          <p className="font-medium text-sm">Any other expenses today?</p>
          <p className="text-xs text-muted-foreground">e.g. seeds, fertilizers, repairs. Skip if none.</p>
        </div>
      </div>

      <div className="space-y-4">
        {expenses.map((expense, index) => (
          <div key={expense.id} className="p-4 border rounded-lg bg-card shadow-sm space-y-4 relative">
            {expenses.length > 1 && (
              <button 
                onClick={() => removeExpense(expense.id)}
                className="absolute right-2 top-2 text-muted-foreground hover:text-destructive p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeds">Seeds</SelectItem>
                    <SelectItem value="fertilizers">Fertilizers</SelectItem>
                    <SelectItem value="pesticides">Pesticides</SelectItem>
                    <SelectItem value="repairs">Repairs & Maintenance</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea placeholder="What was this expense for?" className="resize-none h-20" />
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" className="w-full border-dashed" onClick={addExpense}>
          <Plus className="w-4 h-4 mr-2" /> Add Another Expense
        </Button>
      </div>
    </div>
  );
}
