import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDto {
     @IsString()
      @IsNotEmpty()
      address: string;

      @IsNotEmpty()
      token:string
}
