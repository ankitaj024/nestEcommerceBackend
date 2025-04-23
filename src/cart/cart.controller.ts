import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //Get cart API
  @UseGuards(JwtAuthGuard)
  @Get()
  getCart(@Req() request:Request){
    const userId = request.user.id;
    return this.cartService.getCartData(userId)
  }


  //Add to cart API
  @UseGuards(JwtAuthGuard)
  @Post()
  addToCart(@Req() request: Request, @Body() createCartDto: CreateCartDto) {
    const userId = request.user.id;
    return this.cartService.addToCart(userId, createCartDto);
  }

  

  //Remove from cart API
  @UseGuards(JwtAuthGuard)
  @Delete()
  removeFromCart(@Req() request:Request, @Body() productId:string){
    const userId = request.user.id;
    return this.cartService.removeFromCart(userId, productId)
  }

  //Delete cart API
  @UseGuards(JwtAuthGuard)
  @Delete("/cart-delete")
  deleteCart(@Req() request:Request){
    const userId = request.user.id;
    return this.cartService.deleteCart(userId)
  }

}
