import { z } from 'zod';

export const attendanceEntrySchema = z.object({
  workerId: z.string().min(1),
  status: z.enum(['present', 'absent', 'half']), // 'half' matches DB/Prisma model
});

export const attendanceFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  entries: z.array(attendanceEntrySchema).min(1, 'At least one entry is required'),
});

export type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;
export type AttendanceEntryValues = z.infer<typeof attendanceEntrySchema>;
