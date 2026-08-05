import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import type { CheckAvailabilityRequestDto } from './dto/check-availability-request.dto';
import type { CreateLockRequestDto } from './dto/create-lock-request.dto';
import type { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';
import type { AvailabilityResponseDto } from './dto/availability-response.dto';
import type { CreateLockResponseDto } from './dto/create-lock-response.dto';
import type { AppointmentResponseDto } from './dto/appointment-response.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TokenServiceProtocol } from '@token/token.service.protocol';

describe('SchedulingController', () => {
  let controller: SchedulingController;
  let mockSchedulingService: jest.Mocked<
    Pick<SchedulingService, 'checkAvailability' | 'acquireLock' | 'confirmAppointment'>
  >;
  let mockTokenService: jest.Mocked<TokenServiceProtocol>;

  const validServiceId = 'cm1serviceid123';
  const validUserId = 'cm1userid123';
  const validDate = '2026-08-15';
  const validTime = '10:30';

  const mockAvailabilityResponse: AvailabilityResponseDto = {
    date: validDate,
    serviceId: validServiceId,
    slots: [
      { time: '09:00', status: 'AVAILABLE' },
      { time: '09:30', status: 'AVAILABLE' },
      { time: '10:00', status: 'OCCUPIED' },
      { time: '10:30', status: 'LOCKED' },
      { time: '11:00', status: 'AVAILABLE' },
    ],
  };

  const mockLockResponse: CreateLockResponseDto = {
    success: true,
    lockKey: `lock:service:${validServiceId}:date:${validDate}:time:${validTime}`,
    expiresAt: new Date(Date.now() + 300 * 1000),
  };

  const mockAppointmentResponse: AppointmentResponseDto = {
    id: 'cm1appointment123',
    userId: validUserId,
    serviceId: validServiceId,
    clientName: 'João Silva',
    clientPhone: '+5511999999999',
    date: new Date(validDate),
    time: validTime,
    status: 'SCHEDULED',
    createdAt: new Date(),
  };

  const mockRequest = {
    user: {
      sub: validUserId,
    },
    cookies: {
      ACCESS_TOKEN: 'valid-token',
    },
  };

  beforeAll(async () => {
    mockSchedulingService = {
      checkAvailability: jest.fn(),
      acquireLock: jest.fn(),
      confirmAppointment: jest.fn(),
    };
    mockTokenService = {
      verifyAsync: jest
        .fn()
        .mockResolvedValue({ sub: validUserId, email: 'test@test.com', role: 'CLIENT' }),
      generateAsync: jest.fn().mockResolvedValue('token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulingController],
      providers: [
        { provide: SchedulingService, useValue: mockSchedulingService },
        { provide: TokenServiceProtocol, useValue: mockTokenService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SchedulingController>(SchedulingController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAvailability', () => {
    it('should call service.checkAvailability with query params and return response', async () => {
      // Arrange
      const queryDto: CheckAvailabilityRequestDto = {
        date: validDate,
        serviceId: validServiceId,
      };
      mockSchedulingService.checkAvailability.mockResolvedValue(mockAvailabilityResponse);

      // Act
      const result = await controller.checkAvailability(queryDto);

      // Assert
      expect(result).toEqual(mockAvailabilityResponse);
      expect(mockSchedulingService.checkAvailability).toHaveBeenCalledTimes(1);
      expect(mockSchedulingService.checkAvailability).toHaveBeenCalledWith(
        validDate,
        validServiceId,
      );
    });

    it('should return AvailabilityResponseDto from service', async () => {
      // Arrange
      const queryDto: CheckAvailabilityRequestDto = {
        date: validDate,
        serviceId: validServiceId,
      };
      mockSchedulingService.checkAvailability.mockResolvedValue(mockAvailabilityResponse);

      // Act
      const result = await controller.checkAvailability(queryDto);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          date: validDate,
          serviceId: validServiceId,
          slots: expect.any(Array),
        }),
      );
      expect(result.slots).toHaveLength(5);
    });
  });

  describe('acquireLock', () => {
    it('should extract userId from request and call service.acquireLock', async () => {
      // Arrange
      const bodyDto: CreateLockRequestDto = {
        serviceId: validServiceId,
        date: validDate,
        time: validTime,
      };
      mockSchedulingService.acquireLock.mockResolvedValue(mockLockResponse);

      // Act
      const result = await controller.acquireLock(bodyDto, mockRequest as any);

      // Assert
      expect(result).toEqual(mockLockResponse);
      expect(mockSchedulingService.acquireLock).toHaveBeenCalledTimes(1);
      expect(mockSchedulingService.acquireLock).toHaveBeenCalledWith(
        validServiceId,
        validDate,
        validTime,
        validUserId,
      );
    });

    it('should return CreateLockResponseDto from service', async () => {
      // Arrange
      const bodyDto: CreateLockRequestDto = {
        serviceId: validServiceId,
        date: validDate,
        time: validTime,
      };
      mockSchedulingService.acquireLock.mockResolvedValue(mockLockResponse);

      // Act
      const result = await controller.acquireLock(bodyDto, mockRequest as any);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          lockKey: mockLockResponse.lockKey,
          expiresAt: expect.any(Date),
        }),
      );
    });
  });

  describe('confirmAppointment', () => {
    it('should extract userId from request and call service.confirmAppointment', async () => {
      // Arrange
      const bodyDto: CreateAppointmentRequestDto = {
        serviceId: validServiceId,
        date: validDate,
        time: validTime,
        clientName: 'João Silva',
        clientPhone: '+5511999999999',
      };
      mockSchedulingService.confirmAppointment.mockResolvedValue(mockAppointmentResponse);

      // Act
      const result = await controller.confirmAppointment(bodyDto, mockRequest as any);

      // Assert
      expect(result).toEqual(mockAppointmentResponse);
      expect(mockSchedulingService.confirmAppointment).toHaveBeenCalledTimes(1);
      expect(mockSchedulingService.confirmAppointment).toHaveBeenCalledWith(validUserId, bodyDto);
    });

    it('should return AppointmentResponseDto from service', async () => {
      // Arrange
      const bodyDto: CreateAppointmentRequestDto = {
        serviceId: validServiceId,
        date: validDate,
        time: validTime,
        clientName: 'João Silva',
        clientPhone: '+5511999999999',
      };
      mockSchedulingService.confirmAppointment.mockResolvedValue(mockAppointmentResponse);

      // Act
      const result = await controller.confirmAppointment(bodyDto, mockRequest as any);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: mockAppointmentResponse.id,
          userId: validUserId,
          serviceId: validServiceId,
          clientName: 'João Silva',
          clientPhone: '+5511999999999',
          date: new Date(validDate),
          time: validTime,
          status: 'SCHEDULED',
          createdAt: expect.any(Date),
        }),
      );
    });
  });
});
