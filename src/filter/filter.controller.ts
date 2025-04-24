import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FilterService } from './filter.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';

@Controller('filter')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Post()
  create(@Body() createFilterDto: CreateFilterDto) {
    return this.filterService.create(createFilterDto);
  }

  @Get()
  findAll(@Query() filter:any) {
    return this.filterService.getProductByFilters(filter);
  }
}