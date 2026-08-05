import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type Redis from 'ioredis';
import { CacheService } from './cache.service';
import { REDIS_CLIENT } from './constants/redis-client';

describe('CacheService', () => {
  let service: CacheService;
  let mockRedis: jest.Mocked<Redis>;

  beforeAll(async () => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      exists: jest.fn(),
      del: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService, { provide: REDIS_CLIENT, useValue: mockRedis }],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return value when key exists', async () => {
      // Arrange
      const key = 'test-key';
      const expectedValue = 'test-value';
      mockRedis.get.mockResolvedValue(expectedValue);

      // Act
      const result = await service.get(key);

      // Assert
      expect(result).toBe(expectedValue);
      expect(mockRedis.get).toHaveBeenCalledTimes(1);
      expect(mockRedis.get).toHaveBeenCalledWith(key);
    });

    it('should return null when key does not exist', async () => {
      // Arrange
      const key = 'non-existent-key';
      mockRedis.get.mockResolvedValue(null);

      // Act
      const result = await service.get(key);

      // Assert
      expect(result).toBeNull();
      expect(mockRedis.get).toHaveBeenCalledTimes(1);
      expect(mockRedis.get).toHaveBeenCalledWith(key);
    });

    it('should propagate Redis errors', async () => {
      // Arrange
      const key = 'test-key';
      const redisError = new Error('Redis connection failed');
      mockRedis.get.mockRejectedValue(redisError);

      // Act & Assert
      await expect(service.get(key)).rejects.toThrow('Redis connection failed');
      expect(mockRedis.get).toHaveBeenCalledTimes(1);
      expect(mockRedis.get).toHaveBeenCalledWith(key);
    });
  });

  describe('setNx', () => {
    it('should return true when SET NX succeeds', async () => {
      // Arrange
      const key = 'lock-key';
      const value = 'user-id';
      const ttl = 300;
      mockRedis.set.mockResolvedValue('OK');

      // Act
      const result = await service.setNx(key, value, ttl);

      // Assert
      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledTimes(1);
      expect(mockRedis.set).toHaveBeenCalledWith(key, value, 'EX', ttl, 'NX');
    });

    it('should return false when key already exists (SET NX fails)', async () => {
      // Arrange
      const key = 'lock-key';
      const value = 'user-id';
      const ttl = 300;
      mockRedis.set.mockResolvedValue(null);

      // Act
      const result = await service.setNx(key, value, ttl);

      // Assert
      expect(result).toBe(false);
      expect(mockRedis.set).toHaveBeenCalledTimes(1);
      expect(mockRedis.set).toHaveBeenCalledWith(key, value, 'EX', ttl, 'NX');
    });

    it('should call redis.set with correct parameters including EX and NX flags', async () => {
      // Arrange
      const key = 'custom-lock';
      const value = 'custom-value';
      const ttl = 600;
      mockRedis.set.mockResolvedValue('OK');

      // Act
      await service.setNx(key, value, ttl);

      // Assert
      expect(mockRedis.set).toHaveBeenCalledTimes(1);
      expect(mockRedis.set).toHaveBeenCalledWith(key, value, 'EX', ttl, 'NX');
    });

    it('should propagate Redis errors', async () => {
      // Arrange
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 300;
      const redisError = new Error('Redis connection failed');
      mockRedis.set.mockRejectedValue(redisError);

      // Act & Assert
      await expect(service.setNx(key, value, ttl)).rejects.toThrow('Redis connection failed');
      expect(mockRedis.set).toHaveBeenCalledTimes(1);
      expect(mockRedis.set).toHaveBeenCalledWith(key, value, 'EX', ttl, 'NX');
    });
  });

  describe('exists', () => {
    it('should return 1 when key exists', async () => {
      // Arrange
      const key = 'existing-key';
      mockRedis.exists.mockResolvedValue(1);

      // Act
      const result = await service.exists(key);

      // Assert
      expect(result).toBe(1);
      expect(mockRedis.exists).toHaveBeenCalledTimes(1);
      expect(mockRedis.exists).toHaveBeenCalledWith(key);
    });

    it('should return 0 when key does not exist', async () => {
      // Arrange
      const key = 'non-existing-key';
      mockRedis.exists.mockResolvedValue(0);

      // Act
      const result = await service.exists(key);

      // Assert
      expect(result).toBe(0);
      expect(mockRedis.exists).toHaveBeenCalledTimes(1);
      expect(mockRedis.exists).toHaveBeenCalledWith(key);
    });

    it('should propagate Redis errors', async () => {
      // Arrange
      const key = 'test-key';
      const redisError = new Error('Redis connection failed');
      mockRedis.exists.mockRejectedValue(redisError);

      // Act & Assert
      await expect(service.exists(key)).rejects.toThrow('Redis connection failed');
      expect(mockRedis.exists).toHaveBeenCalledTimes(1);
      expect(mockRedis.exists).toHaveBeenCalledWith(key);
    });
  });

  describe('remove', () => {
    it('should call redis.del with the correct key', async () => {
      // Arrange
      const key = 'key-to-remove';
      mockRedis.del.mockResolvedValue(1);

      // Act
      await service.remove(key);

      // Assert
      expect(mockRedis.del).toHaveBeenCalledTimes(1);
      expect(mockRedis.del).toHaveBeenCalledWith(key);
    });

    it('should not throw when key does not exist (del returns 0)', async () => {
      // Arrange
      const key = 'non-existing-key';
      mockRedis.del.mockResolvedValue(0);

      // Act & Assert
      await expect(service.remove(key)).resolves.toBeUndefined();
      expect(mockRedis.del).toHaveBeenCalledTimes(1);
      expect(mockRedis.del).toHaveBeenCalledWith(key);
    });

    it('should propagate Redis errors', async () => {
      // Arrange
      const key = 'test-key';
      const redisError = new Error('Redis connection failed');
      mockRedis.del.mockRejectedValue(redisError);

      // Act & Assert
      await expect(service.remove(key)).rejects.toThrow('Redis connection failed');
      expect(mockRedis.del).toHaveBeenCalledTimes(1);
      expect(mockRedis.del).toHaveBeenCalledWith(key);
    });
  });
});
