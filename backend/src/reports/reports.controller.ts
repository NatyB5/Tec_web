import { Controller, Get, Post, Query, Req, ForbiddenException } from '@nestjs/common';
import { IsPublic } from '../auth/decorators/is-public.decorator';
import { ReportsService } from './reports.service';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('relatorio1')
  getRelatorio1(@Req() req: AuthenticatedRequest, @Query('userId') userId?: string) {
    const targetId = userId ? parseInt(userId, 10) : undefined;
    return this.reportsService.relatorio1(req.user, targetId);
  }

  @Get('relatorio2')
  @IsPublic()
  getRelatorio2() {
    return this.reportsService.relatorio2();
  }

  @Post('seed')
  @IsPublic()
  seed() {
    return this.reportsService.seedExemplo();
  }
}
