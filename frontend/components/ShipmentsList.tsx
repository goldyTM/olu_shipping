import { Download, QrCode, Eye, Package, Edit, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import type { VendorShipment } from '@/types';

interface ShipmentsListProps {
  shipments: VendorShipment[];
  isLoading: boolean;
  onEdit?: (shipment: VendorShipment) => void;
  onDelete?: (shipment: VendorShipment) => void;
  showActions?: boolean;
  isDeleting?: boolean;
}

export default function ShipmentsList({ 
  shipments, 
  isLoading, 
  onEdit, 
  onDelete, 
  showActions = false,
  isDeleting = false
}: ShipmentsListProps) {
  const navigate = useNavigate();
  
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Declarations Yet</h3>
        <p className="text-gray-600">
          Create your first shipment declaration to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <Card key={shipment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono text-xs sm:text-sm">
                    {shipment.vendor_decl_id}
                  </Badge>
                  {shipment.tracking_id ? (
                    <Badge className="font-mono text-xs bg-green-600 hover:bg-green-700">
                      ✓ Dispatched: {shipment.tracking_id}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                      ⏳ Awaiting Dispatch
                    </Badge>
                  )}
                  {shipment.vendor_id && (
                    <Badge variant="outline" className="font-mono text-xs bg-blue-50">
                      {shipment.vendor_id}
                    </Badge>
                  )}
                  <span className="text-xs sm:text-sm text-gray-500">
                    {new Date(shipment.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">
                  {shipment.item_name}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Quantity:</span> {shipment.quantity}
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span> {shipment.weight} kg
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1 break-words">
                    <span className="font-medium">Consignee:</span> {shipment.consignee_name}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {shipment.tracking_id && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/track/${shipment.tracking_id}`)}
                    className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Track Shipment</span>
                  </Button>
                )}
                
                {showActions && onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(shipment)}
                    className="flex items-center space-x-1 flex-1 sm:flex-none"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                )}
                
                {showActions && onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(shipment)}
                    disabled={isDeleting}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                )}

                {shipment.qr_code_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(shipment.qr_code_url, '_blank')}
                    className="flex items-center space-x-1"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="hidden sm:inline">QR</span>
                  </Button>
                )}
                
                {shipment.invoice_pdf_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(shipment.invoice_pdf_url!, `invoice-${shipment.vendor_decl_id}.pdf`)}
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Invoice</span>
                  </Button>
                )}
                
                {shipment.packing_list_pdf_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(shipment.packing_list_pdf_url!, `packing-list-${shipment.vendor_decl_id}.pdf`)}
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Packing</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

