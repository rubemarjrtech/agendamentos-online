import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { AdminAppointmentsQueryDto } from './dto/admin-appointments-query.dto';
import { AdminAppointmentDetailDto } from './dto/admin-appointment-detail.dto';
import { AdminAppointmentsResponseDto } from './dto/admin-appointments-response.dto';
import { UpdateStatusRequestDto } from './dto/update-status-request.dto';
import { addDays } from 'date-fns';
import { AppointmentFilters } from './types/appointment-filter.type';

@Injectable()
export class AdminService {
  constructor(private readonly database: DatabaseService) {}

  async listAppointments(
    queryDto: AdminAppointmentsQueryDto,
  ): Promise<AdminAppointmentsResponseDto> {
    const { date, status } = queryDto;

    const where: AppointmentFilters = {};

    if (date) {
      const targetDate = new Date(date);

      where.date = {
        gte: targetDate,
        lt: addDays(targetDate, 1),
      };
    }

    if (status) {
      where.status = status;
    }

    const appointments = await this.database.appointment.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const appointmentsDto: AdminAppointmentDetailDto[] = appointments.map((apt) => ({
      id: apt.id,
      clientName: apt.clientName,
      clientPhone: apt.clientPhone,
      clientEmail: apt.user.email,
      serviceName: apt.service.name,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt,
    }));

    return {
      appointments: appointmentsDto,
      total: appointmentsDto.length,
    };
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusRequestDto,
  ): Promise<AdminAppointmentDetailDto> {
    const appointment = await this.database.appointment.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return {
      id: appointment.id,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      clientEmail: appointment.user.email,
      serviceName: appointment.service.name,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }

  async deleteAppointment(id: string): Promise<void> {
    const appointment = await this.database.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    await this.database.appointment.delete({
      where: { id },
    });
  }
}
