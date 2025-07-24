import { useState } from "react";
import {
  Smartphone,
  X,
  MapPin,
  Calendar,
  Users,
  CalendarIcon,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { JollyRangeCalendar } from "@/components/ui/range-calendar";
import {
  parseDate,
  getLocalTimeZone,
  today,
  CalendarDate,
} from "@internationalized/date";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ESIMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ESIMModal = ({ isOpen, onClose }: ESIMModalProps) => {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    dataAmount: "",
    deviceType: "smartphone",
  });
  const { toast } = useToast();

  const handleDateRangeChange = (
    range: { start: CalendarDate | null; end: CalendarDate | null } | null
  ) => {
    if (range?.start && range?.end) {
      const startDate = format(
        new Date(range.start.year, range.start.month - 1, range.start.day),
        "yyyy-MM-dd"
      );
      const endDate = format(
        new Date(range.end.year, range.end.month - 1, range.end.day),
        "yyyy-MM-dd"
      );
      setFormData((prev) => ({
        ...prev,
        startDate,
        endDate,
      }));
      setIsDateRangeOpen(false);
    }
  };

  const getDateRangeValue = () => {
    if (formData.startDate && formData.endDate) {
      return {
        start: parseDate(formData.startDate),
        end: parseDate(formData.endDate),
      };
    }
    return null;
  };

  const formatDateRange = () => {
    if (formData.startDate && formData.endDate) {
      return `${format(new Date(formData.startDate), "dd/MM/yyyy")} - ${format(new Date(formData.endDate), "dd/MM/yyyy")}`;
    }
    return "Seleccionar período de uso";
  };

  const handleSearch = () => {
    if (!formData.destination || !formData.startDate || !formData.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in destination and travel dates",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Searching eSIM Plans",
      description: "Finding the best data plans for your destination...",
    });
    onClose();
  };

  const dataPlans = [
    { value: "1gb", label: "1GB - Light Usage", price: "$9" },
    { value: "3gb", label: "3GB - Moderate Usage", price: "$19" },
    { value: "5gb", label: "5GB - Heavy Usage", price: "$29" },
    { value: "10gb", label: "10GB - Unlimited", price: "$49" },
    { value: "unlimited", label: "Unlimited Data", price: "$79" },
  ];

  const deviceTypes = [
    { value: "smartphone", label: "Smartphone" },
    { value: "tablet", label: "Tablet" },
    { value: "laptop", label: "Laptop" },
    { value: "other", label: "Other Device" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Smartphone size={24} />
            <div>
              <h2 className="text-xl font-bold">eSIM Data Plans</h2>
              <p className="text-sm opacity-90">
                Stay connected while traveling
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="border-indigo-200 bg-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone size={16} className="text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">
                  Instant Connectivity
                </span>
              </div>
              <p className="text-xs text-indigo-700">
                No physical SIM needed - activate instantly and stay connected
                worldwide
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <Input
                  id="destination"
                  placeholder="Country or region"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }))
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Período de Uso</Label>
              <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      (!formData.startDate || !formData.endDate) &&
                        "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <JollyRangeCalendar
                    value={getDateRangeValue()}
                    onChange={handleDateRangeChange}
                    minValue={today(getLocalTimeZone())}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Plan</Label>
              <div className="grid grid-cols-1 gap-2">
                {dataPlans.map((plan) => (
                  <Card
                    key={plan.value}
                    className={`cursor-pointer transition-all ${
                      formData.dataAmount === plan.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        dataAmount: plan.value,
                      }))
                    }
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{plan.label}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-indigo-600">
                            {plan.price}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <Select
                value={formData.deviceType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, deviceType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map((device) => (
                    <SelectItem key={device.value} value={device.value}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <Smartphone size={16} className="mr-2" />
              Find eSIM Plans
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ESIMModal;
