import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { VendorShipment } from '@/types';

interface VendorEditModalProps {
  shipment: VendorShipment;
  onSave: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function VendorEditModal({ shipment, onSave, onClose, isLoading }: VendorEditModalProps) {
  const [formData, setFormData] = useState({
    itemName: shipment.item_name,
    quantity: shipment.quantity,
    weight: shipment.weight,
    consigneeName: shipment.consignee_name,
    consigneeAddress: shipment.consignee_address,
    consigneeEmail: shipment.consignee_email,
    consigneePhone: shipment.consignee_phone,
    hsCode: shipment.hs_code || '',
  });

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

