import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { CreateAuthDto } from './dto/create-auth-dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService:AuthService) {}
  
  // USER CREATE API
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  //LOGIN API
  @Post("/login")
  userLogin(@Body() createAuthDto:CreateAuthDto) {
    return this.authService.userLogin(createAuthDto);
  }

  
}
