import { Inject, Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { EMAIL_TRANSPORTER } from './email.constant';
import { template } from 'handlebars';


@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_TRANSPORTER) private readonly transporter: Transporter,
  ) {}

  async sendWelcomeEmail(email: string, name:string) {
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our Platform!',
      template:'welcome',
     context:{
        name:name
     },
     attachments: [
        {
          filename: 'logo.png',
          path: "/home/keymouseit/Desktop/ecommerce-nest/src/email/images/images.png",
          cid: 'logo'
        }
      ]
    };
  

    await this.transporter.sendMail(mailOptions);
  }
}
