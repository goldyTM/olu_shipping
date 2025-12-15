import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AdminShipmentInfo } from '@/types';

interface AdminEditModalProps {
  shipment: AdminShipmentInfo;
  onSave: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function AdminEditModal({ shipment, onSave, onClose, isLoading }: AdminEditModalProps) {
  const [formData, setFormData] = useState({
    item_name: shipment.item_name,
    quantity: shipment.quantity,
    weight: shipment.weight,
    consignee_name: shipment.consignee_name,
    consignee_address: shipment.consignee_address,
    consignee_email: shipment.consignee_email,
    consignee_phone: shipment.consignee_phone,
    hs_code: shipment.hs_code || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Shipment</DialogTitle>
          <DialogDescription>
            Update shipment details for {shipment.vendor_decl_id}
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
                  value={formData.item_name}
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
                  value={formData.hs_code}
                  onChange={(e) => handleChange('hsCode', e.target.value)}
                  className="mt-1"
                />
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
                  value={formData.consignee_name}
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
                  value={formData.consignee_email}
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
                  value={formData.consignee_phone}
                  onChange={(e) => handleChange('consigneePhone', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="consigneeAddress">Delivery Address *</Label>
                <Textarea
                  id="consigneeAddress"
                  required
                  value={formData.consignee_address}
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

