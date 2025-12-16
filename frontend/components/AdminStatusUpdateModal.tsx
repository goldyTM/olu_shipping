import { useState } from 'react';
import { MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AdminStatusUpdateModalProps {
  tracking_id: string;
  vendor_decl_id: string;
  onUpdate: (data: { tracking_id: string; status: string; location?: string; notes?: string }) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function AdminStatusUpdateModal({ 
  tracking_id, 
  vendor_decl_id,
  onUpdate, 
  onClose, 
  isLoading 
}: AdminStatusUpdateModalProps) {
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      tracking_id,
      status,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined
    });
  };

  return (
    <Dialog open={true} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Update Shipment Status
          </DialogTitle>
          <DialogDescription>
            Add a status update for tracking ID: <span className="font-mono font-semibold">{tracking_id}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Vendor Declaration:</strong> <span className="font-mono">{vendor_decl_id}</span>
              </p>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed Delivery</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Current Location
              </Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Lagos Distribution Center"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional information about this status update..."
                className="mt-1"
                rows={3}
              />
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
              disabled={isLoading || !status}
              className="flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>{isLoading ? 'Updating...' : 'Add Update'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
