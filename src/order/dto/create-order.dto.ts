import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
     @IsString()
      @IsNotEmpty()
      address: string;
}
