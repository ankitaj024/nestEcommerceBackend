import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy.auth';

@Module({
  imports:[JwtModule.register({
    secret:process.env.JWT_SECRET,
    signOptions:{expiresIn:'3h'}
  })],
  // controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports:[AuthService, JwtModule]
})
export class AuthModule {}
