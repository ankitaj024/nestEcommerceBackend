import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // LOGIN SERVICE
  async userLogin(createAuthDto: CreateAuthDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: createAuthDto.email,
        },
      });
      if (!user) {
        throw new HttpException('No user Found', HttpStatus.NOT_FOUND);
      }
      const isMatch = await bcrypt.compare(
        createAuthDto.password,
        user.password,
      );
      if (!isMatch) {
        throw new HttpException(
          'Incorrect Password',
          HttpStatus.NON_AUTHORITATIVE_INFORMATION,
        );
      }
      const access_token = this.jwtService.sign({
        id: user.id,
        name: user.name,
        email: user.email,
      });
      return {
        status: HttpStatus.ACCEPTED,
        access_token: access_token,
        userDetail: user,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
