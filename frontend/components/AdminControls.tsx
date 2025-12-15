import { useState } from 'react';
import { Settings, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UpdateStatusRequest } from '~backend/tracking/types';

interface AdminControlsProps {
  trackingId: string;
  currentStatus: string;
  onUpdateStatus: (data: UpdateStatusRequest) => void;
  isLoading: boolean;
}

const statusOptions = [
  { value: 'declared', label: 'Declared' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'customs', label: 'In Customs' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
];

export default function AdminControls({ trackingId, currentStatus, onUpdateStatus, isLoading }: AdminControlsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus({
      trackingId,
      status,
      location: location || undefined,
      notes: notes || undefined,
    });
    setLocation('');
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Update Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative mt-1">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Hong Kong Port"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <div className="relative mt-1">
              <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Package cleared customs..."
                rows={3}
                className="pl-9"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || status === currentStatus}
          >
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
