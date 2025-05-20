import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy.auth';
import { GoogleStrategy } from './strategy/google.strategy.';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
 import { PassportModule } from '@nestjs/passport';
 import { AuthController } from './auth.controller';
import { FacebookStrategy } from './strategy/facebook.strategy';


@Module({
  imports:[JwtModule.register({
    secret:process.env.JWT_SECRET,
    signOptions:{expiresIn:'24h'}
  }) , PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, JwtAuthGuard  , FacebookStrategy],
  exports:[AuthService, JwtModule, GoogleStrategy, JwtAuthGuard]
})
export class AuthModule {}
