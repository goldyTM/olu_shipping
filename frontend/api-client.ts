// Direct Supabase API client (no Express backend needed)
import supabase from './supabaseClient';

// Helper to generate unique vendor declaration ID
async function generateUniqueVendorDeclId() {
  const year = new Date().getFullYear();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const vendorDeclId = `VD-${year}-${random}`;
    
    const { data } = await supabase
      .from('vendor_shipments')
      .select('vendor_decl_id')
      .eq('vendor_decl_id', vendorDeclId)
      .single();
    
    if (!data) return vendorDeclId;
    attempts++;
  }
  
  throw new Error('Unable to generate unique vendor declaration ID');
}

// Helper to generate unique tracking ID
async function generateUniqueTrackingId() {
  const year = new Date().getFullYear();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const trackingId = `TRK-${year}-${random}`;
    
    const { data } = await supabase
      .from('receiver_shipments')
      .select('tracking_id')
      .eq('tracking_id', trackingId)
      .single();
    
    if (!data) return trackingId;
    attempts++;
  }
  
  throw new Error('Unable to generate unique tracking ID');
}

// Vendor API
export const vendor = {
  declare: async (data: any) => {
    // Use getSession instead of getUser to avoid network request
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    // Handle both camelCase (regular form) and snake_case (manual declaration modal)
    const vendorDeclId = data.vendor_decl_id || await generateUniqueVendorDeclId();
    
    const { data: shipment, error } = await supabase
      .from('vendor_shipments')
      .insert({
        vendor_decl_id: vendorDeclId,
        item_name: data.item_name || data.itemName,
        quantity: parseInt(data.quantity) || 1,
        weight: parseFloat(data.weight) || 0,
        consignee_name: data.consignee_name || data.consigneeName,
        consignee_address: data.consignee_address || data.consigneeAddress,
        consignee_email: data.consignee_email || data.consigneeEmail,
        consignee_phone: data.consignee_phone || data.consigneePhone,
        hs_code: data.hs_code || data.hsCode || null,
        invoice_pdf_url: data.invoice_pdf_url || null,
        packing_list_pdf_url: data.packing_list_pdf_url || null,
        user_id: user?.id || null, // null for manual admin declarations
      })
      .select()
      .single();
    
    if (error) throw error;
    return shipment;
  },
  
  list: async (params?: { userId?: string; limit?: number; offset?: number }) => {
    let query = supabase
      .from('vendor_shipments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (params?.userId) {
      query = query.or(`user_id.eq.${params.userId},user_id.is.null`);
    }
    if (params?.limit) query = query.limit(params.limit);
    if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  getShipment: async (id: string) => {
    const { data, error } = await supabase
      .from('vendor_shipments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateShipment: async (id: string, updateData: any) => {
    const { data, error } = await supabase
      .from('vendor_shipments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteShipment: async (id: string) => {
    const { error } = await supabase
      .from('vendor_shipments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },
  
  checkStatus: async (id: string) => {
    const { data, error } = await supabase
      .from('receiver_shipments')
      .select('tracking_id, status')
      .eq('vendor_decl_id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Admin API
export const admin = {
  search: async (query?: string) => {
    console.log('Admin search query:', query);
    
    let supabaseQuery = supabase
      .from('vendor_shipments')
      .select(`
        *,
        receiver_shipments!receiver_shipments_vendor_decl_id_fkey (
          tracking_id,
          status,
          dispatch_date
        )
      `)
      .order('created_at', { ascending: false });
    
    if (query) {
      // Search in vendor_decl_id, item_name, consignee_name
      supabaseQuery = supabaseQuery.or(
        `vendor_decl_id.ilike.%${query}%,item_name.ilike.%${query}%,consignee_name.ilike.%${query}%`
      );
    }
    
    const { data, error } = await supabaseQuery;
    if (error) {
      console.error('Admin search error:', error);
      throw error;
    }
    
    // Transform data to include tracking_id at top level
    const transformedData = data?.map((shipment: any) => ({
      ...shipment,
      tracking_id: shipment.receiver_shipments?.[0]?.tracking_id || null,
      receiver_status: shipment.receiver_shipments?.[0]?.status || null,
      dispatch_date: shipment.receiver_shipments?.[0]?.dispatch_date || null,
    })) || [];
    
    // If query looks like a tracking ID (TRK-), also search receiver_shipments
    if (query?.startsWith('TRK-')) {
      const { data: receiverData } = await supabase
        .from('receiver_shipments')
        .select(`
          *,
          vendor_shipments!receiver_shipments_vendor_decl_id_fkey (
            *
          )
        `)
        .eq('tracking_id', query);
      
      if (receiverData && receiverData.length > 0) {
        // Add matching receiver shipments to results
        const receiverResults = receiverData.map((rs: any) => ({
          ...rs.vendor_shipments,
          tracking_id: rs.tracking_id,
          receiver_status: rs.status,
          dispatch_date: rs.dispatch_date,
        }));
        
        // Merge and deduplicate
        const allResults = [...transformedData];
        receiverResults.forEach((rs: any) => {
          if (!allResults.find((r: any) => r.vendor_decl_id === rs.vendor_decl_id)) {
            allResults.push(rs);
          }
        });
        return allResults;
      }
    }
    
    return transformedData;
  },
  
  updateShipment: async (id: string, updateData: any) => {
    const { data, error } = await supabase
      .from('vendor_shipments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteShipment: async (id: string) => {
    const { error } = await supabase
      .from('vendor_shipments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },
  
  dispatch: async (data: { vendor_decl_id: string; customer_email: string }) => {
    const trackingId = await generateUniqueTrackingId();
    
    const { data: shipment, error } = await supabase
      .from('receiver_shipments')
      .insert({
        tracking_id: trackingId,
        vendor_decl_id: data.vendor_decl_id,
        customer_email: data.customer_email,
        status: 'dispatched',
        dispatch_date: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return { ...shipment, tracking_id: trackingId };
  },
  
  updateStatus: async (data: { tracking_id: string; status: string; location?: string; notes?: string }) => {
    // Update receiver shipment status
    const { error: updateError } = await supabase
      .from('receiver_shipments')
      .update({ status: data.status })
      .eq('tracking_id', data.tracking_id);
    
    if (updateError) throw updateError;
    
    // Add shipment update
    const { data: update, error: insertError } = await supabase
      .from('shipment_updates')
      .insert({
        tracking_id: data.tracking_id,
        status: data.status,
        location: data.location,
        notes: data.notes,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    return update;
  },
};

// Tracking API
export const tracking = {
  track: async (trackingNumber: string) => {
    console.log('Tracking lookup for:', trackingNumber);
    
    // First get the receiver shipment
    let baseQuery = supabase
      .from('receiver_shipments')
      .select('*');
    
    if (trackingNumber.startsWith('TRK-')) {
      baseQuery = baseQuery.eq('tracking_id', trackingNumber);
    } else if (trackingNumber.startsWith('VD-')) {
      baseQuery = baseQuery.eq('vendor_decl_id', trackingNumber);
    } else {
      baseQuery = baseQuery.eq('tracking_id', trackingNumber);
    }
    
    const { data: receiverShipment, error: receiverError } = await baseQuery.single();
    
    if (receiverError || !receiverShipment) {
      console.error('Receiver shipment not found:', receiverError);
      throw new Error('Shipment not found or not yet dispatched');
    }
    
    // Get vendor shipment details
    const { data: vendorShipment, error: vendorError } = await supabase
      .from('vendor_shipments')
      .select('*')
      .eq('vendor_decl_id', receiverShipment.vendor_decl_id)
      .single();
    
    if (vendorError) {
      console.error('Vendor shipment error:', vendorError);
    }
    
    // Get shipment updates
    const { data: updates, error: updatesError } = await supabase
      .from('shipment_updates')
      .select('*')
      .eq('tracking_id', receiverShipment.tracking_id)
      .order('timestamp', { ascending: true });
    
    if (updatesError) {
      console.error('Updates error:', updatesError);
    }
    
    const vendorDetails = vendorShipment || {};
    const shipmentUpdates = updates || [];
    
    shipmentUpdates.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return {
      trackingId: receiverShipment.tracking_id,
      vendorDeclId: receiverShipment.vendor_decl_id,
      itemName: vendorDetails.item_name,
      quantity: vendorDetails.quantity,
      weight: vendorDetails.weight,
      consigneeName: vendorDetails.consignee_name,
      consigneeAddress: vendorDetails.consignee_address,
      consigneeEmail: vendorDetails.consignee_email,
      consigneePhone: vendorDetails.consignee_phone,
      invoice_pdf_url: vendorDetails.invoice_pdf_url,
      packing_list_pdf_url: vendorDetails.packing_list_pdf_url,
      status: receiverShipment.status || 'pending',
      location: shipmentUpdates[0]?.location || null,
      dispatchDate: receiverShipment.created_at,
      updates: shipmentUpdates
    };
  },
  
  searchByQr: async (qrCode: string) => {
    return tracking.track(qrCode);
  },
};

export default {
  vendor,
  admin,
  tracking,
};
