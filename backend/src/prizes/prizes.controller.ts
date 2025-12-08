// path: src/prizes/prizes.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createPrizeDto: CreatePrizeDto) {
    return this.prizesService.create(createPrizeDto);
  }

  @Get()
  findAll() {
    return this.prizesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prizesService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePrizeDto: UpdatePrizeDto) {
    return this.prizesService.update(id, updatePrizeDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prizesService.remove(id);
  }
}

