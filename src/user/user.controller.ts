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
  // Request,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  Put,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { CreateAuthDto } from './dto/create-auth-dto';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { AddressDto } from './dto/address.dto';

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  //New user create API
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiBody({ type: CreateUserDto })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  // uploads file API
  @Post('/upload')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 10 }], {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|pdf|docx|txt)$/i;
        if (!file.originalname.match(allowed)) {
          return cb(new BadRequestException('Unsupported file type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFiles(
    @UploadedFiles()
    files: { files?: Express.Multer.File[] },
    @Req() req: Request,
  ) {
    const uploaded = files.files || [];

    if (!uploaded.length) {
      throw new BadRequestException('No files uploaded');
    }

    const urls = uploaded.map((file) => {
      const host = `${req.protocol}://${req.get('host')}`;
      return `${host}/uploads/${file.filename}`;
    });

    return {
      message: 'Files uploaded successfully',
      files: urls,
    };
  }
  //Login API
  @Post('/login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiBody({ type: CreateAuthDto })
  userLogin(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.userLogin(createAuthDto);
  }

  //Forget-Password API
  @Post('/forget-password')
  @ApiOperation({ summary: 'Send OTP to user email for password reset' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  forgetPassword(@Body('email') email: string) {
    return this.userService.forgetPassword(email);
  }

  //Verify-otp API
  @Post('/verify-otp')
  @ApiOperation({ summary: 'Verify OTP for password reset' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        OTP: { type: 'number', example: 123456 },
      },
    },
  })
  verifyOTP(@Body() body: { email: string; OTP: number }) {
    const { email, OTP } = body;
    return this.userService.verifyOTP(email, OTP);
  }

  //Change Password API
  @Post('/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'NewPass123' },
        confirmPassword: { type: 'string', example: 'NewPass123' },
      },
    },
  })
  changePassword(
    @Body() body: { email: string; password: string; confirmPassword: string },
  ) {
    const { email, password, confirmPassword } = body;
    return this.userService.changePassword(email, password, confirmPassword);
  }

  @Post('/update-password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', example: 'OldPass123' },
        newPassword: { type: 'string', example: 'NewPass123' },
        confirmPassword: { type: 'string', example: 'NewPass123' },
      },
      required: ['password', 'newPassword', 'confirmPassword'],
    },
  })
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @Req() request: Request,
    @Body()
    body: { password: string; confirmPassword: string; newPassword: string },
  ) {
    const userId = String((request as any).user.id);
    const { password, newPassword, confirmPassword } = body;
    return this.userService.updatePassword(
      userId,
      password,
      confirmPassword,
      newPassword,
    );
  }
  // Get All user API
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  //Update User API
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  updateUserData(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  // Delete User API
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  remove(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  //Sign-in with google API
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth Login' })
  googleAuth() {
    // redirect to Google
  }

  //Callback to google API
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth Callback' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    const response = await this.userService.googleLoginAndCreateUser(req);

    const access_token = response.access_token;
    console.log(access_token);
    return res.redirect(`http://192.168.1.61:3000/${access_token}`);
  }



  // login with google 
  @Post('/login-with-google')
  @ApiOperation({ summary: 'User login with  google ' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiBody({ type: CreateUserDto })
  userLoginWithGoogle(@Body() CreateUserDto: CreateUserDto) {
    return this.userService.userLoginWithGoogle(CreateUserDto);
  }

  // // for facebook handling authentication
  // @Get('facebook')
  // @UseGuards(AuthGuard('facebook'))
  // async facebookLogin() {
  //   // Facebook redirects the user here
  // }

  // @Get('facebook/redirect')
  // @UseGuards(AuthGuard('facebook'))
  // async facebookRedirect(@Req() req) {
  //   // Facebook sends back the user info here
  //   return req.user; // You can generate a JWT or handle login here
  // }
}
