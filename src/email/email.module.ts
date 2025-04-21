import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';
import { EMAIL_TRANSPORTER } from './email.constant';
import hbs from 'nodemailer-express-handlebars';
import * as path from 'path';

@Module({
  providers: [
    {
      provide: EMAIL_TRANSPORTER,
      useFactory: () => {
        const transporter =  nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        //CONFIGURE HANDLE BARS FOR EMAIL TEMPLATE
        transporter.use(
          'compile',
          hbs({
            viewEngine:{
              partialsDir:path.resolve('./src/email/templates/'),
              defaultLayout: false,
            },
            viewPath: path.resolve('./src/email/templates/'),
            extName: '.hbs',
          })
        )
        return transporter;
      },
    },
    EmailService,
  ],
  exports: [EmailService, EMAIL_TRANSPORTER],
})
export class EmailModule {}
