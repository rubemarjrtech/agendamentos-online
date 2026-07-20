import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { CheckAvailabilityRequestDto } from './dto/check-availability-request.dto';
import { CreateLockRequestDto } from './dto/create-lock-request.dto';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AvailabilityResponseDto } from './dto/availability-response.dto';
import { CreateLockResponseDto } from './dto/create-lock-response.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';

@Controller('scheduling')
export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  @Get('availability')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async checkAvailability(
    @Query() dto: CheckAvailabilityRequestDto,
  ): Promise<AvailabilityResponseDto> {
    return await this.schedulingService.checkAvailability(dto.date, dto.serviceId);
  }

  @Post('locks')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async acquireLock(
    @Body() dto: CreateLockRequestDto,
    @Req() req: any,
  ): Promise<CreateLockResponseDto> {
    const userId = req.user.sub;
    return await this.schedulingService.acquireLock(dto.serviceId, dto.date, dto.time, userId);
  }

  @Post('appointments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async confirmAppointment(
    @Body() dto: CreateAppointmentRequestDto,
    @Req() req: any,
  ): Promise<AppointmentResponseDto> {
    const userId = req.user.sub;
    return await this.schedulingService.confirmAppointment(userId, dto);
  }
}
