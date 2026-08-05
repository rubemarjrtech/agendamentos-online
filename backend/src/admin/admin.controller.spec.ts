import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import type { AdminAppointmentsQueryDto } from './dto/admin-appointments-query.dto';
import type { AdminAppointmentsResponseDto } from './dto/admin-appointments-response.dto';
import type { AdminAppointmentDetailDto } from './dto/admin-appointment-detail.dto';
import type { UpdateStatusRequestDto } from './dto/update-status-request.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RoleGuard } from '@common/guards/role.guard';
import { AppointmentStatus } from '@prisma/client';

describe('AdminController', () => {
  let controller: AdminController;
  let mockAdminService: jest.Mocked<
    Pick<AdminService, 'listAppointments' | 'updateStatus' | 'deleteAppointment'>
  >;

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
    mockAdminService = {
      listAppointments: jest.fn(),
      updateStatus: jest.fn(),
      deleteAppointment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: mockAdminService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listAppointments', () => {
    it('should call adminService.listAppointments with queryDto and return response', async () => {
      // Arrange
      const queryDto: AdminAppointmentsQueryDto = {
        date: '2026-08-15',
        status: AppointmentStatus.CONFIRMED,
      };
      mockAdminService.listAppointments.mockResolvedValue(mockResponseDto);

      // Act
      const result = await controller.listAppointments(queryDto);

      // Assert
      expect(result).toEqual(mockResponseDto);
      expect(mockAdminService.listAppointments).toHaveBeenCalledTimes(1);
      expect(mockAdminService.listAppointments).toHaveBeenCalledWith(queryDto);
    });

    it('should call adminService.listAppointments with empty queryDto when no filters', async () => {
      // Arrange
      const queryDto: AdminAppointmentsQueryDto = {};
      mockAdminService.listAppointments.mockResolvedValue(mockResponseDto);

      // Act
      const result = await controller.listAppointments(queryDto);

      // Assert
      expect(result).toEqual(mockResponseDto);
      expect(mockAdminService.listAppointments).toHaveBeenCalledTimes(1);
      expect(mockAdminService.listAppointments).toHaveBeenCalledWith(queryDto);
    });

    it('should return empty response when service returns empty array', async () => {
      // Arrange
      const queryDto: AdminAppointmentsQueryDto = { date: '2026-08-20' };
      const emptyResponse: AdminAppointmentsResponseDto = {
        appointments: [],
        total: 0,
      };
      mockAdminService.listAppointments.mockResolvedValue(emptyResponse);

      // Act
      const result = await controller.listAppointments(queryDto);

      // Assert
      expect(result).toEqual(emptyResponse);
      expect(mockAdminService.listAppointments).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateStatus', () => {
    it('should call adminService.updateStatus with id and body and return updated appointment', async () => {
      // Arrange
      const id = 'apt-123';
      const updateStatusDto: UpdateStatusRequestDto = {
        status: AppointmentStatus.CANCELLED,
      };
      const updatedAppointment: AdminAppointmentDetailDto = {
        ...mockAppointmentDetailDto,
        status: AppointmentStatus.CANCELLED,
        updatedAt: new Date(),
      };
      mockAdminService.updateStatus.mockResolvedValue(updatedAppointment);

      // Act
      const result = await controller.updateStatus(id, updateStatusDto);

      // Assert
      expect(result).toEqual(updatedAppointment);
      expect(mockAdminService.updateStatus).toHaveBeenCalledTimes(1);
      expect(mockAdminService.updateStatus).toHaveBeenCalledWith(id, updateStatusDto);
    });

    it('should call adminService.updateStatus with PENDING status', async () => {
      // Arrange
      const id = 'apt-456';
      const updateStatusDto: UpdateStatusRequestDto = {
        status: AppointmentStatus.SCHEDULED,
      };
      const updatedAppointment: AdminAppointmentDetailDto = {
        ...mockAppointmentDetailDto,
        id: 'apt-456',
        status: AppointmentStatus.SCHEDULED,
        updatedAt: new Date(),
      };
      mockAdminService.updateStatus.mockResolvedValue(updatedAppointment);

      // Act
      const result = await controller.updateStatus(id, updateStatusDto);

      // Assert
      expect(result).toEqual(updatedAppointment);
      expect(mockAdminService.updateStatus).toHaveBeenCalledTimes(1);
      expect(mockAdminService.updateStatus).toHaveBeenCalledWith(id, updateStatusDto);
    });
  });

  describe('deleteAppointment', () => {
    it('should call adminService.deleteAppointment with id and return void', async () => {
      // Arrange
      const id = 'apt-123';
      mockAdminService.deleteAppointment.mockResolvedValue(undefined);

      // Act
      const result = await controller.deleteAppointment(id);

      // Assert
      expect(result).toBeUndefined();
      expect(mockAdminService.deleteAppointment).toHaveBeenCalledTimes(1);
      expect(mockAdminService.deleteAppointment).toHaveBeenCalledWith(id);
    });

    it('should call adminService.deleteAppointment with different id', async () => {
      // Arrange
      const id = 'apt-999';
      mockAdminService.deleteAppointment.mockResolvedValue(undefined);

      // Act
      const result = await controller.deleteAppointment(id);

      // Assert
      expect(result).toBeUndefined();
      expect(mockAdminService.deleteAppointment).toHaveBeenCalledTimes(1);
      expect(mockAdminService.deleteAppointment).toHaveBeenCalledWith(id);
    });
  });
});
