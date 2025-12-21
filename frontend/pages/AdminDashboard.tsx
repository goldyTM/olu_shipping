import { useState } from 'react';
import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Search, Edit, Trash2, Package, Filter, Sparkles, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import AdminShipmentsList from '../components/AdminShipmentsList';
import AdminEditModal from '../components/AdminEditModal';
import AdminDispatchModal from '../components/AdminDispatchModal';
import AdminStatusUpdateModal from '../components/AdminStatusUpdateModal';
import AdminManualDeclarationModal from '../components/AdminManualDeclarationModal';
import { admin, vendor } from '@/api-client';
import type { AdminShipmentInfo } from '@/types';

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<AdminShipmentInfo[]>([]);
  const [editingShipment, setEditingShipment] = useState<AdminShipmentInfo | null>(null);
  const [dispatchingShipment, setDispatchingShipment] = useState<AdminShipmentInfo | null>(null);
  const [updatingStatusShipment, setUpdatingStatusShipment] = useState<AdminShipmentInfo | null>(null);
  const [showManualDeclarationModal, setShowManualDeclarationModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load all shipments on mount
  React.useEffect(() => {
    searchMutation.mutate({ query: '', type: undefined });
  }, []); // Empty dependency array - only run once on mount

  const searchMutation = useMutation({
    mutationFn: (params: { query: string; type: any }) => 
      admin.search(params.query),
    onSuccess: (data) => {
      // Handle both array response and {shipments: []} response
      const shipments = Array.isArray(data) ? data : (data.shipments || []);
      setSearchResults(shipments);
    },
    onError: (error) => {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search shipments. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => admin.updateShipment(id, data),
    onSuccess: () => {
      toast({
        title: "Shipment Updated",
        description: "Shipment details have been updated successfully.",
      });
      setEditingShipment(null);
      // Refresh search results
      if (searchQuery) {
        handleSearch();
      }
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update shipment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      admin.deleteShipment(id),
    onSuccess: () => {
      toast({
        title: "Shipment Deleted",
        description: "Shipment has been deleted successfully.",
      });
      // Refresh search results
      if (searchQuery) {
        handleSearch();
      }
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete shipment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: (data: { vendor_decl_id: string; customer_email: string }) => admin.dispatch(data),
    onSuccess: (data) => {
      toast({
        title: "✅ Shipment Dispatched",
        description: `Tracking ID ${data.tracking_id} has been created and sent to the customer.`,
        duration: 8000,
      });
      setDispatchingShipment(null);
      if (searchQuery) {
        handleSearch();
      }
    },
    onError: (error) => {
      console.error('Dispatch error:', error);
      toast({
        title: "Dispatch Failed",
        description: "Failed to dispatch shipment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const statusUpdateMutation = useMutation({
    mutationFn: (data: { tracking_id: string; status: string; location?: string; notes?: string }) => admin.updateStatus(data),
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Shipment status has been updated successfully.",
      });
      setUpdatingStatusShipment(null);
      if (searchQuery) {
        handleSearch();
      }
    },
    onError: (error) => {
      console.error('Status update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const manualDeclarationMutation = useMutation({
    mutationFn: (data: any) => vendor.declare(data),
    onSuccess: (data) => {
      toast({
        title: "Declaration Created",
        description: `Vendor declaration ${data.vendor_decl_id} has been created successfully.`,
      });
      setShowManualDeclarationModal(false);
      handleSearch();
    },
    onError: (error) => {
      console.error('Manual declaration error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create declaration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = React.useCallback(() => {
    // Allow search with empty query to load all shipments
    const type = searchType === 'all' ? undefined : searchType;
    searchMutation.mutate({ query: searchQuery.trim(), type });
  }, [searchQuery, searchType]);

  const handleEdit = (shipment: AdminShipmentInfo) => {
    setEditingShipment(shipment);
  };

  const handleDelete = (shipment: AdminShipmentInfo) => {
    if (confirm(`Are you sure you want to delete shipment ${shipment.vendor_decl_id}? This action cannot be undone.`)) {
      deleteMutation.mutate(shipment.id.toString());
    }
  };

  const handleManualDeclaration = (data: any) => {
    manualDeclarationMutation.mutate(data);
  };

  const handleUpdateSubmit = (data: any) => {
    if (editingShipment) {
      updateMutation.mutate({
        id: editingShipment.id.toString(),
        ...data
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top duration-700">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white flex items-center">
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 mr-3 sm:mr-4 animate-pulse" />
                  Admin Dashboard
                  <Sparkles className="w-6 h-6 ml-3 animate-bounce" />
                </h1>
                <p className="text-sm sm:text-base text-red-100 mt-2 sm:mt-3">
                  Search, edit, and manage all shipment declarations with full control
                </p>
              </div>
              <Button
                onClick={() => setShowManualDeclarationModal(true)}
                className="bg-white text-red-600 hover:bg-red-50 shadow-lg font-semibold"
              >
                <PackagePlus className="w-5 h-5 mr-2" />
                Create Manual Declaration
              </Button>
            </div>
          </div>
        </div>

        {/* Insights / Quick Stats */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-in fade-in duration-500">
          {/* compute quick stats from searchResults */}
          {(() => {
            const total = searchResults.length;
            const pendingDispatch = searchResults.filter(s => !s.tracking_id).length;
            const dispatched = searchResults.filter(s => !!s.tracking_id).length;
            const recent = searchResults.slice(0, 5);
            const pendingOps = [searchMutation.isPending, deleteMutation.isPending, dispatchMutation.isPending, updateMutation.isPending, statusUpdateMutation.isPending].filter(Boolean).length;

            return (
              <>
                <Card className="col-span-1 sm:col-span-2 shadow-lg border-0">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Insights</h3>
                        <p className="text-sm text-gray-500">High-level metrics for quick monitoring</p>
                      </div>
                      <div className="text-sm text-gray-400">Updated live</div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="p-3 bg-white/60 rounded-lg text-center">
                        <div className="text-2xl font-bold">{total}</div>
                        <div className="text-xs text-gray-500">Total Declarations</div>
                      </div>
                      <div className="p-3 bg-white/60 rounded-lg text-center">
                        <div className="text-2xl font-bold text-amber-600">{pendingDispatch}</div>
                        <div className="text-xs text-gray-500">Pending Dispatch</div>
                      </div>
                      <div className="p-3 bg-white/60 rounded-lg text-center">
                        <div className="text-2xl font-bold text-emerald-600">{dispatched}</div>
                        <div className="text-xs text-gray-500">Dispatched</div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">In-flight admin actions</span>
                        <span className="font-medium">{pendingOps}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1 sm:col-span-2 shadow-lg border-0">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Recent Declarations</h3>
                        <p className="text-sm text-gray-500">Latest 5 by creation time</p>
                      </div>
                      <div className="text-sm text-gray-400">{recent.length}/5</div>
                    </div>

                    <ul className="mt-3 space-y-2">
                      {recent.length === 0 && (
                        <li className="text-sm text-gray-500">No recent declarations</li>
                      )}
                      {recent.map((s) => (
                        <li key={s.id} className="flex items-center justify-between bg-white/50 p-2 rounded">
                          <div className="text-sm">
                            <div className="font-medium">{s.vendor_decl_id}</div>
                            <div className="text-xs text-gray-500">{s.consignee_email || s.consignee_name}</div>
                          </div>
                          <div className="text-right text-xs">
                            <div className="font-medium">{s.tracking_id ? s.tracking_id : '—'}</div>
                            <div className="text-gray-500">{new Date(s.created_at).toLocaleString()}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>

        {/* Search Section */}
        <Card className="mb-6 sm:mb-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Search className="w-5 h-5 mr-2" />
              Search Shipments
            </CardTitle>
            <CardDescription className="text-blue-100">
              Search for shipments by various criteria
            </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="searchQuery">Search Query</Label>
              <Input
                id="searchQuery"
                type="text"
                placeholder="Enter declaration ID, tracking ID, email, etc."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <Label htmlFor="searchType">Search Type</Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="vendor_decl_id">Declaration ID</SelectItem>
                  <SelectItem value="tracking_id">Tracking ID</SelectItem>
                  <SelectItem value="vendor_id">Vendor ID</SelectItem>
                  <SelectItem value="consignee_email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button 
              onClick={handleSearch}
              disabled={searchMutation.isPending}
              className="flex items-center space-x-2 h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Search className="w-4 h-4" />
              <span>{searchMutation.isPending ? 'Searching...' : searchQuery.trim() ? 'Search' : 'Show All'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

        {/* Results Section */}
        {searchResults.length > 0 && (
          <Card className="shadow-xl border-0 animate-in fade-in duration-500">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Search Results ({searchResults.length})
                </span>
              </CardTitle>
            </CardHeader>
          <CardContent>
            <AdminShipmentsList
              shipments={searchResults}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDispatch={(shipment) => setDispatchingShipment(shipment)}
              onUpdateStatus={(shipment) => setUpdatingStatusShipment(shipment)}
              isDeleting={deleteMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

        {searchResults.length === 0 && !searchMutation.isPending && (
          <Card className="shadow-xl border-0 animate-in fade-in duration-500">
            <CardContent className="text-center py-12">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Shipments Found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'No shipments found matching your search criteria.' : 'No shipment declarations in the system yet.'}
              </p>
            </CardContent>
          </Card>
        )}

      {/* Edit Modal */}
      {editingShipment && (
        <AdminEditModal
          shipment={editingShipment}
          onSave={handleUpdateSubmit}
          onClose={() => setEditingShipment(null)}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Dispatch Modal */}
      {dispatchingShipment && (
        <AdminDispatchModal
          shipment={dispatchingShipment}
          onDispatch={(data) => dispatchMutation.mutate(data)}
          onClose={() => setDispatchingShipment(null)}
          isLoading={dispatchMutation.isPending}
        />
      )}

        {/* Status Update Modal */}
        {updatingStatusShipment && updatingStatusShipment.tracking_id && (
          <AdminStatusUpdateModal
            tracking_id={updatingStatusShipment.tracking_id}
            vendor_decl_id={updatingStatusShipment.vendor_decl_id}
            onUpdate={(data) => statusUpdateMutation.mutate(data)}
            onClose={() => setUpdatingStatusShipment(null)}
            isLoading={statusUpdateMutation.isPending}
          />
        )}

        {/* Manual Declaration Modal */}
        {showManualDeclarationModal && (
          <AdminManualDeclarationModal
            onSuccess={() => setShowManualDeclarationModal(false)}
            onClose={() => setShowManualDeclarationModal(false)}
            isLoading={manualDeclarationMutation.isPending}
            onSubmit={handleManualDeclaration}
          />
        )}
      </div>
    </div>
  );
}
