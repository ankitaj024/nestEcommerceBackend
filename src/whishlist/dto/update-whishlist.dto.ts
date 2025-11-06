import { PartialType } from '@nestjs/swagger';
import { CreateWhishlistDto } from './create-whishlist.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateWhishlistDto extends PartialType(CreateWhishlistDto) {
    @IsString()
    @IsNotEmpty()
    id: string;
}
