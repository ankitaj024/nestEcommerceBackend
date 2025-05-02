import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Wishlist')
@ApiBearerAuth('access-token')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist successfully' })
  @ApiBody({ type: CreateWishlistDto })
  create(@Req() request: Request, @Body() createWishlistDto: CreateWishlistDto) {
    const userId = (request as any).user.id;
    return this.wishlistService.create(userId, createWishlistDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all wishlist items of the user' })
  @ApiResponse({ status: 200, description: 'Wishlist fetched successfully' })
  findAll(@Req() request: Request) {
    const userId = (request as any).user.id;
    return this.wishlistService.findAll(userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove a product from the wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', example: '66298f7e1c3fdf3e88b6e2f9' },
      },
      required: ['productId'],
    },
  })
  removeFromWishlist(@Req() request: Request, @Body() body: { productId: string }) {
    const userId = (request as any).user.id;
    return this.wishlistService.removeProductFromWishlist(userId, body.productId);
  }

  @Delete('/wishlist-delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete entire wishlist of the user' })
  @ApiResponse({ status: 200, description: 'Wishlist deleted successfully' })
  deleteWishlist(@Req() request: Request) {
    const userId = (request as any).user.id;
    return this.wishlistService.deleteWishlist(userId);
  }
}
