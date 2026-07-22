import { Module } from '@nestjs/common';
import { AppointmentServices } from './appointment-services.service';
import { AppointmentServicesController } from './appointment-services.controller';

@Module({
  providers: [AppointmentServices],
  controllers: [AppointmentServicesController],
})
export class AppointmentServicesModule {}
