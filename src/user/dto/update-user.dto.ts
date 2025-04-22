import {
    IsEmail,
    IsOptional,
    IsString,
    Matches,
  } from 'class-validator';
  
  export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-Z\s]{2,30}$/, {
      message:
        'Name must be 2-30 characters long and only contain letters and spaces',
    })
    name: string;
  
    @IsOptional()
    @IsEmail({}, { message: 'Email must be valid' })
    email: string;
  
    @IsOptional()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
      message:
        'Password must be at least 6 characters, including at least one letter and one number',
    })
    password: string;
  
    @IsOptional()
    @Matches(/^\d{10}$/, {
      message: 'Phone number must be exactly 10 digits',
    })
    phoneNumber: string;
  
    @IsOptional()
    @IsString()
    address: string;
  
  
    @IsOptional()
    status:Boolean
  }
  