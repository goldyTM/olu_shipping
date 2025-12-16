import { Clock, MapPin, CheckCircle, Package, Truck, Ship, Plane, Warehouse, PackageCheck } from 'lucide-react';
import type { ShipmentUpdate } from '~backend/tracking/types';

interface StatusTimelineProps {
  updates: ShipmentUpdate[];
}

export default function StatusTimeline({ updates }: StatusTimelineProps) {
  if (updates.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-500 text-lg font-medium">No tracking updates available yet.</p>
        <p className="text-gray-400 text-sm mt-2">Updates will appear here as your shipment progresses.</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'out_for_delivery':
        return <Truck className="w-6 h-6 text-orange-600 animate-bounce" />;
      case 'in_transit':
        return <Ship className="w-6 h-6 text-blue-600" />;
      case 'dispatched':
        return <Plane className="w-6 h-6 text-yellow-600" />;
      case 'declared':
        return <PackageCheck className="w-6 h-6 text-blue-500" />;
      case 'pending':
        return <Warehouse className="w-6 h-6 text-gray-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'out_for_delivery':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'in_transit':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'dispatched':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'declared':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-gray-700 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'from-green-500 to-emerald-600';
      case 'out_for_delivery':
        return 'from-orange-500 to-amber-600';
      case 'in_transit':
        return 'from-blue-500 to-indigo-600';
      case 'dispatched':
        return 'from-yellow-500 to-orange-500';
      case 'declared':
        return 'from-blue-400 to-cyan-500';
      case 'pending':
        return 'from-gray-500 to-slate-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  // Sort updates by timestamp - oldest first to show journey progression
  const sortedUpdates = [...updates].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="relative space-y-6">
      {sortedUpdates.map((update, index) => (
        <div 
          key={update.id || `update-${index}-${update.timestamp}`} 
          className="relative group animate-in fade-in slide-in-from-left duration-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Connection Line */}
          {index < updates.length - 1 && (
            <div className="absolute left-7 top-14 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent"></div>
          )}
          
          <div className="flex items-start space-x-4">
            {/* Icon with Animated Background */}
            <div className={`relative flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br ${getStatusGradient(update.status)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse"></div>
              <div className="relative text-white">
                {getStatusIcon(update.status)}
              </div>
            </div>
            
            {/* Content Card */}
            <div className="flex-1 min-w-0">
              <div className={`p-4 rounded-lg border-2 ${getStatusColor(update.status)} shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border-2 ${getStatusColor(update.status)} uppercase tracking-wider shadow-sm`}>
                      {update.status.replace('_', ' ')}
                    </span>
                    {update.location && (
                      <span className="flex items-center space-x-1 text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{update.location}</span>
                      </span>
                    )}
                  </div>
                  <span className="flex items-center space-x-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(update.timestamp).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </span>
                </div>
                
                {update.notes && (
                  <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{update.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
