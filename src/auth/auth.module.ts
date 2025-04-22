import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy.auth';
import { GoogleStrategy } from './strategy/google.strategy.';

@Module({
  imports:[JwtModule.register({
    secret:process.env.JWT_SECRET,
    signOptions:{expiresIn:'3h'}
  })],
  // controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports:[AuthService, JwtModule, GoogleStrategy]
})
export class AuthModule {}
