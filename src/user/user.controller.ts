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

  //FORGET PASSWORD API
  @Post("/forget-password")
  forgetPassword(@Body('email') email:string){
    return this.userService.forgetPassword(email)
  }

  //VERIFY OTP API
  @Post("/verify-otp")
  verifyOTP(@Body() body: { email: string; OTP: number }) {
    const { email, OTP } = body;
    return this.userService.verifyOTP(email, OTP);
  }

  //CHANGE PASSWORD
  @Post('/change-password')
  changePassword(@Body() body:{email:string,password:string, confirmPassword:string}){
    const {email, password, confirmPassword} = body;
    return this.userService.changePassword(email, password, confirmPassword)
  }

  // GET ALL USERS
  @Get()
  getAllUsers(){
    return this.userService.getAllUsers();
  }

  //UPDATE USER API
  @Patch(":id")
  updateUserData(@Param("id") id:string, @Body() updateUserDto: UpdateUserDto){
    return this.userService.updateUser(id, updateUserDto)
  }

  //DELETE USER API
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
