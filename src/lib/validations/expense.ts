import { z } from 'zod';

export const expenseFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  category: z.enum(['diesel', 'seeds', 'fertilizers', 'pesticides', 'labour', 'repairs', 'maintenance', 'equipment', 'other']),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
