
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface PaymentInputProps {
  paymentKey: string;
  remainingAmount: number;
  paymentInputs: Record<string, string>;
  setPaymentInputs: (inputs: Record<string, string>) => void;
  onAddPayment: (paymentKey: string, amount: string) => void;
}

const PaymentInput = ({ 
  paymentKey, 
  remainingAmount, 
  paymentInputs, 
  setPaymentInputs, 
  onAddPayment 
}: PaymentInputProps) => {
  if (remainingAmount <= 0.01) return null;

  return (
    <div className="mt-2 space-y-2">
      <Label htmlFor={`payment-${paymentKey}`} className="text-xs">
        Add new payment:
      </Label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <DollarSign size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            id={`payment-${paymentKey}`}
            type="number"
            placeholder="0.00"
            value={paymentInputs[paymentKey] || ''}
            onChange={(e) => setPaymentInputs({
              ...paymentInputs,
              [paymentKey]: e.target.value
            })}
            className="pl-6 h-8 text-xs"
            max={remainingAmount}
            step="0.01"
          />
        </div>
        <Button
          size="sm"
          onClick={() => onAddPayment(paymentKey, paymentInputs[paymentKey] || '0')}
          className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
          disabled={!paymentInputs[paymentKey] || parseFloat(paymentInputs[paymentKey]) <= 0}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default PaymentInput;
