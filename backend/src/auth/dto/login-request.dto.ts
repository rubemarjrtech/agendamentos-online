import { IsEmail, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AdminLoginRequestDto {
  @IsString()
  user: string;

  @IsString()
  password: string;
}
