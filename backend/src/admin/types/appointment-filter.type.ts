import type { AppointmentStatus } from '@prisma/client';

export type AppointmentFilters = {
  date?: { gte: Date; lt: Date };
  status?: AppointmentStatus;
};
