import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
  async generatePdf(order: any): Promise<string> {
    const filename = `invoice_${order.id}.pdf`;
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'invoices',
      filename,
    );
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    const logoPath = path.join(__dirname, 'images.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 120 });
    }


    doc
      .fontSize(20)
      .text('Keymouse It Pvt. Ltd.', 200, 50, { align: 'right' })
      .fontSize(10)
      .text('1234 Street Name', { align: 'right' })
      .text('City, State, ZIP', { align: 'right' })
      .text('GSTIN: 22AAAAA0000A1Z5', { align: 'right' })
      .moveDown();

    
    doc.fontSize(18).text('INVOICE', 50, 160).moveDown();

    
    doc
      .fontSize(12)
      .text(`Invoice #: ${order.id}`)
      .text(`Date: ${order.data}`)
      .text(`Customer Name: ${order.customerName}`)
      .text(`Email: ${order.customerEmail}`)
      .text(`Shipping Address: ${order.shippingAddress}`)
      .moveDown();

    
    const tableTop = doc.y;
    doc.fontSize(12);
    this.drawTableRow(doc, tableTop, 'No.', 'Product', 'Qty', 'Price', 'Total');
    this.drawLine(doc, tableTop + 20);

    
    let position = tableTop + 30;
    let subtotal = 0;
    order.items.forEach((item: any, index: number) => {
      const total = item.price * item.quantity;
      subtotal += total;
      this.drawTableRow(
        doc,
        position,
        index + 1,
        item.productName,
        item.quantity,
        `Rs: ${item.price.toFixed(2)}`,
        `Rs: ${total.toFixed(2)}`,
      );
      position += 20;
    });

    
    const tax = subtotal * 0.18;
    const shipping = order.shippingCharge || 50;
    const grandTotal = subtotal + tax + shipping;

    doc.moveDown(3);
    doc.fontSize(10);
    doc.text(`Subtotal: Rs: ${subtotal.toFixed(2)}`, { align: 'right' }, );
    doc.text(`Tax (18% GST): Rs: ${tax.toFixed(2)}`, { align: 'right' }, );
    doc.text(`Shipping: Rs:${shipping.toFixed(2)}`, { align: 'right' }, );
    doc.fontSize(12).text(`Grand Total: Rs: ${grandTotal.toFixed(2)}`, {
      align: 'right',
    }, );

    
    doc.moveDown(4);
    doc.fontSize(10);

    const centerText = (text: string) => {
      const textWidth = doc.widthOfString(text);
      const pageWidth = doc.page.width;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, doc.y);
    };

    centerText('Thank you for your order!');
    centerText('For support, contact us at support@example.com');
    centerText('Invoice generated automatically. No signature required.');

    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', reject);
    });
  }

  private drawTableRow(
    doc: PDFDocument,
    y: number,
    no: any,
    item: string,
    qty: number | string,
    price: string,
    total: string,
  ) {
    doc
      .fontSize(10)
      .text(no.toString(), 50, y)
      .text(item, 90, y)
      .text(qty.toString(), 280, y)
      .text(price, 340, y)
      .text(total, 430, y);
  }

  private drawLine(doc: PDFDocument, y: number) {
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }
}
