import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/register-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthBodyResponseDto } from './dto/auth-response.dto';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { ACCESS_TOKEN } from './constants/cookie-names';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthBodyResponseDto> {
    const { accessToken, user } = await this.authService.register(dto.email, dto.password);

    res.cookie(ACCESS_TOKEN, accessToken);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  @Throttle({ long: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthBodyResponseDto> {
    const { accessToken, user } = await this.authService.login(dto.email, dto.password);

    res.cookie(ACCESS_TOKEN, accessToken);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  @Throttle({ long: { limit: 10, ttl: 60000 } })
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthBodyResponseDto> {
    const { accessToken, user } = await this.authService.adminLogin(dto.email, dto.password);

    res.cookie(ACCESS_TOKEN, accessToken);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
