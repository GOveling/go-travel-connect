
import { Check } from "lucide-react";

interface PaymentSummaryProps {
  totalPaid: number;
  remainingAmount: number;
}

const PaymentSummary = ({ totalPaid, remainingAmount }: PaymentSummaryProps) => {
  return (
    <div className="flex items-center justify-between mb-2 text-xs">
      <span className="text-green-600 flex items-center">
        <Check size={12} className="mr-1" />
        Total Paid: ${totalPaid.toFixed(2)}
      </span>
      <span className={remainingAmount > 0.01 ? "text-red-600" : "text-green-600"}>
        Remaining: ${remainingAmount.toFixed(2)}
      </span>
    </div>
  );
};

export default PaymentSummary;
