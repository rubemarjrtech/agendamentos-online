import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { Roles } from '@prisma/client';
import type { Request } from 'express';

describe('RoleGuard', () => {
  let guard: RoleGuard;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleGuard],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
  });

  const createMockExecutionContext = (request: Partial<Request> = {}) => {
    return {
      switchToHttp: () => ({
        getRequest: () => request as Request,
      }),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should return true when user has ADMIN role', () => {
      // Arrange
      const mockRequest = {
        user: {
          role: Roles.ADMIN,
        },
      } as Partial<Request>;
      const context = createMockExecutionContext(mockRequest);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user has CLIENT role', () => {
      // Arrange
      const mockRequest = {
        user: {
          role: Roles.CLIENT,
        },
      } as Partial<Request>;
      const context = createMockExecutionContext(mockRequest);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Acesso permitido apenas para administradores',
      );
    });

    it('should throw ForbiddenException when user exists but has no role property', () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: 'some-user-id',
          email: 'test@test.com',
        },
      } as Partial<Request>;
      const context = createMockExecutionContext(mockRequest);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Acesso permitido apenas para administradores',
      );
    });

    it('should throw ForbiddenException when user is null', () => {
      // Arrange
      const mockRequest = {
        user: null,
      } as Partial<Request>;
      const context = createMockExecutionContext(mockRequest);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Acesso permitido apenas para administradores',
      );
    });

    it('should throw ForbiddenException when user is undefined', () => {
      // Arrange
      const mockRequest = {
        user: undefined,
      } as Partial<Request>;
      const context = createMockExecutionContext(mockRequest);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Acesso permitido apenas para administradores',
      );
    });

    it('should throw ForbiddenException when request has no user property', () => {
      // Arrange
      const mockRequest = {} as Partial<Request>;
      const context = createMockExecutionContext(mockRequest);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Acesso permitido apenas para administradores',
      );
    });
  });
});
