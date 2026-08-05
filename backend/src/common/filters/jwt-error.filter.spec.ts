import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtErrorFilter } from './jwt-error.filter';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import type { ArgumentsHost } from '@nestjs/common';
import type { Response, Request } from 'express';

describe('JwtErrorFilter', () => {
  let filter: JwtErrorFilter;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtErrorFilter],
    }).compile();

    filter = module.get<JwtErrorFilter>(JwtErrorFilter);
  });

  const createMockResponse = () => {
    const response: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return response as Response & { status: jest.Mock; json: jest.Mock };
  };

  const createMockRequest = (url: string = '/api/test') => {
    const request: Partial<Request> = {
      url,
    };
    return request as Request;
  };

  const createMockArgumentsHost = (response: Response, request: Request) => {
    return {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;
  };

  describe('catch', () => {
    it('should return 401 with "Token expirado" message for TokenExpiredError', () => {
      // Arrange
      const mockResponse = createMockResponse();
      const mockRequest = createMockRequest('/api/auth/refresh');
      const host = createMockArgumentsHost(mockResponse, mockRequest);
      const exception = new TokenExpiredError('jwt expired', new Date());

      // Act
      filter.catch(exception, host);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Token expirado',
          path: '/api/auth/refresh',
        }),
      );
    });

    it('should return 401 with "Token inválido" message for JsonWebTokenError', () => {
      // Arrange
      const mockResponse = createMockResponse();
      const mockRequest = createMockRequest('/api/scheduling/availability');
      const host = createMockArgumentsHost(mockResponse, mockRequest);
      const exception = new JsonWebTokenError('invalid signature');

      // Act
      filter.catch(exception, host);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Token inválido',
          path: '/api/scheduling/availability',
        }),
      );
    });

    it('should return 401 with "Token inválido" message for generic JsonWebTokenError (malformed token)', () => {
      // Arrange
      const mockResponse = createMockResponse();
      const mockRequest = createMockRequest('/api/admin/appointments');
      const host = createMockArgumentsHost(mockResponse, mockRequest);
      const exception = new JsonWebTokenError('jwt malformed');

      // Act
      filter.catch(exception, host);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Token inválido',
          path: '/api/admin/appointments',
        }),
      );
    });

    it('should include valid ISO timestamp in response', () => {
      // Arrange
      const mockResponse = createMockResponse();
      const mockRequest = createMockRequest('/api/test');
      const host = createMockArgumentsHost(mockResponse, mockRequest);
      const exception = new TokenExpiredError('jwt expired', new Date());
      const beforeCall = new Date();

      // Act
      filter.catch(exception, host);

      // Assert
      const jsonCall = mockResponse.json.mock.calls[0][0];
      const timestamp = jsonCall.timestamp;
      expect(timestamp).toBeDefined();
      expect(typeof timestamp).toBe('string');

      // Verify it's a valid ISO string
      const parsedDate = new Date(timestamp);
      expect(parsedDate.toISOString()).toBe(timestamp);
      expect(parsedDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(parsedDate.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should include request URL as path in response', () => {
      // Arrange
      const testUrls = [
        '/api/login',
        '/api/admin/login',
        '/api/scheduling/locks',
        '/api/appointments/123',
        '/',
      ];

      testUrls.forEach((url) => {
        // Reset mocks for each iteration
        jest.clearAllMocks();

        const mockResponse = createMockResponse();
        const mockRequest = createMockRequest(url);
        const host = createMockArgumentsHost(mockResponse, mockRequest);
        const exception = new JsonWebTokenError('invalid token');

        // Act
        filter.catch(exception, host);

        // Assert
        const jsonCall = mockResponse.json.mock.calls[0][0];
        expect(jsonCall.path).toBe(url);
      });
    });

    it('should return response object with correct structure', () => {
      // Arrange
      const mockResponse = createMockResponse();
      const mockRequest = createMockRequest('/api/test');
      const host = createMockArgumentsHost(mockResponse, mockRequest);
      const exception = new TokenExpiredError('jwt expired', new Date());

      // Act
      const result = filter.catch(exception, host);

      // Assert
      // The filter returns the response object
      expect(result).toBe(mockResponse);
    });
  });
});
