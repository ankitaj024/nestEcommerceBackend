import { PartialType } from '@nestjs/swagger';
import { CreateWishlistDto } from './create-wishlist.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
    @IsString()
    @IsNotEmpty()
    id: string;
}
