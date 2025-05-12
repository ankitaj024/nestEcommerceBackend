import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from './address.dto'; // Import AddressDto

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z\s]{2,30}$/)
  name?: string;

  @ApiPropertyOptional({ example: 'jane.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NewPass123' })
  @IsOptional()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/)
  password?: string;

  @ApiPropertyOptional({ example: 9876543210 })
  @IsOptional()
  phoneNumber?: number;

  @ApiPropertyOptional({
    description: 'Array of address objects',
    type: [AddressDto],
  })
  @IsOptional()
  address:{
    firstName:string,
    lastName:string,
    phoneNumber:number,
    streetAddress:string,
    city:string,
    state:string,
    zipCode:string,
    country:string
  };

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  status?: boolean;

  @IsOptional()
  profilePicture?: string;
}
