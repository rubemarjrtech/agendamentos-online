import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { CacheServiceProtocol } from '@cache/cache.service.protocol';
import { DatabaseService } from '@database/database.service';
import schedulingConfig from './config/scheduling-config';
import type { TimeSlotDto } from './types/time-slot.type';
import type { ConfigType } from '@nestjs/config';
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended';
import type { AppointmentStatus } from '@prisma/client';
import { format } from 'date-fns';
describe('SchedulingService', () => {
  let service: SchedulingService;
  let mockCacheService: jest.Mocked<CacheServiceProtocol>;
  let mockDatabaseService: DeepMockProxy<DatabaseService>;
  let mockConfig: ConfigType<typeof schedulingConfig>;

  const validServiceId = 'cm1serviceid123';
  const validUserId = 'cm1userid123';
  const validDate = '2026-08-15';
  const validTime = '10:30';
  const validLockKey = `lock:service:${validServiceId}:date:${validDate}:time:${validTime}`;

  const baseMockAppointment = {
    id: 'cm1appointment123',
    user_id: validUserId,
    service_id: validServiceId,
    clientName: 'João Silva',
    clientPhone: '+5511999999999',
    date: new Date(validDate),
    status: 'SCHEDULED' as AppointmentStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAppointments = [
    { ...baseMockAppointment, id: 'cm1appt1', time: '10:00' },
    { ...baseMockAppointment, id: 'cm1appt2', time: '14:30' },
  ];

  beforeAll(async () => {
    mockCacheService = {
      get: jest.fn(),
      setNx: jest.fn(),
      remove: jest.fn(),
      exists: jest.fn(),
    };

    mockDatabaseService = mockDeep<DatabaseService>();

    mockConfig = {
      REDIS_LOCK_PREFIX: 'lock:service',
      REDIS_LOCK_TTL_SECONDS: 300,
      POLLING_INTERVAL_MS: 5000,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        { provide: CacheServiceProtocol, useValue: mockCacheService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: schedulingConfig.KEY, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAvailability', () => {
    it('should return AVAILABLE slots when no appointments or locks exist', async () => {
      // Arrange
      mockDatabaseService.appointment.findMany.mockResolvedValue([]);
      mockCacheService.exists.mockResolvedValue(0);

      // Act
      const result = await service.checkAvailability(validDate, validServiceId);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          date: validDate,
          serviceId: validServiceId,
          slots: expect.any(Array),
        }),
      );
      expect(result.slots).toHaveLength(18);
      expect(result.slots.every((slot: TimeSlotDto) => slot.status === 'AVAILABLE')).toBe(true);
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledWith({
        where: {
          service_id: validServiceId,
          date: new Date(validDate),
          status: { not: 'CANCELLED' },
        },
        select: { time: true },
      });
      expect(mockCacheService.exists).toHaveBeenCalledTimes(18);
    });

    it('should return OCCUPIED for times with existing appointments (not CANCELLED)', async () => {
      // Arrange
      mockDatabaseService.appointment.findMany.mockResolvedValue(mockAppointments);
      mockCacheService.exists.mockResolvedValue(0);

      // Act
      const result = await service.checkAvailability(validDate, validServiceId);

      // Assert
      expect(result.slots).toHaveLength(18);
      const occupiedSlot = result.slots.find((s) => s.time === '10:00');
      expect(occupiedSlot?.status).toBe('OCCUPIED');
      const occupiedSlot2 = result.slots.find((s) => s.time === '14:30');
      expect(occupiedSlot2?.status).toBe('OCCUPIED');
      const availableSlot = result.slots.find((s) => s.time === '09:00');
      expect(availableSlot?.status).toBe('AVAILABLE');
    });

    it('should return LOCKED for times with Redis locks', async () => {
      // Arrange
      mockDatabaseService.appointment.findMany.mockResolvedValue([]);
      let callCount = 0;
      mockCacheService.exists.mockImplementation(() => {
        callCount++;
        // Return 1 (locked) for the 10:30 slot (6th slot, index 5)
        // The slots are 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, ...
        // 10:30 is the 4th slot (index 3)
        return Promise.resolve(callCount === 4 ? 1 : 0);
      });

      // Act
      const result = await service.checkAvailability(validDate, validServiceId);

      // Assert
      const lockedSlot = result.slots.find((s) => s.time === '10:30');
      expect(lockedSlot?.status).toBe('LOCKED');
    });

    it('should skip past time slots for today', async () => {
      // Arrange
      const todayString = format(new Date(), 'yyyy-MM-dd');
      mockDatabaseService.appointment.findMany.mockResolvedValue([]);
      mockCacheService.exists.mockResolvedValue(0);

      // Act
      const result = await service.checkAvailability(todayString, validServiceId);

      // Assert
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTotalMinutes = currentHour * 60 + currentMinute;

      // When it's today, past time slots should be skipped entirely (not in the array)
      // So we verify no slots with time <= current time exist in results
      result.slots.forEach((slot) => {
        const [hours, minutes] = slot.time.split(':').map(Number);
        const slotTotalMinutes = hours * 60 + minutes;
        expect(slotTotalMinutes).toBeGreaterThan(currentTotalMinutes);
      });
    });

    it('should return 18 slots (9:00-18:00, 30-min intervals)', async () => {
      // Arrange
      mockDatabaseService.appointment.findMany.mockResolvedValue([]);
      mockCacheService.exists.mockResolvedValue(0);

      // Act
      const result = await service.checkAvailability(validDate, validServiceId);

      // Assert
      expect(result.slots).toHaveLength(18);
      expect(result.slots[0].time).toBe('09:00');
      expect(result.slots[17].time).toBe('17:30');
    });

    it('should check cache exists for each slot not occupied by DB appointment', async () => {
      // Arrange
      mockDatabaseService.appointment.findMany.mockResolvedValue([
        { ...baseMockAppointment, id: 'cm1appt3', time: '10:00' },
      ]);
      mockCacheService.exists.mockResolvedValue(0);

      // Act
      await service.checkAvailability(validDate, validServiceId);

      // Assert
      expect(mockCacheService.exists).toHaveBeenCalledTimes(17);
    });
  });

  describe('acquireLock', () => {
    it('should return success with lockKey and expiresAt on SET NX success', async () => {
      // Arrange
      mockCacheService.setNx.mockResolvedValue(true);
      const expectedExpiresAt = new Date(Date.now() + 300 * 1000);

      // Act
      const result = await service.acquireLock(validServiceId, validDate, validTime, validUserId);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          lockKey: validLockKey,
          expiresAt: expect.any(Date),
        }),
      );
      expect(result.expiresAt!.getTime()).toBeGreaterThanOrEqual(
        expectedExpiresAt.getTime() - 1000,
      );
      expect(result.expiresAt!.getTime()).toBeLessThanOrEqual(expectedExpiresAt.getTime() + 1000);
      expect(mockCacheService.setNx).toHaveBeenCalledTimes(1);
      expect(mockCacheService.setNx).toHaveBeenCalledWith(validLockKey, validUserId, 300);
    });

    it('should throw ConflictException when SET NX fails (lock exists)', async () => {
      // Arrange
      mockCacheService.setNx.mockResolvedValue(false);

      // Act & Assert
      const promise = service.acquireLock(validServiceId, validDate, validTime, validUserId);
      await expect(promise).rejects.toThrow(ConflictException);
      await expect(promise).rejects.toThrow('Horário já reservado');

      expect(mockCacheService.setNx).toHaveBeenCalledTimes(1);
      expect(mockCacheService.setNx).toHaveBeenCalledWith(validLockKey, validUserId, 300);
    });

    it('should build correct lock key format', async () => {
      // Arrange
      mockCacheService.setNx.mockResolvedValue(true);

      // Act
      await service.acquireLock(validServiceId, validDate, validTime, validUserId);

      // Assert
      expect(mockCacheService.setNx).toHaveBeenCalledWith(
        `lock:service:${validServiceId}:date:${validDate}:time:${validTime}`,
        validUserId,
        300,
      );
    });
  });

  describe('confirmAppointment', () => {
    const validAppointmentData = {
      serviceId: validServiceId,
      date: validDate,
      time: validTime,
      clientName: 'João Silva',
      clientPhone: '+5511999999999',
    };

    const mockCreatedAppointment = {
      id: 'cm1appointment123',
      user_id: validUserId,
      service_id: validServiceId,
      date: new Date(validDate),
      time: validTime,
      clientName: 'João Silva',
      clientPhone: '+5511999999999',
      status: 'SCHEDULED' as AppointmentStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create appointment and return AppointmentResponseDto on valid lock', async () => {
      // Arrange
      mockCacheService.get.mockResolvedValue(validUserId);
      mockDatabaseService.appointment.create.mockResolvedValue(mockCreatedAppointment);
      mockCacheService.remove.mockResolvedValue(undefined);

      // Act
      const result = await service.confirmAppointment(validUserId, validAppointmentData);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: mockCreatedAppointment.id,
          userId: mockCreatedAppointment.user_id,
          serviceId: mockCreatedAppointment.service_id,
          clientName: mockCreatedAppointment.clientName,
          clientPhone: mockCreatedAppointment.clientPhone,
          date: mockCreatedAppointment.date,
          time: mockCreatedAppointment.time,
          status: mockCreatedAppointment.status,
          createdAt: mockCreatedAppointment.createdAt,
        }),
      );

      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
      expect(mockCacheService.get).toHaveBeenCalledWith(validLockKey);
      expect(mockDatabaseService.appointment.create).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.create).toHaveBeenCalledWith({
        data: {
          user_id: validUserId,
          service_id: validServiceId,
          date: new Date(validDate),
          time: validTime,
          clientName: 'João Silva',
          clientPhone: '+5511999999999',
          status: 'SCHEDULED',
        },
      });
      expect(mockCacheService.remove).toHaveBeenCalledTimes(1);
      expect(mockCacheService.remove).toHaveBeenCalledWith(validLockKey);
    });

    it('should throw ForbiddenException when lock owner differs from userId', async () => {
      // Arrange
      const otherUserId = 'cm1otheruser456';
      mockCacheService.get.mockResolvedValue(otherUserId);

      // Act & Assert
      const promise = service.confirmAppointment(validUserId, validAppointmentData);
      await expect(promise).rejects.toThrow(ForbiddenException);
      await expect(promise).rejects.toThrow('Lock não pertence a este usuário ou expirou');

      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.create).not.toHaveBeenCalled();
      expect(mockCacheService.remove).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when lock expired (null)', async () => {
      // Arrange
      mockCacheService.get.mockResolvedValue(null);

      // Act & Assert
      const promise = service.confirmAppointment(validUserId, validAppointmentData);
      await expect(promise).rejects.toThrow(ForbiddenException);
      await expect(promise).rejects.toThrow('Lock não pertence a este usuário ou expirou');

      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.create).not.toHaveBeenCalled();
      expect(mockCacheService.remove).not.toHaveBeenCalled();
    });

    it('should remove Redis lock after successful appointment creation', async () => {
      // Arrange
      mockCacheService.get.mockResolvedValue(validUserId);
      mockDatabaseService.appointment.create.mockResolvedValue(mockCreatedAppointment);
      mockCacheService.remove.mockResolvedValue(undefined);

      // Act
      await service.confirmAppointment(validUserId, validAppointmentData);

      // Assert
      expect(mockCacheService.remove).toHaveBeenCalledTimes(1);
      expect(mockCacheService.remove).toHaveBeenCalledWith(validLockKey);
    });

    it('should map all appointment fields correctly in response', async () => {
      // Arrange
      mockCacheService.get.mockResolvedValue(validUserId);
      mockDatabaseService.appointment.create.mockResolvedValue(mockCreatedAppointment);
      mockCacheService.remove.mockResolvedValue(undefined);

      // Act
      const result = await service.confirmAppointment(validUserId, validAppointmentData);

      // Assert
      expect(result.id).toBe('cm1appointment123');
      expect(result.userId).toBe(validUserId);
      expect(result.serviceId).toBe(validServiceId);
      expect(result.clientName).toBe('João Silva');
      expect(result.clientPhone).toBe('+5511999999999');
      expect(result.date).toEqual(new Date(validDate));
      expect(result.time).toBe(validTime);
      expect(result.status).toBe('SCHEDULED');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
});
