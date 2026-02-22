import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, QrCode, Package, ArrowRight, Ship, Sparkles, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { tracking } from '@/api-client';

export default function ReceiverTracking() {
  const [searchValue, setSearchValue] = useState('');
  const [isQrMode, setIsQrMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const trackMutation = useMutation({
    mutationFn: (id: string) => tracking.track(id),
    onSuccess: (data) => {
      navigate(`/tracking/${data.trackingId}`);
    },
    onError: (error: any) => {
      console.error('Tracking error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Unable to find shipment with the provided ID.";
      toast({
        title: "Tracking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const qrSearchMutation = useMutation({
    mutationFn: (qrCode: string) => tracking.searchByQr(qrCode),
    onSuccess: (data) => {
      navigate(`/tracking/${data.trackingId}`);
    },
    onError: (error) => {
      console.error('QR search error:', error);
      toast({
        title: "Search Failed",
        description: "Unable to find shipment with the provided input.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    const input = searchValue.trim();

    // Scroll to top before processing
    window.scrollTo(0, 0);

    if (isQrMode) {
      // QR mode: use searchByQr
      qrSearchMutation.mutate(input);
    } else {
      // ID mode: try track first
      try {
        const result = await tracking.track(input);
        navigate(`/tracking/${result.trackingId}`);
      } catch (error) {
        // If track fails, try QR search as fallback
        try {
          const qrResult = await tracking.searchByQr(input);
          navigate(`/tracking/${qrResult.trackingId}`);
        } catch (qrError) {
          toast({
            title: "Search Failed",
            description: "Unable to find shipment with the provided input.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const toggleQrMode = () => {
    setIsQrMode(!isQrMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Animated Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Ship className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Track Your Shipment
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4 mb-3 max-w-2xl mx-auto">
            Enter your tracking ID or vendor declaration ID to get real-time updates on your package journey
          </p>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Accepted formats:</span>
            <span className="font-mono bg-white px-3 py-1 rounded-full text-blue-800 shadow-sm">TRK-2025-XXXXX</span>
            <span className="text-blue-400">or</span>
            <span className="font-mono bg-white px-3 py-1 rounded-full text-blue-800 shadow-sm">VD-2025-XXXXX</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 sm:gap-8 mb-12">
          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-100">
            <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Track Your Shipment</CardTitle>
              <CardDescription className="text-base">
                Enter your tracking ID, vendor declaration ID, or QR code content
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="searchValue" className="text-base font-semibold">
                    {isQrMode ? 'QR Code Content' : 'Tracking ID or Declaration ID'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="searchValue"
                      type="text"
                      placeholder={isQrMode ? "OLU-SHIPPING:VD-2024-1234" : "TRK-2025-12345 or VD-2025-12345"}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="mt-2 text-lg h-12 border-2 focus:border-blue-500 transition-colors pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleQrMode}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full"
                      title={isQrMode ? "Switch to ID search" : "Switch to QR search"}
                    >
                      {isQrMode ? <Search className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {isQrMode 
                      ? "Enter QR code content or paste the scanned text" 
                      : "Enter customer tracking number (TRK-) or vendor declaration ID (VD-)"
                    }
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!searchValue.trim() || trackMutation.isPending || qrSearchMutation.isPending}
                >
                  {(trackMutation.isPending || qrSearchMutation.isPending) ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    <>
                      Track Shipment
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Need help finding your tracking information?
                </h3>
                <ul className="text-gray-700 space-y-2.5">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">•</span>
                    <span><strong className="text-blue-800">Customer Tracking ID (TRK-XXXX)</strong> was sent to your email when the shipment was dispatched</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">•</span>
                    <span><strong className="text-blue-800">Vendor Declaration ID (VD-XXXX)</strong> is the internal reference number</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">•</span>
                    <span><strong className="text-blue-800">QR codes</strong> contain shipment information - use the camera button to switch to QR mode</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">•</span>
                    <span>Contact us at <a href="mailto:info@olushipping.com" className="text-blue-600 font-semibold hover:underline">info@olushipping.com</a> if you need assistance</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
