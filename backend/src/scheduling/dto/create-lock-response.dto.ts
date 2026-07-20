export class CreateLockResponseDto {
  success: boolean;
  lockKey?: string;
  expiresAt?: Date;
  message?: string;
}
