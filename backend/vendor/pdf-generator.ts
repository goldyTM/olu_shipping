import { Bucket } from 'encore.dev/storage/objects';

const pdfBucket = new Bucket("shipping-pdfs", { public: true });

export interface InvoiceData {
  vendorDeclId: string;
  itemName: string;
  quantity: number;
  weight: number;
  consigneeName: string;
  consigneeAddress: string;
  date: Date;
}

export interface PackingListData {
  vendorDeclId: string;
  itemName: string;
  quantity: number;
  weight: number;
  consigneeName: string;
  date: Date;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  // Simple HTML-like content for demonstration
  const content = `
    INVOICE
    
    Declaration ID: ${data.vendorDeclId}
    Date: ${data.date.toDateString()}
    
    CONSIGNEE INFORMATION:
    Name: ${data.consigneeName}
    Address: ${data.consigneeAddress}
    
    ITEM DETAILS:
    Item: ${data.itemName}
    Quantity: ${data.quantity}
    Weight: ${data.weight} kg
    
    Thank you for choosing Olu Shipping Company!
  `;

  const buffer = Buffer.from(content, 'utf-8');
  const fileName = `invoice-${data.vendorDeclId}.pdf`;
  
  await pdfBucket.upload(fileName, buffer, {
    contentType: 'application/pdf'
  });

  return pdfBucket.publicUrl(fileName);
}

export async function generatePackingListPDF(data: PackingListData): Promise<string> {
  const content = `
    PACKING LIST
    
    Declaration ID: ${data.vendorDeclId}
    Date: ${data.date.toDateString()}
    
    CONSIGNEE: ${data.consigneeName}
    
    CONTENTS:
    - Item: ${data.itemName}
    - Quantity: ${data.quantity} pieces
    - Total Weight: ${data.weight} kg
    
    Olu Shipping Company
    Professional Shipping Services
  `;

  const buffer = Buffer.from(content, 'utf-8');
  const fileName = `packing-list-${data.vendorDeclId}.pdf`;
  
  await pdfBucket.upload(fileName, buffer, {
    contentType: 'application/pdf'
  });

  return pdfBucket.publicUrl(fileName);
}
