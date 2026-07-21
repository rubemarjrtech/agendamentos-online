import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAppointmentsQueryDto } from './dto/admin-appointments-query.dto';
import { AdminAppointmentsResponseDto } from './dto/admin-appointments-response.dto';
import { UpdateStatusRequestDto } from './dto/update-status-request.dto';
import { AdminAppointmentDetailDto } from './dto/admin-appointment-detail.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RoleGuard } from '@common/guards/role.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('appointments')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async listAppointments(
    @Query() queryDto: AdminAppointmentsQueryDto,
  ): Promise<AdminAppointmentsResponseDto> {
    return await this.adminService.listAppointments(queryDto);
  }

  @Patch('appointments/:id/status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusRequestDto,
  ): Promise<AdminAppointmentDetailDto> {
    return await this.adminService.updateStatus(id, updateStatusDto);
  }

  @Delete('appointments/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAppointment(@Param('id') id: string): Promise<void> {
    return await this.adminService.deleteAppointment(id);
  }
}
