import { z } from 'zod';

export const workerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  village: z.string().min(1, 'Village is required'),
  dailyWage: z.coerce.number().min(1, 'Daily wage must be greater than 0'),
  joinDate: z.string().min(1, 'Join date is required'),
  status: z.enum(['active', 'inactive']),
});

export type WorkerFormValues = z.infer<typeof workerFormSchema>;
