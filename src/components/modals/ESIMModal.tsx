
import { useState } from "react";
import { X, Smartphone, Globe, Wifi, Check, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ESIMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ESIMModal = ({ isOpen, onClose }: ESIMModalProps) => {
  const isMobile = useIsMobile();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const esimPlans = [
    {
      id: "global-1gb",
      region: "Global",
      data: "1GB",
      duration: "7 days",
      price: "$9.99",
      countries: "120+ countries",
      rating: 4.8,
      popular: true,
      features: ["Instant activation", "No roaming fees", "24/7 support"]
    },
    {
      id: "europe-3gb",
      region: "Europe",
      data: "3GB",
      duration: "15 days",
      price: "$19.99",
      countries: "30+ countries",
      rating: 4.9,
      popular: false,
      features: ["High-speed data", "Voice calls", "SMS included"]
    },
    {
      id: "asia-5gb",
      region: "Asia Pacific",
      data: "5GB",
      duration: "30 days",
      price: "$29.99",
      countries: "15+ countries",
      rating: 4.7,
      popular: false,
      features: ["Premium network", "Unlimited social media", "Hotspot enabled"]
    },
    {
      id: "usa-unlimited",
      region: "USA & Canada",
      data: "Unlimited",
      duration: "30 days",
      price: "$39.99",
      countries: "2 countries",
      rating: 4.9,
      popular: false,
      features: ["Truly unlimited", "5G network", "No throttling"]
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePurchase = () => {
    // Handle purchase logic here
    console.log("Purchasing plan:", selectedPlan);
    onClose();
  };

  const ModalContent = () => (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Header Section */}
      <div className="text-center space-y-2 pb-4 border-b">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
          <Smartphone className="text-white" size={32} />
        </div>
        <h3 className="text-xl font-bold">Stay Connected Worldwide</h3>
        <p className="text-sm text-gray-600">
          Get instant mobile data with our global eSIM plans
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3 py-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Globe size={20} className="text-blue-600" />
          </div>
          <p className="text-xs font-medium">Global Coverage</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
            <Wifi size={20} className="text-green-600" />
          </div>
          <p className="text-xs font-medium">Instant Setup</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
            <Check size={20} className="text-purple-600" />
          </div>
          <p className="text-xs font-medium">No Roaming</p>
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Choose Your Plan</h4>
        {esimPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`cursor-pointer transition-all ${
              selectedPlan === plan.id ? 'ring-2 ring-pink-500' : ''
            } ${plan.popular ? 'border-pink-200 bg-pink-50' : ''}`}
            onClick={() => handleSelectPlan(plan.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h5 className="font-semibold">{plan.region}</h5>
                  {plan.popular && (
                    <Badge className="bg-pink-500 text-white text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-pink-600">{plan.price}</p>
                  <div className="flex items-center space-x-1">
                    <Star size={12} className="text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{plan.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <div>📱 {plan.data}</div>
                <div>⏱️ {plan.duration}</div>
                <div>🌍 {plan.countries}</div>
                <div className="flex items-center">
                  {selectedPlan === plan.id && (
                    <Check size={16} className="text-pink-500 mr-1" />
                  )}
                  {selectedPlan === plan.id ? 'Selected' : 'Available'}
                </div>
              </div>

              <div className="space-y-1">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                    <Check size={12} className="text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchase Section */}
      {selectedPlan && (
        <div className="pt-4 border-t space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium">How it works:</p>
            <ol className="text-xs text-gray-600 mt-2 space-y-1">
              <li>1. Purchase your eSIM plan</li>
              <li>2. Receive QR code via email</li>
              <li>3. Scan with your phone to activate</li>
              <li>4. Enjoy instant connectivity!</li>
            </ol>
          </div>
          
          <Button 
            onClick={handlePurchase}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold"
          >
            Purchase Selected Plan
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Compatible with iPhone XS/XR and newer, Google Pixel 3 and newer
          </p>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-center">eSIM Plans</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <ModalContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>eSIM Plans</DialogTitle>
        </DialogHeader>
        <ModalContent />
      </DialogContent>
    </Dialog>
  );
};

export default ESIMModal;
