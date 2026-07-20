import { IsEmail, IsStrongPassword } from 'class-validator';

export class RegisterRequestDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
