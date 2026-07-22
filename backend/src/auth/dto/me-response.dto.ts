import type { Roles } from '@prisma/client';

export class MeResponseDto {
  id: string;
  email: string;
  role: Roles;
}
