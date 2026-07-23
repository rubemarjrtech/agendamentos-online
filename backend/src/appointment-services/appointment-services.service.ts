import { DatabaseService } from '@database/database.service';
import { Injectable } from '@nestjs/common';
import { FindServicesRespondeDto } from './dtos/find-services-response.dto';

@Injectable()
export class AppointmentServices {
  constructor(private readonly database: DatabaseService) {}

  async findAll(): Promise<FindServicesRespondeDto[]> {
    const services = await this.database.service.findMany();

    return services.map((service) => ({
      id: service.id,
      name: service.name,
      duration: service.duration,
    }));
  }
}
