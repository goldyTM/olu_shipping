import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/supabaseClient';
import type { VendorShipment } from '@/types';

interface VendorEditModalProps {
  shipment: VendorShipment;
  onSave: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function VendorEditModal({ shipment, onSave, onClose, isLoading }: VendorEditModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    itemName: shipment.item_name,
    quantity: shipment.quantity,
    weight: shipment.weight,
    consigneeName: shipment.consignee_name,
    consigneeAddress: shipment.consignee_address,
    consigneeEmail: shipment.consignee_email,
    consigneePhone: shipment.consignee_phone,
    hsCode: shipment.hs_code || '',
    invoice_pdf_url: shipment.invoice_pdf_url || '',
    packing_list_pdf_url: shipment.packing_list_pdf_url || '',
  });
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [uploadingPackingList, setUploadingPackingList] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: shipment.id,
      ...formData
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadFile = async (file: File, type: 'invoice' | 'packing_list') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${shipment.vendor_decl_id}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `shipment-documents/${fileName}`;

      if (type === 'invoice') setUploadingInvoice(true);
      else setUploadingPackingList(true);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('shipment-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('shipment-files')
        .getPublicUrl(filePath);

      const field = type === 'invoice' ? 'invoice_pdf_url' : 'packing_list_pdf_url';
      setFormData(prev => ({ ...prev, [field]: publicUrl }));

      toast({
        title: 'Upload Successful',
        description: `${type === 'invoice' ? 'Invoice' : 'Packing list'} uploaded successfully.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      if (type === 'invoice') setUploadingInvoice(false);
      else setUploadingPackingList(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'packing_list') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload PDF or image files (PNG, JPG, JPEG) only.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    uploadFile(file, type);
  };

  return (
    <Dialog open={true} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Declaration</DialogTitle>
          <DialogDescription>
            Update declaration details for {shipment.vendor_decl_id}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Item Information</h3>
              
              <div>
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => handleChange('itemName', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hsCode">HS Code</Label>
                <Input
                  id="hsCode"
                  type="text"
                  value={formData.hsCode}
                  onChange={(e) => handleChange('hsCode', e.target.value)}
                  className="mt-1"
                />
              </div>

              <h3 className="text-lg font-medium text-gray-900 pt-4 border-t">Document Uploads</h3>
              
              <div>
                <Label htmlFor="invoice">Invoice (PDF/Image)</Label>
                <div className="mt-1">
                  <input
                    id="invoice"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileSelect(e, 'invoice')}
                    disabled={uploadingInvoice}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('invoice')?.click()}
                    disabled={uploadingInvoice}
                    className="w-full justify-start"
                  >
                    {uploadingInvoice ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.invoice_pdf_url ? 'Replace Invoice' : 'Upload Invoice'}
                      </>
                    )}
                  </Button>
                  {formData.invoice_pdf_url && (
                    <a 
                      href={formData.invoice_pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                    >
                      <FileText className="w-3 h-3 inline mr-1" />
                      View current invoice
                    </a>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="packingList">Packing List (PDF/Image)</Label>
                <div className="mt-1">
                  <input
                    id="packingList"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileSelect(e, 'packing_list')}
                    disabled={uploadingPackingList}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('packingList')?.click()}
                    disabled={uploadingPackingList}
                    className="w-full justify-start"
                  >
                    {uploadingPackingList ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.packing_list_pdf_url ? 'Replace Packing List' : 'Upload Packing List'}
                      </>
                    )}
                  </Button>
                  {formData.packing_list_pdf_url && (
                    <a 
                      href={formData.packing_list_pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                    >
                      <FileText className="w-3 h-3 inline mr-1" />
                      View current packing list
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Consignee Information</h3>
              
              <div>
                <Label htmlFor="consigneeName">Full Name *</Label>
                <Input
                  id="consigneeName"
                  type="text"
                  required
                  value={formData.consigneeName}
                  onChange={(e) => handleChange('consigneeName', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="consigneeEmail">Email Address *</Label>
                <Input
                  id="consigneeEmail"
                  type="email"
                  required
                  value={formData.consigneeEmail}
                  onChange={(e) => handleChange('consigneeEmail', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="consigneePhone">Phone Number *</Label>
                <Input
                  id="consigneePhone"
                  type="tel"
                  required
                  value={formData.consigneePhone}
                  onChange={(e) => handleChange('consigneePhone', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="consigneeAddress">Delivery Address *</Label>
                <Textarea
                  id="consigneeAddress"
                  required
                  value={formData.consigneeAddress}
                  onChange={(e) => handleChange('consigneeAddress', e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

