import { z } from 'zod';

export const dieselFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  tractorId: z.string().min(1, 'Tractor is required'),
  liters: z.coerce.number().min(0.1, 'Liters must be greater than 0'),
  cost: z.coerce.number().min(1, 'Cost must be greater than 0'),
  hoursWorked: z.coerce.number().min(0, 'Hours must be 0 or greater'),
  purpose: z.enum(['ploughing', 'transport', 'harvesting', 'cultivation', 'irrigation', 'other']),
  notes: z.string().optional(),
});

export type DieselFormValues = z.infer<typeof dieselFormSchema>;
