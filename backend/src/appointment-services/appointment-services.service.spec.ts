import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AppointmentServices } from './appointment-services.service';
import { DatabaseService } from '@database/database.service';
import type { FindServicesRespondeDto } from './dtos/find-services-response.dto';
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('AppointmentServices', () => {
  let service: AppointmentServices;
  let mockDatabaseService: DeepMockProxy<DatabaseService>;

  beforeAll(async () => {
    mockDatabaseService = mockDeep<DatabaseService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentServices, { provide: DatabaseService, useValue: mockDatabaseService }],
    }).compile();

    service = module.get<AppointmentServices>(AppointmentServices);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return empty array when no services exist', async () => {
      // Arrange
      mockDatabaseService.service.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(mockDatabaseService.service.findMany).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.service.findMany).toHaveBeenCalledWith();
    });

    it('should return mapped services with id, name, and duration', async () => {
      // Arrange
      const mockServices = [
        { id: 'service-1', name: 'Corte de Cabelo', duration: 30, active: true },
        { id: 'service-2', name: 'Barba', duration: 20, active: true },
        { id: 'service-3', name: 'Corte + Barba', duration: 45, active: true },
      ];
      mockDatabaseService.service.findMany.mockResolvedValue(mockServices);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toEqual<FindServicesRespondeDto[]>([
        { id: 'service-1', name: 'Corte de Cabelo', duration: 30 },
        { id: 'service-2', name: 'Barba', duration: 20 },
        { id: 'service-3', name: 'Corte + Barba', duration: 45 },
      ]);
      expect(mockDatabaseService.service.findMany).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.service.findMany).toHaveBeenCalledWith();
    });

    it('should return single service when only one exists', async () => {
      // Arrange
      const mockServices = [
        { id: 'service-1', name: 'Corte de Cabelo', duration: 30, active: true },
      ];
      mockDatabaseService.service.findMany.mockResolvedValue(mockServices);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 'service-1', name: 'Corte de Cabelo', duration: 30 });
      expect(mockDatabaseService.service.findMany).toHaveBeenCalledTimes(1);
    });

    it('should propagate DatabaseService errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockDatabaseService.service.findMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.findAll()).rejects.toThrow('Database connection failed');
      expect(mockDatabaseService.service.findMany).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.service.findMany).toHaveBeenCalledWith();
    });

    it('should only return id, name, and duration fields (not active)', async () => {
      // Arrange
      const mockServices = [
        {
          id: 'service-1',
          name: 'Corte de Cabelo',
          duration: 30,
          active: true,
        },
      ];
      mockDatabaseService.service.findMany.mockResolvedValue(mockServices);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('duration');
      // active field should not be in the response DTO
      expect(result[0]).not.toHaveProperty('active');
    });
  });
});
