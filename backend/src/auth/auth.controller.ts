import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/register-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterRequestDto): Promise<AuthResponseDto> {
    return await this.authService.register(dto.email, dto.password);
  }

  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto): Promise<AuthResponseDto> {
    return await this.authService.login(dto.email, dto.password);
  }

  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() dto: LoginRequestDto): Promise<AuthResponseDto> {
    return await this.authService.adminLogin(dto.email, dto.password);
  }
}
