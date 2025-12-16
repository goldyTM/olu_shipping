import { Bucket } from 'encore.dev/storage/objects';

const qrBucket = new Bucket("shipping-qr-codes", { public: true });

export async function generateQRCode(vendorDeclId: string): Promise<string> {
  // For demonstration, we'll create a simple text-based QR representation
  // In a real implementation, you'd use a proper QR code library
  const qrContent = `OLU-SHIPPING:${vendorDeclId}`;
  const qrData = `
    ████████████████████████████
    ██                        ██
    ██  QR CODE FOR TRACKING  ██
    ██  ${vendorDeclId}        ██
    ██                        ██
    ████████████████████████████
  `;

  const buffer = Buffer.from(qrData, 'utf-8');
  const fileName = `qr-${vendorDeclId}.png`;
  
  await qrBucket.upload(fileName, buffer, {
    contentType: 'image/png'
  });

  return qrBucket.publicUrl(fileName);
}
