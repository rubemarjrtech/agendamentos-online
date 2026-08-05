import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import tokenConfig from './config/token-config';
import type { ConfigType } from '@nestjs/config';

describe('TokenService', () => {
  let service: TokenService;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockTokenConfig: ConfigType<typeof tokenConfig>;

  beforeAll(async () => {
    mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    mockTokenConfig = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '7d',
      JWT_AUD: 'test-audience',
      JWT_ISSUER: 'test-issuer',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: tokenConfig.KEY, useValue: mockTokenConfig },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAsync', () => {
    it('should return a JWT string when payload is valid', async () => {
      // Arrange
      const payload = { sub: 'user-123', email: 'test@test.com', role: 'CLIENT' };
      const expectedToken = 'generated.jwt.token';
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.generateAsync(payload);

      // Assert
      expect(result).toBe(expectedToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: mockTokenConfig.JWT_SECRET,
        audience: mockTokenConfig.JWT_AUD,
        issuer: mockTokenConfig.JWT_ISSUER,
      });
    });

    it('should propagate error when jwtService.signAsync throws', async () => {
      // Arrange
      const payload = { sub: 'user-123', email: 'test@test.com', role: 'CLIENT' };
      const error = new Error('Signing failed');
      mockJwtService.signAsync.mockRejectedValue(error);

      // Act & Assert
      await expect(service.generateAsync(payload)).rejects.toThrow(error);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyAsync', () => {
    it('should return decoded payload when token is valid', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const expectedPayload = {
        sub: 'user-123',
        email: 'test@test.com',
        role: 'CLIENT',
        iat: 123456,
        exp: 123456,
        aud: 'test-audience',
        iss: 'test-issuer',
      };
      mockJwtService.verifyAsync.mockResolvedValue(expectedPayload);

      // Act
      const result = await service.verifyAsync<typeof expectedPayload>(token);

      // Assert
      expect(result).toEqual(expectedPayload);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: mockTokenConfig.JWT_SECRET,
        audience: mockTokenConfig.JWT_AUD,
        issuer: mockTokenConfig.JWT_ISSUER,
      });
    });

    it('should propagate error when jwtService.verifyAsync throws (expired token)', async () => {
      // Arrange
      const token = 'expired.jwt.token';
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      mockJwtService.verifyAsync.mockRejectedValue(error);

      // Act & Assert
      await expect(service.verifyAsync(token)).rejects.toThrow(error);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: mockTokenConfig.JWT_SECRET,
        audience: mockTokenConfig.JWT_AUD,
        issuer: mockTokenConfig.JWT_ISSUER,
      });
    });

    it('should propagate error when jwtService.verifyAsync throws (invalid token)', async () => {
      // Arrange
      const token = 'invalid.jwt.token';
      const error = new Error('invalid signature');
      error.name = 'JsonWebTokenError';
      mockJwtService.verifyAsync.mockRejectedValue(error);

      // Act & Assert
      await expect(service.verifyAsync(token)).rejects.toThrow(error);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(1);
    });
  });
});
