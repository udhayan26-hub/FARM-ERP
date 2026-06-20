import { z } from 'zod';

export const landFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  acres: z.coerce.number().min(0.1, 'Acres must be greater than 0'),
  location: z.string().min(1, 'Location is required'),
  crop: z.string().min(1, 'Crop is required'),
  sowingDate: z.string().optional(),
  harvestDate: z.string().optional(),
  status: z.enum(['active', 'fallow', 'harvested']),
});

export type LandFormValues = z.infer<typeof landFormSchema>;
