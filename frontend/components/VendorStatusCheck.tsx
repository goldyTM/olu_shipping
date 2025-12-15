import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Search, Package, CheckCircle, Clock, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { vendor } from '@/api-client';

interface VendorStatusCheckProps {
  onClose: () => void;
}

export default function VendorStatusCheck({ onClose }: VendorStatusCheckProps) {
  const [vendorId, setVendorId] = useState('');
  const [statusData, setStatusData] = useState<any>(null);
  const { toast } = useToast();

  const statusMutation = useMutation({
    mutationFn: (id: string) => vendor.checkStatus(id),
    onSuccess: (data) => {
      setStatusData(data);
    },
    onError: (error) => {
      console.error('Status check error:', error);
      toast({
        title: "Status Check Failed",
        description: "Unable to find shipments with the provided Vendor ID.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendorId.trim()) {
      statusMutation.mutate(vendorId.trim());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'declared':
        return <Clock className="w-5 h-5 text-gray-600" />;
      case 'dispatched':
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'declared':
        return 'bg-gray-100 text-gray-800';
      case 'dispatched':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Check Declaration Status</h3>
          <p className="text-sm text-gray-600">
            Enter your Vendor Declaration ID (VD-XXXX-XXXXX) to check if it's been received
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1">
          <Label htmlFor="vendorId">Vendor Declaration ID</Label>
          <Input
            id="vendorId"
            type="text"
            placeholder="VD-2025-12345"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="mt-1 font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            This is the ID shown after you submit a declaration
          </p>
        </div>
        <div className="flex items-end">
          <Button 
            type="submit" 
            disabled={!vendorId.trim() || statusMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{statusMutation.isPending ? 'Checking...' : 'Check Status'}</span>
          </Button>
        </div>
      </form>

      {statusData && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            Shipments for Vendor ID: {vendorId}
          </h4>
          
          {statusData.shipments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No shipments found for this Vendor ID</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {statusData.shipments.map((shipment: any) => (
                <Card key={shipment.vendorDeclId} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {shipment.vendorDeclId}
                          </Badge>
                          <Badge className={getStatusColor(shipment.status)}>
                            {shipment.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <h5 className="font-medium text-gray-900 mb-1">
                          {shipment.itemName}
                        </h5>
                        
                        <div className="text-sm text-gray-600">
                          <p>Consignee: {shipment.consigneeName}</p>
                          <p>Created: {new Date(shipment.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center space-x-4 mt-3 text-sm">
                          <div className="flex items-center space-x-1">
                            {shipment.received ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={shipment.received ? 'text-green-600' : 'text-gray-500'}>
                              {shipment.received ? 'Received by shipping company' : 'Waiting to be received'}
                            </span>
                          </div>
                          
                          {shipment.inTransit && (
                            <div className="flex items-center space-x-1">
                              <Truck className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-600">In Transit</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {getStatusIcon(shipment.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
