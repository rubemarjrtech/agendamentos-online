import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { HashService } from './hash/hash.service';
import type { TokenPayload } from '@token/token.service';
import { Roles } from '@prisma/client';
import type { ConfigType } from '@nestjs/config';
import authConfig from './config/auth-config';
import { AuthResponseDto } from './dto/auth-response.dto';
import { TokenServiceProtocol } from '@token/token.service.protocol';

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly hash: HashService,
    private readonly token: TokenServiceProtocol,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async register(email: string, password: string): Promise<AuthResponseDto> {
    const existing = await this.database.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const passwordHash = await this.hash.hash(password);

    const user = await this.database.user.create({
      data: { email, passwordHash, role: Roles.CLIENT },
    });
    const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.token.generateAsync(payload);

    return {
      accessToken: token,
    };
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.database.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await this.hash.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.token.generateAsync(payload);

    return {
      accessToken: token,
    };
  }

  async adminLogin(email: string, password: string): Promise<AuthResponseDto> {
    const adminUser = this.config.ADMIN_USER;
    const adminPassword = this.config.ADMIN_PASSWORD;
    const validUser = email === adminUser;
    const validPassword = password === adminPassword;

    if (!validUser || !validPassword) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: TokenPayload = { sub: 'admin', email, role: Roles.ADMIN };
    const token = await this.token.generateAsync(payload);

    return {
      accessToken: token,
    };
  }
}
