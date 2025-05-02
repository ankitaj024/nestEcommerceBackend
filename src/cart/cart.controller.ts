import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth("access-token")
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Get cart API
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get current user cart' })

  getCart(@Req() request:Request){
    const userId = ( request as any ).user.id;
    return this.cartService.getCartData(userId)
  }


  // Add to cart API
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiBody({ type: CreateCartDto })
  addToCart(@Req() request: Request, @Body() createCartDto: CreateCartDto) {
    const userId = (request as any).user.id;
    
    return this.cartService.addToCart(userId, createCartDto);
  }

  // Remove from cart API
  @UseGuards(JwtAuthGuard)
  @Delete('/quantity')
  @ApiOperation({ summary: 'Remove a product from cart' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        example: '66087289d53acdb9de601c99'
      }
    }
  }})
  @Delete('/quantity')
  removeFromCart(@Req() request: Request, @Body() body: { productId: string }) {
    const userId = (request as any).user.id;
    return this.cartService.removeProductQuantityFromCart(userId, body.productId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/remove')
  @ApiOperation({ summary: 'Remove a product from cart' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        example: '66087289d53acdb9de601c99'
      }
    }
  }})
  removeProductFromCart(@Req() request: Request, @Body() body: { productId: string }) {
    const userId = (request as any).user.id;
    return this.cartService.removeProductFromCart(userId, body.productId);
  }


  // Delete entire cart API
  @UseGuards(JwtAuthGuard)
  @Delete('/cart-delete')
  @ApiOperation({ summary: 'Delete the entire cart for the user' })
  deleteCart(@Req() request: Request) {
    const userId = (request as any).user.id;
    return this.cartService.deleteCart(userId);
  }
}
