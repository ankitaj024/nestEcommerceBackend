
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaypalService {
  private clientId = process.env.PAYPAL_CLIENT_ID;
  private clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  private api = process.env.PAYPAL_API;

  private async getAccessToken(): Promise<string> {
    const res = await axios.post(`${this.api}/v1/oauth2/token`, 'grant_type=client_credentials', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: { username: this.clientId, password: this.clientSecret },
    });
    return res.data.access_token;
  }

  async createOrder(amount: number): Promise<any> {
    const token = await this.getAccessToken();
    const res = await axios.post(
      `${this.api}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'USD', value: amount.toString() } }],
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  }
}
