import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy.auth';
import { GoogleStrategy } from './strategy/google.strategy.';
import { JwtAuthGuard } from './guards/jwt.auth.guard';

@Module({
  imports:[JwtModule.register({
    secret:process.env.JWT_SECRET,
    signOptions:{expiresIn:'3h'}
  })],
  // controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, JwtAuthGuard],
  exports:[AuthService, JwtModule, GoogleStrategy, JwtAuthGuard]
})
export class AuthModule {}
