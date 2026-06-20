import { z } from 'zod';

export const tractorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  registrationNo: z.string().min(1, 'Registration number is required'),
  model: z.string().min(1, 'Model is required'),
  driverName: z.string().min(2, 'Driver name is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  status: z.enum(['active', 'maintenance', 'inactive']),
});

export type TractorFormValues = z.infer<typeof tractorFormSchema>;
