import { Controller, Get } from '@nestjs/common';
import { AppointmentServices } from './appointment-services.service';

@Controller('services')
export class AppointmentServicesController {
  constructor(private readonly appointmentServices: AppointmentServices) {}

  @Get()
  async findAll() {
    return await this.appointmentServices.findAll();
  }
}
