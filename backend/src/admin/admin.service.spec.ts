import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DatabaseService } from '@database/database.service';
import type { AdminAppointmentsQueryDto } from './dto/admin-appointments-query.dto';
import type { AdminAppointmentDetailDto } from './dto/admin-appointment-detail.dto';
import type { AdminAppointmentsResponseDto } from './dto/admin-appointments-response.dto';
import type { UpdateStatusRequestDto } from './dto/update-status-request.dto';
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { AppointmentStatus } from '@prisma/client';
import { addDays } from 'date-fns';

describe('AdminService', () => {
  let service: AdminService;
  let mockDatabaseService: DeepMockProxy<DatabaseService>;

  const mockAppointment = {
    id: 'apt-123',
    user_id: 'user-123',
    service_id: 'service-123',
    clientName: 'John Doe',
    clientPhone: '+5511999999999',
    user: { email: 'john@test.com' },
    service: { name: 'Corte de Cabelo' },
    date: new Date('2026-08-15'),
    time: '14:00',
    status: AppointmentStatus.CONFIRMED,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
  };

  const mockAppointmentDetailDto: AdminAppointmentDetailDto = {
    id: 'apt-123',
    clientName: 'John Doe',
    clientPhone: '+5511999999999',
    clientEmail: 'john@test.com',
    serviceName: 'Corte de Cabelo',
    date: new Date('2026-08-15'),
    time: '14:00',
    status: AppointmentStatus.CONFIRMED,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
  };

  const mockResponseDto: AdminAppointmentsResponseDto = {
    appointments: [mockAppointmentDetailDto],
    total: 1,
  };

  beforeAll(async () => {
    mockDatabaseService = mockDeep<DatabaseService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: DatabaseService, useValue: mockDatabaseService }],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listAppointments', () => {
    it('should return appointments filtered by date', async () => {
      // Arrange
      const queryDto: AdminAppointmentsQueryDto = {
        date: '2026-08-15',
      };

      const targetDate = new Date(queryDto.date!);
      const expectedWhere = {
        date: {
          gte: targetDate,
          lt: addDays(targetDate, 1),
        },
      };

      mockDatabaseService.appointment.findMany.mockResolvedValue([mockAppointment]);

      // Act
      const result = await service.listAppointments(queryDto);

      // Assert
      expect(result).toEqual(mockResponseDto);
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: {
          user: { select: { email: true } },
          service: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
      });
    });

    it('should return appointments filtered by status', async () => {
      // Arrange
      const queryDto: AdminAppointmentsQueryDto = {
        status: AppointmentStatus.SCHEDULED,
      };

      const expectedWhere = {
        status: AppointmentStatus.SCHEDULED,
      };

      mockDatabaseService.appointment.findMany.mockResolvedValue([mockAppointment]);

      // Act
      const result = await service.listAppointments(queryDto);

      // Assert
      expect(result).toEqual(mockResponseDto);
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: {
          user: { select: { email: true } },
          service: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
      });
    });

    it('should return appointments filtered by both date and status', async () => {
      // Arrange
      const queryDto: AdminAppointmentsQueryDto = {
        date: '2026-08-15',
        status: AppointmentStatus.SCHEDULED,
      };

      const targetDate = new Date(queryDto.date!);
      const expectedWhere = {
        date: {
          gte: targetDate,
          lt: addDays(targetDate, 1),
        },
        status: AppointmentStatus.SCHEDULED,
      };

      mockDatabaseService.appointment.findMany.mockResolvedValue([mockAppointment]);

      // Act
      const result = await service.listAppointments(queryDto);

      // Assert
      expect(result).toEqual(mockResponseDto);
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: {
          user: { select: { email: true } },
          service: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
      });
    });

    it('should return all appointments when no filters provided', async () => {
      // Arrange
      const queryDto: AdminAppointmentsQueryDto = {};

      mockDatabaseService.appointment.findMany.mockResolvedValue([mockAppointment]);

      // Act
      const result = await service.listAppointments(queryDto);

      // Assert
      expect(result).toEqual(mockResponseDto);
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: { select: { email: true } },
          service: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
      });
    });

    it('should return empty array when no appointments found', async () => {
      // Arrange
      const queryDto: AdminAppointmentsQueryDto = {
        date: '2026-08-20',
      };

      mockDatabaseService.appointment.findMany.mockResolvedValue([]);

      // Act
      const result = await service.listAppointments(queryDto);

      // Assert
      expect(result).toEqual({ appointments: [], total: 0 });
      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateStatus', () => {
    it('should update appointment status and return updated appointment', async () => {
      // Arrange
      const id = 'apt-123';
      const updateStatusDto: UpdateStatusRequestDto = {
        status: AppointmentStatus.CANCELLED,
      };

      const updatedAppointment = {
        ...mockAppointment,
        status: AppointmentStatus.CANCELLED,
        updatedAt: new Date(),
      };

      const expectedResult: AdminAppointmentDetailDto = {
        ...mockAppointmentDetailDto,
        status: AppointmentStatus.CANCELLED,
        updatedAt: updatedAppointment.updatedAt,
      };

      mockDatabaseService.appointment.update.mockResolvedValue(updatedAppointment);

      // Act
      const result = await service.updateStatus(id, updateStatusDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockDatabaseService.appointment.update).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.update).toHaveBeenCalledWith({
        where: { id },
        data: { status: AppointmentStatus.CANCELLED },
        include: {
          user: { select: { email: true } },
          service: { select: { name: true } },
        },
      });
    });

    it('should throw NotFoundException when appointment does not exist', async () => {
      // Arrange
      const id = 'non-existent-id';
      const updateStatusDto: UpdateStatusRequestDto = {
        status: AppointmentStatus.CANCELLED,
      };

      mockDatabaseService.appointment.update.mockResolvedValue(null as any);

      // Act & Assert
      const promise = service.updateStatus(id, updateStatusDto);
      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Agendamento não encontrado');
      expect(mockDatabaseService.appointment.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteAppointment', () => {
    it('should delete appointment when it exists', async () => {
      // Arrange
      const id = 'apt-123';

      mockDatabaseService.appointment.findUnique.mockResolvedValue(mockAppointment);
      mockDatabaseService.appointment.delete.mockResolvedValue(mockAppointment);

      // Act
      await service.deleteAppointment(id);

      // Assert
      expect(mockDatabaseService.appointment.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(mockDatabaseService.appointment.delete).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException when appointment does not exist', async () => {
      // Arrange
      const id = 'non-existent-id';

      mockDatabaseService.appointment.findUnique.mockResolvedValue(null);

      // Act & Assert
      const promise = service.deleteAppointment(id);
      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('Agendamento não encontrado');
      expect(mockDatabaseService.appointment.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.appointment.delete).not.toHaveBeenCalled();
    });
  });
});
