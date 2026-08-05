import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseService } from '@database/database.service';
import { HashServiceProtocol } from './hash/hash.service.protocol';
import { TokenServiceProtocol } from '@token/token.service.protocol';
import authConfig from './config/auth-config';
import type { ConfigType } from '@nestjs/config';
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Roles } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let mockDatabaseService: DeepMockProxy<DatabaseService>;
  let mockHashService: jest.Mocked<HashServiceProtocol>;
  let mockTokenService: jest.Mocked<TokenServiceProtocol>;
  let mockAuthConfig: ConfigType<typeof authConfig>;

  const validUser = {
    id: 'cm1user123',
    email: 'test@test.com',
    passwordHash: 'hashed-password',
    role: Roles.CLIENT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const validAdminConfig = {
    ADMIN_EMAIL: 'admin@test.com',
    ADMIN_PASSWORD: 'admin123',
  };

  beforeAll(async () => {
    mockDatabaseService = mockDeep<DatabaseService>();
    mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    mockTokenService = {
      generateAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    mockAuthConfig = validAdminConfig;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: HashServiceProtocol, useValue: mockHashService },
        { provide: TokenServiceProtocol, useValue: mockTokenService },
        { provide: authConfig.KEY, useValue: mockAuthConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return AuthResponseDto with token and user when email is new', async () => {
      // Arrange
      const email = 'new@test.com';
      const password = 'StrongPass123!';
      const hashedPassword = 'hashed-password';
      const generatedToken = 'generated.jwt.token';

      mockDatabaseService.user.findUnique.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue(hashedPassword);
      mockDatabaseService.user.create.mockResolvedValue({
        ...validUser,
        id: 'cm1newuser456',
        email,
        passwordHash: hashedPassword,
        role: Roles.CLIENT,
      });
      mockTokenService.generateAsync.mockResolvedValue(generatedToken);

      // Act
      const result = await service.register(email, password);

      // Assert
      expect(result).toEqual({
        accessToken: generatedToken,
        user: {
          id: 'cm1newuser456',
          email,
          role: Roles.CLIENT,
        },
      });
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(mockHashService.hash).toHaveBeenCalledTimes(1);
      expect(mockHashService.hash).toHaveBeenCalledWith(password);
      expect(mockDatabaseService.user.create).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.user.create).toHaveBeenCalledWith({
        data: { email, passwordHash: hashedPassword, role: Roles.CLIENT },
      });
      expect(mockTokenService.generateAsync).toHaveBeenCalledTimes(1);
      expect(mockTokenService.generateAsync).toHaveBeenCalledWith({
        sub: 'cm1newuser456',
        email,
        role: Roles.CLIENT,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const email = 'existing@test.com';
      const password = 'StrongPass123!';

      mockDatabaseService.user.findUnique.mockResolvedValue(validUser);

      // Act & Assert
      const promise = service.register(email, password);
      await expect(promise).rejects.toThrow(ConflictException);
      await expect(promise).rejects.toThrow('E-mail já cadastrado');
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockHashService.hash).not.toHaveBeenCalled();
      expect(mockDatabaseService.user.create).not.toHaveBeenCalled();
      expect(mockTokenService.generateAsync).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return AuthResponseDto with token and user when credentials are valid', async () => {
      // Arrange
      const email = 'test@test.com';
      const password = 'StrongPass123!';
      const generatedToken = 'generated.jwt.token';

      mockDatabaseService.user.findUnique.mockResolvedValue(validUser);
      mockHashService.compare.mockResolvedValue(true);
      mockTokenService.generateAsync.mockResolvedValue(generatedToken);

      // Act
      const result = await service.login(email, password);

      // Assert
      expect(result).toEqual({
        accessToken: generatedToken,
        user: {
          id: validUser.id,
          email: validUser.email,
          role: validUser.role,
        },
      });
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(mockHashService.compare).toHaveBeenCalledTimes(1);
      expect(mockHashService.compare).toHaveBeenCalledWith(password, validUser.passwordHash);
      expect(mockTokenService.generateAsync).toHaveBeenCalledTimes(1);
      expect(mockTokenService.generateAsync).toHaveBeenCalledWith({
        sub: validUser.id,
        email: validUser.email,
        role: validUser.role,
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const email = 'nonexistent@test.com';
      const password = 'StrongPass123!';

      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      const promise = service.login(email, password);
      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Credenciais inválidas');
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockHashService.compare).not.toHaveBeenCalled();
      expect(mockTokenService.generateAsync).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when password is invalid', async () => {
      // Arrange
      const email = 'test@test.com';
      const password = 'WrongPass123!';

      mockDatabaseService.user.findUnique.mockResolvedValue(validUser);
      mockHashService.compare.mockResolvedValue(false);

      // Act & Assert
      const promise = service.login(email, password);
      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Credenciais inválidas');
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockHashService.compare).toHaveBeenCalledTimes(1);
      expect(mockTokenService.generateAsync).not.toHaveBeenCalled();
    });
  });

  describe('adminLogin', () => {
    it('should return AuthResponseDto with ADMIN role when credentials match config', async () => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'admin123';
      const generatedToken = 'admin.jwt.token';

      mockTokenService.generateAsync.mockResolvedValue(generatedToken);

      // Act
      const result = await service.adminLogin(email, password);

      // Assert
      expect(result).toEqual({
        accessToken: generatedToken,
        user: {
          id: 'admin',
          email,
          role: Roles.ADMIN,
        },
      });
      expect(mockTokenService.generateAsync).toHaveBeenCalledTimes(1);
      expect(mockTokenService.generateAsync).toHaveBeenCalledWith({
        sub: 'admin',
        email,
        role: Roles.ADMIN,
      });
      expect(mockDatabaseService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when email does not match config', async () => {
      // Arrange
      const email = 'wrong@admin.com';
      const password = 'admin123';

      // Act & Assert
      const promise = service.adminLogin(email, password);
      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Credenciais inválidas');
      expect(mockTokenService.generateAsync).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when password does not match config', async () => {
      // Arrange
      const email = 'admin@test.com';
      const password = 'wrongpassword';

      // Act & Assert
      const promise = service.adminLogin(email, password);
      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Credenciais inválidas');
      expect(mockTokenService.generateAsync).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when both email and password are wrong', async () => {
      // Arrange
      const email = 'wrong@admin.com';
      const password = 'wrongpassword';

      // Act & Assert
      const promise = service.adminLogin(email, password);
      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Credenciais inválidas');
      expect(mockTokenService.generateAsync).not.toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('should return MeResponseDto when user exists', async () => {
      // Arrange
      const userId = 'cm1user123';

      mockDatabaseService.user.findUnique.mockResolvedValue(validUser);

      // Act
      const result = await service.me(userId);

      // Assert
      expect(result).toEqual({
        id: validUser.id,
        email: validUser.email,
        role: validUser.role,
      });
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'nonexistent-user';

      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      const promise = service.me(userId);
      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Usuário não encontrado');
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
