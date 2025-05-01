import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EmailModule } from 'src/email/email.module';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports:[EmailModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
