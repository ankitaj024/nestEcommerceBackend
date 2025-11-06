import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateWishlistDto {
    @ApiProperty({
        description: 'The ID of the product to be added to the wishlist',
        example: '66298f7e1c3fdf3e88b6e2f9',
    })
    @IsString()
    @IsNotEmpty()
    productId: string;
}
