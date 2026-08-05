import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AppointmentServicesController } from './appointment-services.controller';
import { AppointmentServices } from './appointment-services.service';
import type { FindServicesRespondeDto } from './dtos/find-services-response.dto';

describe('AppointmentServicesController', () => {
  let controller: AppointmentServicesController;
  let mockAppointmentServices: jest.Mocked<Pick<AppointmentServices, 'findAll'>>;

  const mockServicesResponse: FindServicesRespondeDto[] = [
    { id: 'service-1', name: 'Corte de Cabelo', duration: 30 },
    { id: 'service-2', name: 'Barba', duration: 20 },
    { id: 'service-3', name: 'Corte + Barba', duration: 45 },
  ];

  beforeAll(async () => {
    mockAppointmentServices = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentServicesController],
      providers: [{ provide: AppointmentServices, useValue: mockAppointmentServices }],
    }).compile();

    controller = module.get<AppointmentServicesController>(AppointmentServicesController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service.findAll and return response', async () => {
      // Arrange
      mockAppointmentServices.findAll.mockResolvedValue(mockServicesResponse);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockServicesResponse);
      expect(mockAppointmentServices.findAll).toHaveBeenCalledTimes(1);
      expect(mockAppointmentServices.findAll).toHaveBeenCalledWith();
    });

    it('should return empty array when no services exist', async () => {
      // Arrange
      mockAppointmentServices.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(mockAppointmentServices.findAll).toHaveBeenCalledTimes(1);
      expect(mockAppointmentServices.findAll).toHaveBeenCalledWith();
    });

    it('should propagate service errors', async () => {
      // Arrange
      const serviceError = new Error('Service error');
      mockAppointmentServices.findAll.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow('Service error');
      expect(mockAppointmentServices.findAll).toHaveBeenCalledTimes(1);
      expect(mockAppointmentServices.findAll).toHaveBeenCalledWith();
    });
  });
});
