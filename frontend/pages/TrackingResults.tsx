import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Package, MapPin, Clock, User, Mail, RefreshCw, Plane, Ship, Truck, CheckCircle2, PackageCheck, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusTimeline from '../components/StatusTimeline';
import { tracking } from '@/api-client';

export default function TrackingResults() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const queryClient = useQueryClient();

  const { data: trackingInfo, isLoading, error } = useQuery({
    queryKey: ['tracking', trackingId],
    queryFn: () => tracking.track(trackingId!),
    enabled: !!trackingId,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/3 mb-3 sm:mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 sm:w-1/2 mb-6 sm:mb-8"></div>
          <div className="space-y-4">
            <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
            <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trackingInfo) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">
              Tracking Information Not Found
            </h2>
            <p className="text-sm sm:text-base text-gray-600 break-words">
              We couldn't find any shipment with tracking ID: {trackingId}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'declared':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'dispatched':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { icon: Warehouse, color: 'text-gray-600', description: 'Your shipment has been registered and is awaiting processing at our facility.' };
      case 'declared':
        return { icon: PackageCheck, color: 'text-blue-600', description: 'Shipment declaration has been completed and verified by customs.' };
      case 'dispatched':
        return { icon: Truck, color: 'text-yellow-600', description: 'Your shipment has been dispatched and is on its way to the destination.' };
      case 'in_transit':
        return { icon: status.includes('air') ? Plane : Ship, color: 'text-purple-600', description: 'Your package is currently in transit and moving towards the destination.' };
      case 'out_for_delivery':
        return { icon: Truck, color: 'text-orange-600', description: 'Your package is out for delivery and will arrive soon!' };
      case 'delivered':
        return { icon: CheckCircle2, color: 'text-green-600', description: 'Successfully delivered! Your package has reached its destination.' };
      default:
        return { icon: Package, color: 'text-gray-600', description: 'Shipment status information.' };
    }
  };

  const currentStatusInfo = getStatusInfo(trackingInfo?.status || 'pending');
  const StatusIcon = currentStatusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Animated Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="relative">
                  <Package className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 animate-bounce" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Track Your Shipment
                </h1>
              </div>
              <div className="space-y-1">
                <p className="text-base sm:text-lg font-semibold text-gray-700">
                  📦 {trackingInfo.trackingId}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Declaration ID: {trackingInfo.vendorDeclId}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['tracking', trackingId] })}
              className="flex items-center justify-center space-x-2 w-full sm:w-auto hover:bg-blue-50 transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Status</span>
            </Button>
          </div>
        </div>

        {/* Animated Status Banner */}
        <div className="mb-8">
          <Card className="border-2 shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl">
            <div className={`${getStatusColor(trackingInfo.status)} border-b-2 p-6 sm:p-8 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 opacity-10">
                <StatusIcon className="w-32 h-32 sm:w-48 sm:h-48" />
              </div>
              <div className="relative z-10 flex items-start space-x-4">
                <div className={`${currentStatusInfo.color} animate-pulse`}>
                  <StatusIcon className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    {trackingInfo.status.replace('_', ' ').toUpperCase()}
                  </h2>
                  <p className="text-sm sm:text-base opacity-90 leading-relaxed">
                    {currentStatusInfo.description}
                  </p>
                  {trackingInfo.location && (
                    <div className="flex items-center space-x-2 mt-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-semibold">Current Location: {trackingInfo.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Animated Progress Bar */}
        <div className="mb-8">
          <Card className="shadow-lg overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-blue-600" />
                Shipment Journey
              </h3>
              
              {/* Progress Stages */}
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${
                        trackingInfo.status === 'pending' ? '20%' :
                        trackingInfo.status === 'processing' ? '40%' :
                        trackingInfo.status === 'in_transit' ? '60%' :
                        trackingInfo.status === 'out_for_delivery' ? '80%' :
                        trackingInfo.status === 'delivered' ? '100%' : '0%'
                      }` 
                    }}
                  />
                </div>

                {/* Stage Indicators */}
                <div className="relative flex justify-between items-start pt-0">
                  {/* Pending */}
                  <div className="flex flex-col items-center w-16 sm:w-20">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      ['pending', 'processing', 'in_transit', 'out_for_delivery', 'delivered'].includes(trackingInfo.status.toLowerCase()) 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-gray-300 text-gray-600'
                    } transition-all duration-500`}>
                      <Warehouse className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-center font-medium text-gray-700">Pending</span>
                  </div>

                  {/* Processing */}
                  <div className="flex flex-col items-center w-16 sm:w-20">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      ['processing', 'in_transit', 'out_for_delivery', 'delivered'].includes(trackingInfo.status.toLowerCase()) 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-gray-300 text-gray-600'
                    } transition-all duration-500`}>
                      {trackingInfo.status === 'processing' ? (
                        <PackageCheck className="w-5 h-5 animate-pulse" />
                      ) : (
                        <PackageCheck className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs text-center font-medium text-gray-700">Processing</span>
                  </div>

                  {/* In Transit */}
                  <div className="flex flex-col items-center w-16 sm:w-20">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      ['in_transit', 'out_for_delivery', 'delivered'].includes(trackingInfo.status.toLowerCase()) 
                        ? 'bg-purple-500 text-white shadow-lg' 
                        : 'bg-gray-300 text-gray-600'
                    } transition-all duration-500`}>
                      {trackingInfo.status === 'in_transit' ? (
                        <Ship className="w-5 h-5 animate-bounce" />
                      ) : (
                        <Ship className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs text-center font-medium text-gray-700">In Transit</span>
                  </div>

                  {/* Out for Delivery */}
                  <div className="flex flex-col items-center w-16 sm:w-20">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      ['out_for_delivery', 'delivered'].includes(trackingInfo.status.toLowerCase()) 
                        ? 'bg-orange-500 text-white shadow-lg' 
                        : 'bg-gray-300 text-gray-600'
                    } transition-all duration-500`}>
                      {trackingInfo.status === 'out_for_delivery' ? (
                        <Truck className="w-5 h-5 animate-bounce" />
                      ) : (
                        <Truck className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs text-center font-medium text-gray-700">Out for Delivery</span>
                  </div>

                  {/* Delivered */}
                  <div className="flex flex-col items-center w-16 sm:w-20">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      trackingInfo.status.toLowerCase() === 'delivered' 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : 'bg-gray-300 text-gray-600'
                    } transition-all duration-500`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-center font-medium text-gray-700">Delivered</span>
                  </div>
                </div>

                {/* Moving Vehicle Indicator */}
                <div 
                  className="absolute top-3 transition-all duration-1000 ease-out transform -translate-x-1/2"
                  style={{ 
                    left: `${
                      trackingInfo.status === 'pending' ? '10%' :
                      trackingInfo.status === 'processing' ? '30%' :
                      trackingInfo.status === 'in_transit' ? '50%' :
                      trackingInfo.status === 'out_for_delivery' ? '75%' :
                      trackingInfo.status === 'delivered' ? '95%' : '0%'
                    }` 
                  }}
                >
                  {trackingInfo.status === 'in_transit' ? (
                    <Ship className="w-10 h-10 text-purple-600 animate-bounce drop-shadow-lg" />
                  ) : trackingInfo.status === 'out_for_delivery' ? (
                    <Truck className="w-10 h-10 text-orange-600 animate-bounce drop-shadow-lg" />
                  ) : trackingInfo.status === 'delivered' ? (
                    <CheckCircle2 className="w-10 h-10 text-green-600 drop-shadow-lg" />
                  ) : trackingInfo.status === 'processing' ? (
                    <PackageCheck className="w-10 h-10 text-blue-600 animate-pulse drop-shadow-lg" />
                  ) : (
                    <Warehouse className="w-10 h-10 text-blue-600 drop-shadow-lg" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipment Details Card with Animation */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    Shipment Details
                  </span>
                  <Badge className={`${getStatusColor(trackingInfo.status)} border shadow-sm px-3 py-1`}>
                    {trackingInfo.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Package className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Item Name</p>
                      <p className="font-semibold text-gray-800">{trackingInfo.itemName}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <User className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Consignee</p>
                      <p className="font-semibold text-gray-800">{trackingInfo.consigneeName}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                      <p className="font-semibold text-gray-800 break-all">{trackingInfo.consigneeEmail}</p>
                    </div>
                  </div>
                  {trackingInfo.dispatchDate && (
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dispatch Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(trackingInfo.dispatchDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {trackingInfo.quantity && (
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Package className="w-5 h-5 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Quantity</p>
                        <p className="font-semibold text-gray-800">{trackingInfo.quantity} units</p>
                      </div>
                    </div>
                  )}
                  {trackingInfo.weight && (
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Package className="w-5 h-5 text-pink-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Weight</p>
                        <p className="font-semibold text-gray-800">{trackingInfo.weight} kg</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline Card with Enhanced Animation */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-purple-600 animate-pulse" />
                  Tracking Timeline
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Follow your shipment's journey from declaration to delivery
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <StatusTimeline updates={trackingInfo.updates} />
              </CardContent>
            </Card>

            {/* Status Guide Card */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center text-blue-900">
                  <Ship className="w-5 h-5 mr-2" />
                  Understanding Your Shipment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Warehouse className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">Pending</p>
                      <p className="text-sm text-gray-600">Your shipment is registered and awaiting processing at our warehouse facility.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                    <PackageCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-800">Declared</p>
                      <p className="text-sm text-blue-700">Customs declaration completed and approved. Ready for dispatch.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors">
                    <Truck className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0 animate-bounce" />
                    <div>
                      <p className="font-semibold text-yellow-800">Dispatched</p>
                      <p className="text-sm text-yellow-700">Package has left our facility and is en route to transport hub.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                    <div className="relative">
                      <Ship className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <Plane className="w-3 h-3 text-purple-400 absolute -top-1 -right-1" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-800">In Transit</p>
                      <p className="text-sm text-purple-700">Your package is traveling by air or sea freight to the destination country.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                    <Truck className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-orange-800">Out for Delivery</p>
                      <p className="text-sm text-orange-700">Package is on the delivery vehicle and will arrive at your address soon!</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800">Delivered</p>
                      <p className="text-sm text-green-700">Success! Your package has been delivered to the specified address.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
