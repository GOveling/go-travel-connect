import { ArrowRight, Check } from "lucide-react";
import PaymentRecordComponent from "./PaymentRecord";
import PaymentSummary from "./PaymentSummary";
import PaymentInput from "./PaymentInput";

interface PaymentRecord {
  amount: number;
  date: string;
  timestamp: number;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
  payments: PaymentRecord[];
}

interface SettlementCardProps {
  settlement: Settlement;
  index: number;
  participantName: string;
  getTotalPaid: (paymentKey: string) => number;
  paymentInputs: Record<string, string>;
  setPaymentInputs: (inputs: Record<string, string>) => void;
  addPayment: (paymentKey: string, amount: string) => void;
  deletePayment?: (paymentKey: string, timestamp: number) => void;
}

const SettlementCard = ({
  settlement,
  index,
  participantName,
  getTotalPaid,
  paymentInputs,
  setPaymentInputs,
  addPayment,
  deletePayment,
}: SettlementCardProps) => {
  const paymentKey = `${settlement.from}-${settlement.to}`;
  const totalPaid = getTotalPaid(paymentKey);
  const remainingAmount = settlement.amount - totalPaid;
  const canEditPayment =
    settlement.from === participantName || settlement.from === "You";

  return (
    <div key={index} className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{settlement.from}</span>
          <ArrowRight size={14} className="text-gray-500" />
          <span className="font-medium text-sm">{settlement.to}</span>
        </div>
        <span className="font-semibold text-[#EA6123] text-sm">
          ${settlement.amount.toFixed(2)}
        </span>
      </div>

      <PaymentRecordComponent
        payments={settlement.payments}
        paymentKey={paymentKey}
        onDeletePayment={deletePayment}
        canDelete={canEditPayment}
      />

      <PaymentSummary totalPaid={totalPaid} remainingAmount={remainingAmount} />

      {canEditPayment && (
        <PaymentInput
          paymentKey={paymentKey}
          remainingAmount={remainingAmount}
          paymentInputs={paymentInputs}
          setPaymentInputs={setPaymentInputs}
          onAddPayment={addPayment}
        />
      )}

      {remainingAmount <= 0.01 && (
        <div className="mt-2 text-xs text-green-600 font-medium flex items-center">
          <Check size={12} className="mr-1" />
          Fully paid!
        </div>
      )}
    </div>
  );
};

export default SettlementCard;
