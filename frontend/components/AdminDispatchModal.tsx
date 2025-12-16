import { useState } from 'react';
import { Truck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminShipmentInfo } from '@/types';

interface AdminDispatchModalProps {
  shipment: AdminShipmentInfo;
  onDispatch: (data: { vendor_decl_id: string; customer_email: string }) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function AdminDispatchModal({ shipment, onDispatch, onClose, isLoading }: AdminDispatchModalProps) {
  const [customerEmail, setCustomerEmail] = useState(shipment.consignee_email || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatch({
      vendor_decl_id: shipment.vendor_decl_id,
      customer_email: customerEmail
    });
  };

  return (
    <Dialog open={true} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2 text-blue-600" />
            Dispatch Shipment
          </DialogTitle>
          <DialogDescription>
            Create a tracking ID and dispatch {shipment.vendor_decl_id} to the customer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Shipment Details</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>Item:</strong> {shipment.item_name}</p>
                <p><strong>Vendor Declaration ID:</strong> <span className="font-mono">{shipment.vendor_decl_id}</span></p>
                <p><strong>Quantity:</strong> {shipment.quantity} | <strong>Weight:</strong> {shipment.weight} kg</p>
              </div>
            </div>

            <div>
              <Label htmlFor="customerEmail" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Customer Email *
              </Label>
              <Input
                id="customerEmail"
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                A tracking ID (TRK-XXXX-XXXXX) will be automatically generated and sent to this email
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✓ After dispatch, the customer will receive their tracking ID via email to monitor delivery status
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !customerEmail.trim()}
              className="flex items-center space-x-2"
            >
              <Truck className="w-4 h-4" />
              <span>{isLoading ? 'Dispatching...' : 'Dispatch Shipment'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
