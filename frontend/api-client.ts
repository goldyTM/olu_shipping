// Simple API client for Express backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Vendor API
export const vendor = {
  declare: (data: any) => request('/vendor/declare', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  list: (params?: { vendorId?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.vendorId) searchParams.append('vendorId', params.vendorId);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    const query = searchParams.toString();
    return request(`/vendor/shipments${query ? '?' + query : ''}`);
  },
  
  getShipment: (id: string) => request(`/vendor/get-shipment/${id}`),
  
  updateShipment: (id: string, data: any) => request(`/vendor/update-shipment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteShipment: (id: string) => request(`/vendor/delete-shipment/${id}`, {
    method: 'DELETE',
  }),
  
  checkStatus: (id: string) => request(`/vendor/check-status/${id}`),
};

// Admin API
export const admin = {
  search: (query?: string) => {
    const params = query ? `?query=${encodeURIComponent(query)}` : '';
    return request(`/admin/search${params}`);
  },
  
  updateShipment: (id: string, data: any) => request(`/admin/update-shipment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteShipment: (id: string) => request(`/admin/delete-shipment/${id}`, {
    method: 'DELETE',
  }),
};

// Tracking API
export const tracking = {
  track: (trackingNumber: string) => request(`/tracking/track/${trackingNumber}`),
  
  searchByQr: (qrCode: string) => request(`/tracking/search-by-qr/${qrCode}`),
  
  updateStatus: (id: string, status: string, location?: string) => 
    request(`/tracking/update-status/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, location }),
    }),
};

export default {
  vendor,
  admin,
  tracking,
};
