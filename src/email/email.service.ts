import { Inject, Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { EMAIL_TRANSPORTER } from './email.constant';
import { PdfService } from 'src/utils/pdf/pdf.service';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_TRANSPORTER) private readonly transporter: Transporter,
    private readonly pdfService: PdfService,
  ) {}

  async sendWelcomeEmail(email: string, name: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our Platform!',
      template: 'welcome',
      context: {
        name: name,
      },
      attachments: [
        {
          filename: 'logo.png',
          path: '/home/keymouseit/Desktop/ecommerce-nest/src/email/images/images.png',
          cid: 'logo',
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOtp(email: string, otp: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP Received',
      template: 'OTP',
      context: {
        otp: otp,
      },
      attachments: [
        {
          filename: 'logo.png',
          path: '/home/keymouseit/Desktop/ecommerce-nest/src/email/images/images.png',
          cid: 'logo',
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrderConfirmationEmail(
    name: string,
    email: string,
    orderId: string,
    items: any[],
    totalPrice: number,

  ) {
    try {
      const order = {
        id: orderId,
        items: items,
        customerName: name,
        totalPrice: totalPrice,
        customerEmail:email,
        shippingAddress: '1234 Street Name, City, State, ZIP',
        data: new Date().toLocaleString(),
      };

      const pdfPath = await this.pdfService.generatePdf(order);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Order Confirmation',
        template: 'order',
        context: {
          orderId: orderId,
          items: items,
          name: name,
          totalPrice: totalPrice,
        },
        attachments: [
          {
            filename: 'logo.png',
            path: '/home/keymouseit/Desktop/ecommerce-nest/src/email/images/images.png',
            cid: 'logo',
          },
          {
            filename: `invoice-${order.id}.pdf`,
            path: pdfPath,
          },
        ],
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent to:', email);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }
}
