export function generateVendorDeclId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `VD-${year}-${random}`;
}

export function generateTrackingId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRK-${year}-${random}`;
}

export function generateVendorId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `VID-${year}-${random}`;
}
