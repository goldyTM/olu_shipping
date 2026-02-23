import { useState } from 'react';
import { PackagePlus, Upload, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/supabaseClient';

interface AdminManualDeclarationModalProps {
  onSuccess: () => void;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: any) => void;
  containerId?: number; // Optional container to assign the declaration to
}

export default function AdminManualDeclarationModal({ onSuccess, onClose, isLoading, onSubmit, containerId }: AdminManualDeclarationModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    vendor_decl_id: '',
    item_name: '',
    quantity: 1,
    weight: 0,
    consignee_name: '',
    consignee_address: '',
    consignee_email: '',
    consignee_phone: '',
    hs_code: '',
    invoice_pdf_url: '',
    packing_list_pdf_url: '',
  });
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [uploadingPackingList, setUploadingPackingList] = useState(false);
  const [generatingId, setGeneratingId] = useState(false);

  const generateVendorId = async () => {
    setGeneratingId(true);
    try {
      const year = new Date().getFullYear();
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        const newId = `VD-${year}-${random}`;
        
        // Check if this ID already exists in database
        const { data, error, count } = await supabase
          .from('vendor_shipments')
          .select('vendor_decl_id', { count: 'exact', head: false })
          .eq('vendor_decl_id', newId);
        
        if (error) {
          console.error('Error checking vendor ID:', error);
          toast({
            title: 'Query Error',
            description: error.message || 'Failed to check vendor ID. Please try again.',
            variant: 'destructive',
          });
          return;
        }
        
        if (!data || data.length === 0) {
          // ID is unique, use it
          setFormData(prev => ({ ...prev, vendor_decl_id: newId }));
          toast({
            title: 'ID Generated',
            description: `Vendor ID ${newId} is ready to use.`,
          });
          return;
        }
        
        attempts++;
      }
      
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate unique vendor ID after 10 attempts. Please try again.',
        variant: 'destructive',
      });
    } catch (error: any) {
      console.error('Error generating vendor ID:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingId(false);
    }
  };

  const uploadFile = async (file: File, type: 'invoice' | 'packing_list') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.vendor_decl_id || 'temp'}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `shipment-documents/${fileName}`;

      if (type === 'invoice') setUploadingInvoice(true);
      else setUploadingPackingList(true);

      const { data, error } = await supabase.storage
        .from('shipment-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

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

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload PDF or image files (PNG, JPG, JPEG) only.',
        variant: 'destructive',
      });
      return;
    }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendor_decl_id) {
      generateVendorId();
      toast({
        title: 'Vendor ID Required',
        description: 'Click the refresh button to generate a vendor declaration ID first.',
        variant: 'destructive',
      });
      return;
    }
    
    // Include container assignment if specified
    const submissionData = {
      ...formData,
      containerId: containerId // Will be assigned after creation if provided
    };
    
    onSubmit(submissionData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PackagePlus className="w-5 h-5 mr-2 text-blue-600" />
            Create Manual Vendor Declaration
            {containerId && (
              <Badge variant="secondary" className="ml-2">
                For Container #{containerId}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {containerId 
              ? `Creating a declaration that will be automatically assigned to Container #${containerId}`
              : 'For walk-in customers or phone orders - Create a shipment declaration without vendor login'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Vendor Declaration ID Section */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Vendor Declaration ID</h3>
            <div className="flex gap-2">
              <Input
                type="text"
                required
                value={formData.vendor_decl_id}
                onChange={(e) => handleChange('vendor_decl_id', e.target.value)}
                placeholder="VD-2025-XXXXX"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateVendorId}
                disabled={generatingId}
                title="Generate new vendor ID"
              >
                {generatingId ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-blue-600 mt-1">Click refresh to auto-generate a unique ID</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Item Information</h3>
              
              <div>
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  type="text"
                  required
                  value={formData.item_name}
                  onChange={(e) => handleChange('item_name', e.target.value)}
                  placeholder="e.g., Electronics, Clothing"
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
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hsCode">HS Code</Label>
                <Input
                  id="hsCode"
                  type="text"
                  value={formData.hs_code}
                  onChange={(e) => handleChange('hs_code', e.target.value)}
                  placeholder="Optional"
                  className="mt-1"
                />
              </div>

              {/* Document Uploads */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-700">Documents (Optional)</h3>
                
                <div>
                  <Label htmlFor="invoice" className="text-xs">Invoice</Label>
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
                      size="sm"
                      onClick={() => document.getElementById('invoice')?.click()}
                      disabled={uploadingInvoice}
                      className="w-full justify-start"
                    >
                      {uploadingInvoice ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3 mr-2" />
                          {formData.invoice_pdf_url ? 'Replace' : 'Upload'} Invoice
                        </>
                      )}
                    </Button>
                    {formData.invoice_pdf_url && (
                      <a href={formData.invoice_pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                        <FileText className="w-3 h-3 inline mr-1" />View
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="packingList" className="text-xs">Packing List</Label>
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
                      size="sm"
                      onClick={() => document.getElementById('packingList')?.click()}
                      disabled={uploadingPackingList}
                      className="w-full justify-start"
                    >
                      {uploadingPackingList ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3 mr-2" />
                          {formData.packing_list_pdf_url ? 'Replace' : 'Upload'} Packing List
                        </>
                      )}
                    </Button>
                    {formData.packing_list_pdf_url && (
                      <a href={formData.packing_list_pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                        <FileText className="w-3 h-3 inline mr-1" />View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Consignee Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Consignee Information</h3>
              
              <div>
                <Label htmlFor="consigneeName">Full Name *</Label>
                <Input
                  id="consigneeName"
                  type="text"
                  required
                  value={formData.consignee_name}
                  onChange={(e) => handleChange('consignee_name', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="consigneeEmail">Email Address *</Label>
                <Input
                  id="consigneeEmail"
                  type="email"
                  required
                  value={formData.consignee_email}
                  onChange={(e) => handleChange('consignee_email', e.target.value)}
                  placeholder="customer@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="consigneePhone">Phone Number *</Label>
                <Input
                  id="consigneePhone"
                  type="tel"
                  required
                  value={formData.consignee_phone}
                  onChange={(e) => handleChange('consignee_phone', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="consigneeAddress">Delivery Address *</Label>
                <Textarea
                  id="consigneeAddress"
                  required
                  value={formData.consignee_address}
                  onChange={(e) => handleChange('consignee_address', e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex items-center space-x-2">
              <PackagePlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating...' : 'Create Declaration'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
