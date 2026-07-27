import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import schedulingConfig from './config/scheduling-config';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';
import { AvailabilityResponseDto } from './dto/availability-response.dto';
import { CreateLockResponseDto } from './dto/create-lock-response.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { LockStatus } from './types/lock-status.type';
import { CacheServiceProtocol } from '@cache/cache.service.protocol';
import { TimeSlotDto } from './types/time-slot.type';
import { format, getHours, getMinutes } from 'date-fns';

@Injectable()
export class SchedulingService {
  private readonly BUSINESS_START_HOUR = 9;
  private readonly BUSINESS_END_HOUR = 18;
  private readonly SLOT_DURATION_MINUTES = 30;

  constructor(
    private cacheService: CacheServiceProtocol,
    private databaseService: DatabaseService,
    @Inject(schedulingConfig.KEY)
    private config: ConfigType<typeof schedulingConfig>,
  ) {}

  async checkAvailability(date: string, serviceId: string): Promise<AvailabilityResponseDto> {
    const appointments = await this.databaseService.appointment.findMany({
      where: {
        service_id: serviceId,
        date: new Date(date),
        status: { not: 'CANCELLED' },
      },
      select: {
        time: true,
      },
    });
    const occupiedTimes = new Set(appointments.map((a) => a.time));
    const slots: TimeSlotDto[] = [];
    const totalSlots =
      ((this.BUSINESS_END_HOUR - this.BUSINESS_START_HOUR) * 60) / this.SLOT_DURATION_MINUTES;

    const now = new Date();
    const todayString = format(now, 'yyyy-MM-dd');
    const isToday = date === todayString;
    const currentTotalMinutes = getHours(now) * 60 + getMinutes(now);

    for (let i = 0; i < totalSlots; i++) {
      const totalMinutes = this.BUSINESS_START_HOUR * 60 + i * this.SLOT_DURATION_MINUTES;

      if (isToday && totalMinutes <= currentTotalMinutes) {
        continue;
      }

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      let status: LockStatus = 'AVAILABLE';

      if (occupiedTimes.has(time)) {
        status = 'OCCUPIED';
      } else {
        const lockKey = this.buildLockKey(serviceId, date, time);
        const lockExists = await this.cacheService.exists(lockKey);
        if (lockExists) {
          status = 'LOCKED';
        }
      }

      slots.push({ time, status });
    }

    const response: AvailabilityResponseDto = {
      date,
      serviceId,
      slots,
    };

    return response;
  }

  async acquireLock(
    serviceId: string,
    date: string,
    time: string,
    userId: string,
  ): Promise<CreateLockResponseDto> {
    const lockKey = this.buildLockKey(serviceId, date, time);

    const acquired = await this.cacheService.setNx(
      lockKey,
      userId,
      this.config.REDIS_LOCK_TTL_SECONDS,
    );

    if (!acquired) {
      throw new ConflictException('Horário já reservado');
    }

    const response: CreateLockResponseDto = {
      success: true,
      lockKey,
      expiresAt: new Date(Date.now() + this.config.REDIS_LOCK_TTL_SECONDS * 1000),
    };

    return response;
  }

  async confirmAppointment(
    userId: string,
    data: CreateAppointmentRequestDto,
  ): Promise<AppointmentResponseDto> {
    const lockKey = this.buildLockKey(data.serviceId, data.date, data.time);
    const lockOwner = await this.cacheService.get(lockKey);

    if (lockOwner !== userId) {
      throw new ForbiddenException('Lock não pertence a este usuário ou expirou');
    }

    const appointment = await this.databaseService.appointment.create({
      data: {
        user_id: userId,
        service_id: data.serviceId,
        date: new Date(data.date),
        time: data.time,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        status: 'SCHEDULED',
      },
    });

    await this.cacheService.remove(lockKey);

    const response: AppointmentResponseDto = {
      id: appointment.id,
      userId: appointment.user_id,
      serviceId: appointment.service_id,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      createdAt: appointment.createdAt,
    };

    return response;
  }

  private buildLockKey(serviceId: string, date: string, time: string): string {
    return `${this.config.REDIS_LOCK_PREFIX}:${serviceId}:date:${date}:time:${time}`;
  }
}
