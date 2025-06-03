import { HttpException, HttpStatus, Injectable, Patch } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { AddressDto } from './dto/address.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
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
// user login with google 

  async userLoginWithGoogle(CreateUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: CreateUserDto.email,
        },
      });
      if (user) {
        const access_token = this.jwtService.sign({
          id: user.id,
          name: user.name,
          email: user.email,
        });
     return access_token ;
      }
       const  Newpassword = "Google123"
      const hashedPassword = await bcrypt.hash(Newpassword, 10);
  const userCreated = await this.prisma.user.create({
    data: {
      ...CreateUserDto,
      password: hashedPassword,
      phoneNumber: 8095641523,
    },
  });
  console.log(userCreated)

      const access_token = this.jwtService.sign({
        id: userCreated.id,
        name: userCreated.name,
        email: userCreated.email,
      });
      return {
        status: HttpStatus.ACCEPTED,
        access_token: access_token,
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
      if (!id) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }

      if (!findUser) {
        throw new HttpException('No User found', HttpStatus.NOT_FOUND);
      }

      let existingAddresses = Array.isArray(findUser.address)
        ? findUser.address
        : [];
      const { address, ...restData } = updateUserData;

      // Normalize address input: make sure it's always an array
      const incomingAddresses = address
        ? Array.isArray(address)
          ? address
          : [address]
        : [];

      const toUpdate: any[] = [];
      const toAdd: any[] = [];

      for (const addr of incomingAddresses) {
        if (addr.addId) {
          toUpdate.push(addr);
        } else {
          toAdd.push({
            addId: Date.now().toString(),
            ...addr,
          });
        }
      }

      // Handle updating existing addresses
      if (toUpdate.length > 0) {
        for (const updated of toUpdate) {
          const index = existingAddresses.findIndex(
            (addr: any) => addr.addId === updated.addId,
          );

          if (index !== -1) {
            if (
              existingAddresses[index] &&
              typeof existingAddresses[index] === 'object'
            ) {
              existingAddresses[index] = {
                ...existingAddresses[index],
                ...updated,
              };
            } else {
              console.error(
                `Address with addId ${updated.addId} is not a valid object.`,
              );
            }
          }
        }
      }

      if (toAdd.length > 0) {
        existingAddresses = [...existingAddresses, ...toAdd];
      }

      if (incomingAddresses.length > 0) {
        await this.prisma.user.update({
          where: { id },
          data: {
            address: existingAddresses,
          },
        });

        return {
          status: HttpStatus.OK,
          message: `${toAdd.length > 0 ? 'New address added' : ''}${toUpdate.length > 0 ? ' Address updated' : ''} successfully.`,
          address: existingAddresses,
        };
      }

      // If no address was updated or added, just update the rest of the user fields
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { ...restData },
      });

      return {
        status: HttpStatus.OK,
        message: 'User details updated successfully.',
        updatedUserDetails: updatedUser,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Something went wrong',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      const access_token = this.jwtService.sign({
        id: userCreateData.id,
        name: userCreateData.name,
        email: userCreateData.email,
      });

      return {
        status: HttpStatus.CREATED,
        message: 'login successfull',
        access_token: access_token,
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
