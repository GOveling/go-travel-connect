import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SettlementCard from "./balance/SettlementCard";
import {
  calculatePersonBalance,
  calculateSettlements,
  getAdjustedBalance,
} from "./balance/BalanceCalculator";

interface TripExpense {
  id: string;
  trip_id: string;
  description: string;
  amount: number;
  paid_by: string[];
  split_between: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface PaymentRecord {
  amount: number;
  date: string;
  timestamp: number;
}

interface BalanceSummaryProps {
  expenses: TripExpense[];
  allParticipants: Collaborator[];
}

const BalanceSummary = ({ expenses, allParticipants }: BalanceSummaryProps) => {
  // State to track payment history - key format: "from-to"
  const [paymentHistory, setPaymentHistory] = useState<
    Record<string, PaymentRecord[]>
  >({});
  const [paymentInputs, setPaymentInputs] = useState<Record<string, string>>(
    {}
  );

  const addPayment = (paymentKey: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return;

    const newPayment: PaymentRecord = {
      amount: numAmount,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
    };

    setPaymentHistory((prev) => ({
      ...prev,
      [paymentKey]: [...(prev[paymentKey] || []), newPayment],
    }));

    // Clear the input after adding payment
    setPaymentInputs((prev) => ({
      ...prev,
      [paymentKey]: "",
    }));
  };

  const deletePayment = (paymentKey: string, timestamp: number) => {
    setPaymentHistory((prev) => ({
      ...prev,
      [paymentKey]: (prev[paymentKey] || []).filter(
        (payment) => payment.timestamp !== timestamp
      ),
    }));
  };

  const getTotalPaid = (paymentKey: string): number => {
    const payments = paymentHistory[paymentKey] || [];
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  return (
    <Card>
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg">Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {allParticipants.map((participant) => {
            const originalBalance = calculatePersonBalance(
              participant.name,
              expenses
            );
            const adjustedBalance = getAdjustedBalance(
              participant.name,
              expenses,
              paymentHistory
            );
            const settlements = calculateSettlements(
              participant.name,
              expenses,
              allParticipants,
              paymentHistory
            );

            return (
              <div
                key={participant.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded min-h-[52px]"
              >
                <span className="text-sm md:text-base">{participant.name}</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`font-medium text-sm md:text-base hover:bg-gray-200 px-2 py-1 h-auto ${
                        adjustedBalance > 0
                          ? "text-green-600 hover:text-green-700"
                          : adjustedBalance < 0
                            ? "text-red-600 hover:text-red-700"
                            : "text-gray-600 hover:text-gray-700"
                      }`}
                    >
                      {adjustedBalance > 0 ? "+" : ""}$
                      {adjustedBalance.toFixed(2)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 bg-white">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base">
                        Settlement Details for {participant.name}
                      </h4>

                      {settlements.length > 0 ? (
                        <div className="space-y-3">
                          {settlements.map((settlement, index) => (
                            <SettlementCard
                              key={index}
                              settlement={settlement}
                              index={index}
                              participantName={participant.name}
                              getTotalPaid={getTotalPaid}
                              paymentInputs={paymentInputs}
                              setPaymentInputs={setPaymentInputs}
                              addPayment={addPayment}
                              deletePayment={deletePayment}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {Math.abs(adjustedBalance) < 0.01
                            ? "All settled up! No payments needed."
                            : "No settlements required at this time."}
                        </p>
                      )}

                      {originalBalance !== 0 && (
                        <div className="pt-2 border-t space-y-1">
                          <p className="text-xs text-gray-500">
                            Original balance: {originalBalance > 0 ? "+" : ""}$
                            {originalBalance.toFixed(2)}
                          </p>
                          {Math.abs(originalBalance - adjustedBalance) >
                            0.01 && (
                            <p className="text-xs text-blue-600">
                              After payments: {adjustedBalance > 0 ? "+" : ""}$
                              {adjustedBalance.toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceSummary;
