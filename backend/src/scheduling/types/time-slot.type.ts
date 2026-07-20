import type { LockStatus } from './lock-status.type';

export type TimeSlotDto = {
  time: string;
  status: LockStatus;
};
