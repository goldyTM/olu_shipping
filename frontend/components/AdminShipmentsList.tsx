import { Edit, Trash2, Package, User, Mail, Calendar, Weight, Hash, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { AdminShipmentInfo } from '@/types';

interface AdminShipmentsListProps {
  shipments: AdminShipmentInfo[];
  onEdit: (shipment: AdminShipmentInfo) => void;
  onDelete: (shipment: AdminShipmentInfo) => void;
  onDispatch?: (shipment: AdminShipmentInfo) => void;
  onUpdateStatus?: (shipment: AdminShipmentInfo) => void;
  isDeleting: boolean;
}

export default function AdminShipmentsList({ 
  shipments, 
  onEdit, 
  onDelete,
  onDispatch,
  onUpdateStatus,
  isDeleting 
}: AdminShipmentsListProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'declared':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <Card key={shipment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Header Row */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2 flex-wrap">
                  <Badge variant="outline" className="font-mono">
                    {shipment.vendor_decl_id}
                  </Badge>
                  {shipment.tracking_id && (
                    <Badge className="font-mono text-xs bg-green-600">
                      📦 {shipment.tracking_id}
                    </Badge>
                  )}
                  {shipment.vendor_id && (
                    <Badge variant="outline" className="font-mono text-xs bg-blue-50">
                      Vendor: {shipment.vendor_id}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 flex-wrap">
                  {!shipment.tracking_id && onDispatch && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onDispatch(shipment)}
                      className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Dispatch</span>
                    </Button>
                  )}
                  {shipment.tracking_id && onUpdateStatus && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onUpdateStatus(shipment)}
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Update Status</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(shipment)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(shipment)}
                    disabled={isDeleting}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>

              {/* Item Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-gray-400" />
                  {shipment.item_name}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Qty:</span>
                      <span className="ml-1 font-medium">{shipment.quantity}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Weight className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Weight:</span>
                      <span className="ml-1 font-medium">{shipment.weight} kg</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Consignee:</span>
                      <span className="ml-1 font-medium">{shipment.consignee_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-1 font-medium">
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{shipment.consignee_email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-1">{shipment.consignee_phone}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-500">Address:</span>
                  <span className="ml-1">{shipment.consignee_address}</span>
                </div>
                {shipment.hs_code && (
                  <div className="mt-1">
                    <span className="text-gray-500">HS Code:</span>
                    <span className="ml-1 font-mono">{shipment.hs_code}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

