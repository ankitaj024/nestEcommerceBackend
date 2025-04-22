import { HttpException, HttpStatus, Injectable, Patch } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}
  //CREATE USER SERVICE
  async createUser(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const userCreated = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });

      //EMAIL SENDING
      this.emailService.sendWelcomeEmail(
        createUserDto.email,
        createUserDto.name,
      );

      return {
        status: HttpStatus.CREATED,
        message: 'User Created Successfully',
        userDetails: userCreated,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //FORGET-PASSWORD SERVICE
  async forgetPassword(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) {
        throw new HttpException('No such user found', HttpStatus.NOT_FOUND);
      }
      const Otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          Otp: parseInt(Otp),
        },
      });
      this.emailService.sendOtp(email, Otp);
      return {
        status: HttpStatus.OK,
        message: 'OTP send Successfully , Check your mail',
        mailedEmail: email,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || error.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //VERIFY-OTP SERVICE
  async verifyOTP(email: string, OTP: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new HttpException('Incorrect OTP', HttpStatus.NOT_ACCEPTABLE);
      }
      if (user.Otp != OTP) {
        throw new HttpException('Incorrect OTP', HttpStatus.NOT_FOUND);
      }
      await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          Otp: null,
        },
      });
      return {
        status: HttpStatus.ACCEPTED,
        message: 'OTP verification successful',
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || error.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //CHANGE PASSWORD
  async changePassword(
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    try {
      if (password !== confirmPassword) {
        throw new HttpException(
          'Password and confirmPassword Not matched',
          HttpStatus.CONFLICT,
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          password: hashedPassword,
        },
      });
      return {
        status: HttpStatus.OK,
        message: 'Password Change successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || error.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //GET ALL USERS
  async getAllUsers() {
    try {
      const getAllUsersData = await this.prisma.user.findMany();
      return {
        status: HttpStatus.OK,
        message: 'Users fetched successfully',
        userData: getAllUsersData,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || error.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //UPDATE USER SERVICE
  async updateUser(id: string, updateUserData: UpdateUserDto) {
    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!findUser) {
        throw new HttpException('No User found ', HttpStatus.NOT_FOUND);
      }
      const updatedUser = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: updateUserData,
      });

      return {
        status: HttpStatus.OK,
        message: 'User Details Updated Successfully',
        updatedUserDetails: updatedUser,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || error.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //DELETE USER SERVICE
  async deleteUser(id:string){
    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!findUser) {
        throw new HttpException('No User found ', HttpStatus.NOT_FOUND);
      }
      await this.prisma.user.delete({
        where: { id },
      });
      return {
        status: HttpStatus.ACCEPTED,
        message: 'User Successfully deleted',
        deletedUser : findUser
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
