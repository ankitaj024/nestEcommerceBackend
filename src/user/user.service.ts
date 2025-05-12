import { HttpException, HttpStatus, Injectable, Patch } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { AddressDto } from './dto/address.dto';

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
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (existingUser) {
        throw new HttpException(
          'User already exists with this email',
          HttpStatus.CONFLICT,
        );
      }

      const userCreated = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          phoneNumber: 8095641523,
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
        Email_Send_To: email,
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

  // updatePassword in user module

  async updatePassword(
    userId: string,
    password: string,
    confirmPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException(
          `User with ID ${userId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new HttpException(
          'Current password is incorrect',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (confirmPassword != newPassword) {
        throw new HttpException(
          'your confirm password in not matched with new password',
          HttpStatus.BAD_REQUEST,
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error updating password:', error);
      throw new HttpException(
        'Failed to update password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //UPDATE USER SERVICE
  async updateUser(id: string, updateUserData: UpdateUserDto) {
    try {
      const findUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!findUser) {
        throw new HttpException('No User found', HttpStatus.NOT_FOUND);
      }

      if (updateUserData.address) {
        const user = await this.prisma.user.findUnique({
          where: {
            id: id,
          },
          select: {
            address: true,
          },
        });

        let existingAddresses = user?.address
          ? JSON.parse(user.address as string)
          : [];

        const newAddress = {
          firstName: updateUserData.address.firstName,
          lastName: updateUserData.address.lastName,
          country: updateUserData.address.country,
          city: updateUserData.address.city,
          zipCode: updateUserData.address.zipCode,
          phoneNumber: updateUserData.address.phoneNumber,
          streetAddress: updateUserData.address.streetAddress,
          state: updateUserData.address.state,
        };

        existingAddresses.push(newAddress);

        await this.prisma.user.update({
          where: {
            id: id,
          },
          data: {
            address: existingAddresses,
          },
        });
        return 'address updated';
      }

      const { address, ...restData } = updateUserData;

      const dataToUpdate: any = {
        ...restData,
      };

      if (address) {
        dataToUpdate.address = address as any;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
      });

      return {
        status: HttpStatus.OK,
        message: 'User Details Updated Successfully',
        updatedUserDetails: updatedUser,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserAddress(userId: string, addressDto: AddressDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { address: true },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    let updatedAddress = user.address ? JSON.parse(user.address as string) : {};

    updatedAddress = { ...updatedAddress, ...addressDto };

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        address: updatedAddress,
      },
    });

    return {
      status: HttpStatus.OK,
      message: 'Address updated successfully',
      updatedUser,
    };
  }

  //DELETE USER SERVICE
  async deleteUser(id: string) {
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
        deletedUser: findUser,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //SIGN IN WITH GOOGLE AND CREATE USER
  async googleLoginAndCreateUser(req) {
    try {
      const { email, firstName, picture, accessToken } = req.user;
      let userCreateData;
      const findUser = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (findUser) {
        userCreateData = await this.prisma.user.update({
          where: {
            email: email,
          },
          data: {
            name: firstName,
            profilePicture: picture,
          },
        });
      }
      if (!findUser) {
        const userCreateData = await this.prisma.user.create({
          data: {
            email: email,
            name: firstName,
            password: 'GOOGLE_AUTH',
            phoneNumber: 1234567890,
          },
        });
      }

      return {
        status: HttpStatus.CREATED,
        message: 'login successfull',
        access_token: accessToken,
        userData: userCreateData,
        userId: userCreateData.id,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
