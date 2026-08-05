import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenServiceProtocol } from '@token/token.service.protocol';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { ACCESS_TOKEN } from './constants/cookie-names';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<Pick<AuthService, 'register' | 'login' | 'adminLogin' | 'me'>>;
  let mockTokenService: jest.Mocked<TokenServiceProtocol>;

  const validUserId = 'cm1user123';
  const validEmail = 'test@test.com';
  const validPassword = 'StrongPass123!';
  const validToken = 'generated.jwt.token';

  const mockAuthResponse = {
    accessToken: validToken,
    user: {
      id: validUserId,
      email: validEmail,
      role: 'CLIENT' as const,
    },
  };

  const mockAdminAuthResponse = {
    accessToken: validToken,
    user: {
      id: 'admin',
      email: 'admin@test.com',
      role: 'ADMIN' as const,
    },
  };

  const mockMeResponse = {
    id: validUserId,
    email: validEmail,
    role: 'CLIENT' as const,
  };

  const mockRequest = {
    user: {
      sub: validUserId,
    },
    cookies: {
      ACCESS_TOKEN: validToken,
    },
  } as unknown as Request;

  beforeAll(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      adminLogin: jest.fn(),
      me: jest.fn(),
    };
    mockTokenService = {
      verifyAsync: jest
        .fn()
        .mockResolvedValue({ sub: validUserId, email: validEmail, role: 'CLIENT' }),
      generateAsync: jest.fn().mockResolvedValue(validToken),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: TokenServiceProtocol, useValue: mockTokenService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockResponse = () => {
    const response: Partial<Response> = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    return response as Response;
  };

  describe('register', () => {
    it('should call authService.register and set ACCESS_TOKEN cookie', async () => {
      // Arrange
      const dto = { email: validEmail, password: validPassword };
      mockAuthService.register.mockResolvedValue(mockAuthResponse);
      const mockResponse = createMockResponse();

      // Act
      const result = await controller.register(dto, mockResponse);

      // Assert
      expect(result).toEqual({
        id: validUserId,
        email: validEmail,
        role: 'CLIENT',
      });
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthService.register).toHaveBeenCalledWith(validEmail, validPassword);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN,
        validToken,
        expect.objectContaining({
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        }),
      );
    });

    it('should return AuthBodyResponseDto from authService.register', async () => {
      // Arrange
      const dto = { email: validEmail, password: validPassword };
      mockAuthService.register.mockResolvedValue(mockAuthResponse);
      const mockResponse = createMockResponse();

      // Act
      const result = await controller.register(dto, mockResponse);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: validUserId,
          email: validEmail,
          role: 'CLIENT',
        }),
      );
    });
  });

  describe('login', () => {
    it('should call authService.login and set ACCESS_TOKEN cookie', async () => {
      // Arrange
      const dto = { email: validEmail, password: validPassword };
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      const mockResponse = createMockResponse();

      // Act
      const result = await controller.login(dto, mockResponse);

      // Assert
      expect(result).toEqual({
        id: validUserId,
        email: validEmail,
        role: 'CLIENT',
      });
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(validEmail, validPassword);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN,
        validToken,
        expect.objectContaining({
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        }),
      );
    });

    it('should return AuthBodyResponseDto from authService.login', async () => {
      // Arrange
      const dto = { email: validEmail, password: validPassword };
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      const mockResponse = createMockResponse();

      // Act
      const result = await controller.login(dto, mockResponse);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: validUserId,
          email: validEmail,
          role: 'CLIENT',
        }),
      );
    });
  });

  describe('adminLogin', () => {
    it('should call authService.adminLogin and set ACCESS_TOKEN cookie', async () => {
      // Arrange
      const dto = { email: 'admin@test.com', password: 'admin123' };
      mockAuthService.adminLogin.mockResolvedValue(mockAdminAuthResponse);
      const mockResponse = createMockResponse();

      // Act
      const result = await controller.adminLogin(dto, mockResponse);

      // Assert
      expect(result).toEqual({
        id: 'admin',
        email: 'admin@test.com',
        role: 'ADMIN',
      });
      expect(mockAuthService.adminLogin).toHaveBeenCalledTimes(1);
      expect(mockAuthService.adminLogin).toHaveBeenCalledWith(dto.email, dto.password);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN,
        validToken,
        expect.objectContaining({
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        }),
      );
    });

    it('should return AuthBodyResponseDto from authService.adminLogin', async () => {
      // Arrange
      const dto = { email: 'admin@test.com', password: 'admin123' };
      mockAuthService.adminLogin.mockResolvedValue(mockAdminAuthResponse);
      const mockResponse = createMockResponse();

      // Act
      const result = await controller.adminLogin(dto, mockResponse);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: 'admin',
          email: 'admin@test.com',
          role: 'ADMIN',
        }),
      );
    });
  });

  describe('logout', () => {
    it('should clear ACCESS_TOKEN cookie and return 204', () => {
      // Arrange
      const mockResponse = createMockResponse();

      // Act
      const result = controller.logout(mockResponse);

      // Assert
      expect(result).toBeUndefined();
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(1);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        ACCESS_TOKEN,
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      );
    });
  });

  describe('me', () => {
    it('should extract userId from request and call authService.me', async () => {
      // Arrange
      mockAuthService.me.mockResolvedValue(mockMeResponse);

      // Act
      const result = await controller.me(mockRequest);

      // Assert
      expect(result).toEqual(mockMeResponse);
      expect(mockAuthService.me).toHaveBeenCalledTimes(1);
      expect(mockAuthService.me).toHaveBeenCalledWith(validUserId);
    });

    it('should return MeResponseDto from authService.me', async () => {
      // Arrange
      mockAuthService.me.mockResolvedValue(mockMeResponse);

      // Act
      const result = await controller.me(mockRequest);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: validUserId,
          email: validEmail,
          role: 'CLIENT',
        }),
      );
    });
  });
});
