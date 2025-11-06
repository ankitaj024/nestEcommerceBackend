
import { Controller , Get, Req, UseGuards } from "@nestjs/common";
 import { AuthGuard } from "@nestjs/passport";
 @Controller ('auth')
 export class AuthController {
    // @Get('facebook')
    // @UseGuards(AuthGuard('facebook'))
    // async facebookLogin(): Promise<any> {
    //   // Redirects to Facebook
    // }
  
    // @Get('facebook/callback')
    // @UseGuards(AuthGuard('facebook'))
    // async facebookLoginRedirect(@Req() req): Promise<any> {
    //   return {
    //     message: 'Facebook login successful',
    //     user: req.user,
    //   };
    // }
  }