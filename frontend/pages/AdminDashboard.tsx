import { useState } from 'react';
import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Search, Edit, Trash2, Package, Filter, Sparkles, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import AdminShipmentsList from '../components/AdminShipmentsList';
import AdminEditModal from '../components/AdminEditModal';
import AdminDispatchModal from '../components/AdminDispatchModal';
import AdminStatusUpdateModal from '../components/AdminStatusUpdateModal';
import AdminManualDeclarationModal from '../components/AdminManualDeclarationModal';
import { admin, vendor } from '@/api-client';
import type { AdminShipmentInfo, ContainerInfo } from '@/types';

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<AdminShipmentInfo[]>([]);
  const [editingShipment, setEditingShipment] = useState<AdminShipmentInfo | null>(null);
  const [dispatchingShipment, setDispatchingShipment] = useState<AdminShipmentInfo | null>(null);
  const [updatingStatusShipment, setUpdatingStatusShipment] = useState<AdminShipmentInfo | null>(null);
  const [showManualDeclarationModal, setShowManualDeclarationModal] = useState(false);
  
  // Container management state
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [showCreateContainer, setShowCreateContainer] = useState(false);
  const [newContainerName, setNewContainerName] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<ContainerInfo | null>(null);
  const [showContainerModal, setShowContainerModal] = useState(false);
  const [showContainerDeclarations, setShowContainerDeclarations] = useState(false);
  const [containerDeclarations, setContainerDeclarations] = useState<AdminShipmentInfo[]>([]);
  const [availableDeclarations, setAvailableDeclarations] = useState<AdminShipmentInfo[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load all shipments on mount
  React.useEffect(() => {
    searchMutation.mutate({ query: '', type: undefined });
  }, []); // Empty dependency array - only run once on mount

  const searchMutation = useMutation({
    mutationFn: (params: { query: string; type: any }) => 
      admin.search(params.query),
    onSuccess: (data: any) => {
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

  // Container mutations
  const createContainerMutation = useMutation({
    mutationFn: (containerName: string) => admin.createContainer(containerName),
    onSuccess: (newContainer) => {
      toast({
        title: "Container Created",
        description: `Container "${newContainer.containerName}" has been created.`,
      });
      setContainers(prev => [newContainer, ...prev]);
      setNewContainerName('');
      setShowCreateContainer(false);
    },
    onError: (error) => {
      console.error('Create container error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create container. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateContainerMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: number; status?: string; containerName?: string }) => 
      admin.updateContainer(id, updates),
    onSuccess: (updatedContainer) => {
      toast({
        title: "Container Updated",
        description: `Container "${updatedContainer.containerName}" has been updated.`,
      });
      setContainers(prev => prev.map(c => c.id === updatedContainer.id ? updatedContainer : c));
      setSelectedContainer(null);
      setShowContainerModal(false);
      // Refresh shipments to show updated status
      if (searchQuery) {
        handleSearch();
      }
    },
    onError: (error) => {
      console.error('Update container error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update container. Please try again.",
        variant: "destructive",
      });
    },
  });

  const assignShipmentMutation = useMutation({
    mutationFn: ({ trackingId, containerId }: { trackingId: string; containerId: number | null }) => 
      admin.assignShipmentToContainer(trackingId, containerId),
    onSuccess: () => {
      toast({
        title: "Shipment Assigned",
        description: "Shipment has been assigned to container successfully.",
      });
      // Refresh shipments to show container assignment
      if (searchQuery) {
        handleSearch();
      }
      // Refresh container declarations if modal is open
      if (selectedContainer) {
        handleViewContainerDeclarations(selectedContainer);
      }
    },
    onError: (error) => {
      console.error('Assign shipment error:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign shipment to container. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteContainerMutation = useMutation({
    mutationFn: (containerId: number) => admin.deleteContainer(containerId),
    onSuccess: (_, deleteId) => {
      toast({
        title: "Container Deleted",
        description: "Container has been deleted and shipments have been released.",
      });
      setContainers(prev => prev.filter(c => c.id !== deleteId));
      setSelectedContainer(null);
      setShowContainerModal(false);
    },
    onError: (error) => {
      console.error('Delete container error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete container. Please try again.",
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

  // Load containers on mount
  React.useEffect(() => {
    const loadContainers = async () => {
      try {
        const containerData = await admin.listContainers();
        setContainers(containerData);
      } catch (error) {
        console.error('Failed to load containers:', error);
      }
    };
    loadContainers();
  }, []);

  const handleCreateContainer = () => {
    if (newContainerName.trim()) {
      createContainerMutation.mutate(newContainerName.trim());
    }
  };

  const handleUpdateContainer = (container: ContainerInfo) => {
    setSelectedContainer(container);
    setShowContainerModal(true);
  };

  const handleContainerStatusUpdate = (status: string) => {
    if (selectedContainer) {
      updateContainerMutation.mutate({ id: selectedContainer.id, status });
    }
  };

  const handleAssignShipment = (trackingId: string, containerId: number | null) => {
    assignShipmentMutation.mutate({ trackingId, containerId });
  };

  const handleViewContainerDeclarations = async (container: ContainerInfo) => {
    setSelectedContainer(container);
    setShowContainerDeclarations(true);
    
    try {
      // Load all dispatched shipments
      const allShipments = await admin.search('');
      
      // Get shipments that are dispatched (have tracking_id)
      const dispatchedShipments = allShipments.filter(s => s.tracking_id);
      
      // Load declarations currently in this container
      const containerShipments = await admin.getContainerShipments(container.id);
      setContainerDeclarations(containerShipments as any);
      
      // Load available declarations (dispatched but not in any container)
      const available = dispatchedShipments.filter(s => 
        !containerShipments.find(cs => cs.tracking_id === s.tracking_id)
      );
      setAvailableDeclarations(available);
    } catch (error) {
      console.error('Failed to load container declarations:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load container declarations.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContainer = (containerId: number) => {
    if (confirm('Are you sure you want to delete this container? All shipments will be released.')) {
      deleteContainerMutation.mutate(containerId);
    }
  };

  const handleCreateDeclarationInContainer = (containerId: number) => {
    setSelectedContainer(containers.find(c => c.id === containerId) || null);
    setShowManualDeclarationModal(true);
  };

  const handleAttachDeclarationToContainer = (trackingId: string, containerId: number) => {
    assignShipmentMutation.mutate({ trackingId, containerId });
  };

  const handleEdit = (shipment: AdminShipmentInfo) => {
    setEditingShipment(shipment);
  };

  const handleDelete = (shipment: AdminShipmentInfo) => {
    if (confirm(`Are you sure you want to delete shipment ${shipment.vendor_decl_id}? This action cannot be undone.`)) {
      deleteMutation.mutate(shipment.id.toString());
    }
  };

  const handleManualDeclaration = (data: any) => {
    manualDeclarationMutation.mutate(data, {
      onSuccess: (createdDeclaration) => {
        // If containerId was specified, assign the declaration to that container
        if (data.containerId && createdDeclaration.tracking_id) {
          assignShipmentMutation.mutate({
            trackingId: createdDeclaration.tracking_id,
            containerId: data.containerId
          });
        }
      }
    });
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

        {/* Container Management Section */}
        <Card className="shadow-xl border-0 animate-in fade-in duration-500">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Container Management ({containers.length})
              </span>
              <Button
                onClick={() => setShowCreateContainer(true)}
                size="sm"
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                <PackagePlus className="w-4 h-4 mr-2" />
                New Container
              </Button>
            </CardTitle>
            <CardDescription className="text-purple-100">
              Create and manage shipping containers for bulk operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {containers.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No containers created yet</p>
                <Button
                  onClick={() => setShowCreateContainer(true)}
                  className="mt-4"
                  variant="outline"
                >
                  <PackagePlus className="w-4 h-4 mr-2" />
                  Create First Container
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {containers.map((container) => (
                  <Card key={container.id} className="border-2 hover:border-purple-300 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="truncate">{container.containerName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          container.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          container.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                          container.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                          container.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {container.status}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        {container.shipmentCount || 0} shipments • Created {new Date(container.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewContainerDeclarations(container)}
                          className="flex-1"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Manage ({container.shipmentCount || 0})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateContainer(container)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Status
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
              containers={containers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDispatch={(shipment) => setDispatchingShipment(shipment)}
              onUpdateStatus={(shipment) => setUpdatingStatusShipment(shipment)}
              onAssignToContainer={handleAssignShipment}
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
            onClose={() => {
              setShowManualDeclarationModal(false);
              setSelectedContainer(null); // Clear container selection
            }}
            isLoading={manualDeclarationMutation.isPending}
            onSubmit={handleManualDeclaration}
            containerId={selectedContainer?.id}
          />
        )}

        {/* Create Container Modal */}
        {showCreateContainer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create New Container</CardTitle>
                <CardDescription>
                  Enter a name for the new shipping container
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="containerName">Container Name</Label>
                    <Input
                      id="containerName"
                      type="text"
                      placeholder="e.g., Container-001"
                      value={newContainerName}
                      onChange={(e) => setNewContainerName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateContainer()}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateContainer(false);
                        setNewContainerName('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateContainer}
                      disabled={!newContainerName.trim() || createContainerMutation.isPending}
                    >
                      {createContainerMutation.isPending ? 'Creating...' : 'Create Container'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Container Management Modal */}
        {showContainerModal && selectedContainer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Manage Container: {selectedContainer.containerName}</CardTitle>
                <CardDescription>
                  Update container status or assign shipments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Container Status Update */}
                  <div>
                    <Label className="text-base font-medium">Update Container Status</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      This will update the status of all shipments in this container
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {['pending', 'dispatched', 'in_transit', 'delivered'].map((status) => (
                        <Button
                          key={status}
                          variant={selectedContainer.status === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleContainerStatusUpdate(status)}
                          disabled={updateContainerMutation.isPending}
                        >
                          {status.replace('_', ' ').toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Shipments in Container */}
                  <div>
                    <Label className="text-base font-medium">Shipments in Container</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      {selectedContainer.shipmentCount || 0} shipments currently assigned
                    </p>
                    {selectedContainer.shipmentCount === 0 && (
                      <p className="text-gray-500 italic">No shipments assigned to this container yet</p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-between pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteContainer(selectedContainer.id)}
                      disabled={deleteContainerMutation.isPending}
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{deleteContainerMutation.isPending ? 'Deleting...' : 'Delete Container'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowContainerModal(false);
                        setSelectedContainer(null);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Container Declarations Management Modal */}
        {showContainerDeclarations && selectedContainer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Manage Declarations: {selectedContainer.containerName}</span>
                  <Badge variant="outline">{selectedContainer.status}</Badge>
                </CardTitle>
                <CardDescription>
                  Add new declarations or attach existing ones to this container
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      onClick={() => handleCreateDeclarationInContainer(selectedContainer.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <PackagePlus className="w-4 h-4 mr-2" />
                      Create New Declaration
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Refresh available declarations
                        admin.search('').then(shipments => {
                          const available = shipments.filter(s => s.tracking_id); // Show dispatched shipments
                          setAvailableDeclarations(available);
                        });
                      }}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Refresh Available
                    </Button>
                  </div>

                  {/* Current Declarations in Container */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Declarations in Container ({containerDeclarations.length})</h3>
                    {containerDeclarations.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No declarations in this container yet</p>
                        <p className="text-sm text-gray-400 mt-1">Create a new declaration or attach existing ones</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {containerDeclarations.slice(0, 10).map((shipment) => (
                          <Card key={shipment.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Badge variant="outline">{shipment.vendor_decl_id}</Badge>
                                <span className="font-medium">{shipment.item_name}</span>
                                <span className="text-sm text-gray-500">Qty: {shipment.quantity}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAssignShipment(shipment.tracking_id!, null)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          </Card>
                        ))}
                        {containerDeclarations.length > 10 && (
                          <p className="text-sm text-gray-500 text-center">
                            And {containerDeclarations.length - 10} more declarations...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Available Declarations to Attach */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Available Declarations ({availableDeclarations.length})</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      These are dispatched shipments that aren't currently assigned to any container
                    </p>
                    {availableDeclarations.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No available declarations to attach</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {availableDeclarations.slice(0, 10).map((shipment) => (
                          <Card key={shipment.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Badge variant="outline">{shipment.vendor_decl_id}</Badge>
                                <span className="font-medium">{shipment.item_name}</span>
                                <span className="text-sm text-gray-500">Qty: {shipment.quantity}</span>
                                {shipment.tracking_id && (
                                  <Badge variant="secondary" className="text-xs">
                                    {shipment.tracking_id}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAttachDeclarationToContainer(shipment.tracking_id!, selectedContainer.id)}
                                disabled={assignShipmentMutation.isPending}
                              >
                                {assignShipmentMutation.isPending ? 'Attaching...' : 'Attach'}
                              </Button>
                            </div>
                          </Card>
                        ))}
                        {availableDeclarations.length > 10 && (
                          <p className="text-sm text-gray-500 text-center">
                            And {availableDeclarations.length - 10} more available declarations...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowContainerDeclarations(false);
                        setSelectedContainer(null);
                        setContainerDeclarations([]);
                        setAvailableDeclarations([]);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
