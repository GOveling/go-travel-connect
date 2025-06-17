
import { Check, History } from "lucide-react";

interface PaymentRecord {
  amount: number;
  date: string;
  timestamp: number;
}

interface PaymentRecordProps {
  payments: PaymentRecord[];
}

const PaymentRecordComponent = ({ payments }: PaymentRecordProps) => {
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
            <span className="text-gray-500">
              {payment.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentRecordComponent;
