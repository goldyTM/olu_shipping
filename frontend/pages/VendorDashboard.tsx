import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, FileText, Search, TruckIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import VendorDeclarationForm from '../components/VendorDeclarationForm';
import ShipmentsList from '../components/ShipmentsList';
import VendorStatusCheck from '../components/VendorStatusCheck';
import VendorEditModal from '../components/VendorEditModal';
import { vendor } from '@/api-client';
import type { VendorShipment } from '@/types';
import supabase from '@/supabaseClient';

export default function VendorDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [editingShipment, setEditingShipment] = useState<VendorShipment | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user ID
  useEffect(() => {
    async function getUserId() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    }
    getUserId();
  }, []);

  const { data: shipmentsData, isLoading, error } = useQuery({
    queryKey: ['vendor-shipments', userId],
    queryFn: () => vendor.list({ userId: userId || undefined, limit: 50, offset: 0 }),
    enabled: !!userId, // Only run query when we have userId
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnMount: true, // Always refetch on mount
  });

  // Log any errors for debugging
  if (error) {
    console.error('Error loading shipments:', error);
  }

  const declareMutation = useMutation({
    mutationFn: vendor.declare,
    onSuccess: (data) => {
      toast({
        title: "✅ Declaration Successful",
        description: `Vendor Declaration ID: ${data.vendor_decl_id}\n\nUse this ID to check if the shipping company has received your declaration. A customer Tracking ID (TRK-XXXX) will be generated after dispatch.`,
        duration: 10000,
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-shipments'] });
      setShowForm(false);
    },
    onError: (error) => {
      console.error('Declaration error:', error);
      toast({
        title: "Declaration Failed",
        description: "Failed to create shipment declaration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => vendor.updateShipment(id, data),
    onSuccess: () => {
      toast({
        title: "Declaration Updated",
        description: "Declaration has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-shipments'] });
      setEditingShipment(null);
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update declaration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      vendor.deleteShipment(id),
    onSuccess: () => {
      toast({
        title: "Declaration Deleted",
        description: "Declaration has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-shipments'] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete declaration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (shipment: VendorShipment) => {
    setEditingShipment(shipment);
  };

  const handleDelete = (shipment: VendorShipment) => {
    if (confirm(`Are you sure you want to delete declaration ${shipment.vendor_decl_id}? This action cannot be undone.`)) {
      deleteMutation.mutate(shipment.id.toString());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-in fade-in slide-in-from-left duration-500">
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                  <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Vendor Portal
                </h1>
              </div>
              <p className="text-base sm:text-lg text-gray-600 ml-16 sm:ml-18">
                Declare shipments and manage your shipping documents
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-right duration-500">
              <Button 
                onClick={() => setShowStatusCheck(true)}
                variant="outline"
                className="flex items-center justify-center space-x-2 w-full sm:w-auto border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 h-11"
              >
                <Search className="w-5 h-5" />
                <span>Check Status</span>
              </Button>
              <Button 
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 h-11"
                size="lg"
              >
                <Plus className="w-5 h-5" />
                <span>New Declaration</span>
              </Button>
            </div>
          </div>
        </div>

        {showStatusCheck && (
          <Card className="mb-8 shadow-xl border-2 border-blue-200 animate-in fade-in slide-in-from-top duration-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-600" />
                Check Declaration Status
              </CardTitle>
              <CardDescription className="text-base">
                Enter your Vendor Declaration ID (VD-XXXX-XXXXX) to check if it has been received and processed
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <VendorStatusCheck onClose={() => setShowStatusCheck(false)} />
            </CardContent>
          </Card>
        )}

      {showForm && (
        <Card className="mb-8 shadow-xl border-2 border-indigo-200 animate-in fade-in slide-in-from-top duration-500">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center text-xl">
              <Plus className="w-5 h-5 mr-2 text-indigo-600" />
              New Shipment Declaration
            </CardTitle>
            <CardDescription className="text-base">
              Fill in the details below to declare a new shipment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <VendorDeclarationForm
              onSubmit={(data) => declareMutation.mutate(data)}
              onCancel={() => setShowForm(false)}
              isLoading={declareMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl border-2 border-gray-200 hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardTitle className="flex items-center text-xl">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            Recent Declarations
          </CardTitle>
          <CardDescription className="text-base">
            View and manage your shipment declarations
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading && !shipmentsData ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Shipments</h3>
              <p className="text-gray-600 mb-4">
                Unable to load your declarations. Please refresh the page.
              </p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </div>
          ) : (
            <ShipmentsList 
              shipments={shipmentsData?.shipments || []}
              isLoading={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions={true}
              isDeleting={deleteMutation.isPending}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingShipment && (
        <VendorEditModal
          shipment={editingShipment}
          onSave={(data) => updateMutation.mutate(data)}
          onClose={() => setEditingShipment(null)}
          isLoading={updateMutation.isPending}
        />
      )}
      </div>
    </div>
  );
}
