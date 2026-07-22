import type { Roles } from '@prisma/client';

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: Roles;
  };
}

export class AuthBodyResponseDto {
  id: string;
  email: string;
  role: Roles;
}
