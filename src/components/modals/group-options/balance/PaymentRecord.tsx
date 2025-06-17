
import { Check, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentRecord {
  amount: number;
  date: string;
  timestamp: number;
}

interface PaymentRecordProps {
  payments: PaymentRecord[];
  paymentKey?: string;
  onDeletePayment?: (paymentKey: string, timestamp: number) => void;
  canDelete?: boolean;
}

const PaymentRecordComponent = ({ payments, paymentKey, onDeletePayment, canDelete = false }: PaymentRecordProps) => {
  if (payments.length === 0) return null;

  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center text-xs text-gray-600 mb-1">
        <History size={12} className="mr-1" />
        Payment History:
      </div>
      <div className="max-h-24 overflow-y-auto space-y-1">
        {payments
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((payment, paymentIndex) => (
          <div key={paymentIndex} className="flex justify-between items-center text-xs bg-white rounded px-2 py-1">
            <span className="text-green-600 font-medium">
              +${payment.amount.toFixed(2)}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">
                {payment.date}
              </span>
              {canDelete && paymentKey && onDeletePayment && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeletePayment(paymentKey, payment.timestamp)}
                  className="h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X size={10} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentRecordComponent;
