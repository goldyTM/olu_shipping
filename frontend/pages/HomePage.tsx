import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Ship, Package, Search, Truck, Globe, Shield, Clock, Users, ChevronRight, FileText, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { vendor } from '@/api-client';
import { VendorShipment } from '../types';

export default function HomePage() {
  const { data: shipmentsData } = useQuery({
    queryKey: ['recent-shipments'],
    queryFn: () => vendor.list({ limit: 5, offset: 0 }),
  });

  const recentShipments = shipmentsData?.shipments || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-2xl animate-bounce">
                  <Ship className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 px-4 animate-in fade-in slide-in-from-bottom duration-700">
              Olu Shipping Company
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-10 text-blue-100 max-w-4xl mx-auto px-4 leading-relaxed animate-in fade-in slide-in-from-bottom duration-1000">
              Your trusted partner for international shipping between China and global destinations. 
              Precision, reliability, and transparency in every shipment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 animate-in fade-in slide-in-from-bottom duration-1000" style={{ animationDelay: '200ms' }}>
              <Link to="/vendor" className="w-full sm:w-auto">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 flex items-center justify-center space-x-2 w-full h-14 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Package className="w-6 h-6" />
                  <span>Declare Shipment</span>
                </Button>
              </Link>
              <Link to="/tracking" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 flex items-center justify-center space-x-2 w-full h-14 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Search className="w-6 h-6" />
                  <span>Track Package</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Choose Olu Shipping?
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-4">
              We provide comprehensive shipping solutions with cutting-edge technology and reliable service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-blue-200 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Global Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Worldwide shipping network connecting China to major international destinations with reliable partners.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Secure & Safe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Advanced tracking systems and secure handling ensure your packages arrive safely and on time.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Monitor your shipments with live updates, QR code scanning, and detailed status information.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-yellow-200 bg-gradient-to-br from-white to-yellow-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Digital Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Automated invoice and packing list generation with QR codes for easy tracking and verification.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-red-200 bg-gradient-to-br from-white to-red-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Optimized logistics and efficient customs processing for faster delivery times worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-indigo-200 bg-gradient-to-br from-white to-indigo-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Round-the-clock customer support to assist with any questions or concerns about your shipments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Shipments Section */}
      {recentShipments.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Recent Declarations</h2>
                <p className="text-gray-600">Latest shipment declarations in our system</p>
              </div>
              <Link to="/vendor">
                <Button variant="outline" className="flex items-center space-x-2">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentShipments.map((shipment: VendorShipment) => (
                <Card key={shipment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {shipment.vendor_decl_id}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(shipment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {shipment.item_name}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Quantity:</span> {shipment.quantity}
                          </div>
                          <div>
                            <span className="font-medium">Weight:</span> {shipment.weight} kg
                          </div>
                          <div>
                            <span className="font-medium">Consignee:</span> {shipment.consignee_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                        {shipment.qr_code_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(shipment.qr_code_url, '_blank')}
                            className="flex items-center space-x-1"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>QR</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Ship with Confidence?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who trust Olu Shipping for their international shipping needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/vendor">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Start Shipping Today
              </Button>
            </Link>
            <Link to="/tracking">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Track Your Package
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
