import { PartialType } from '@nestjs/mapped-types';
import { CreateProductSubPartDto } from './create-product-sub-part.dto';

export class UpdateProductSubPartDto extends PartialType(CreateProductSubPartDto) {}
