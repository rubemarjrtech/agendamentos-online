import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenServiceProtocol } from '@token/token.service.protocol';
import type { TokenPayload } from '@token/token.service';
import type { Request } from 'express';
import { Roles } from '@prisma/client';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockTokenService: jest.Mocked<TokenServiceProtocol>;

  const validPayload: TokenPayload = {
    sub: 'cm1userid123',
    email: 'test@test.com',
    role: Roles.CLIENT,
  };

  beforeAll(async () => {
    mockTokenService = {
      verifyAsync: jest.fn(),
      generateAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard, { provide: TokenServiceProtocol, useValue: mockTokenService }],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (request: Partial<Request> = {}) => {
    return {
      switchToHttp: () => ({
        getRequest: () => request as Request,
      }),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should return true and attach user to request when token is valid', async () => {
      // Arrange
      const mockRequest: Partial<Request> & {
        user?: TokenPayload;
        cookies: { ACCESS_TOKEN?: string };
      } = {
        cookies: {
          ACCESS_TOKEN: 'valid-token',
        },
      };
      const context = createMockExecutionContext(mockRequest);
      mockTokenService.verifyAsync.mockResolvedValue(validPayload);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(mockTokenService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(mockTokenService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(validPayload);
    });

    it('should throw UnauthorizedException when ACCESS_TOKEN cookie is missing', async () => {
      // Arrange
      const mockRequest: Partial<Request> & {
        user?: TokenPayload;
        cookies: { ACCESS_TOKEN?: string };
      } = {
        cookies: {},
      };
      const context = createMockExecutionContext(mockRequest);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Token não fornecido ou cookie ausente',
      );
      expect(mockTokenService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when ACCESS_TOKEN cookie is empty string', async () => {
      // Arrange
      const mockRequest: Partial<Request> & {
        user?: TokenPayload;
        cookies: { ACCESS_TOKEN?: string };
      } = {
        cookies: {
          ACCESS_TOKEN: '',
        },
      };
      const context = createMockExecutionContext(mockRequest);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Token não fornecido ou cookie ausente',
      );
      expect(mockTokenService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should propagate error when tokenService.verifyAsync throws', async () => {
      // Arrange
      const mockRequest: Partial<Request> & {
        user?: TokenPayload;
        cookies: { ACCESS_TOKEN?: string };
      } = {
        cookies: {
          ACCESS_TOKEN: 'invalid-token',
        },
      };
      const context = createMockExecutionContext(mockRequest);
      const error = new Error('Invalid token');
      mockTokenService.verifyAsync.mockRejectedValue(error);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(error);
      expect(mockTokenService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(mockTokenService.verifyAsync).toHaveBeenCalledWith('invalid-token');
    });

    it('should attach exact payload returned by verifyAsync to request.user', async () => {
      // Arrange
      const customPayload: TokenPayload = {
        sub: 'custom-user-id',
        email: 'custom@test.com',
        role: Roles.ADMIN,
      };
      const mockRequest: Partial<Request> & {
        user?: TokenPayload;
        cookies: { ACCESS_TOKEN?: string };
      } = {
        cookies: {
          ACCESS_TOKEN: 'valid-token',
        },
      };
      const context = createMockExecutionContext(mockRequest);
      mockTokenService.verifyAsync.mockResolvedValue(customPayload);

      // Act
      await guard.canActivate(context);

      // Assert
      expect(mockRequest.user).toBe(customPayload);
      expect(mockRequest.user).toEqual(customPayload);
    });
  });
});
