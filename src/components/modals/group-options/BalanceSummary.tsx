
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Check, DollarSign, History, X } from "lucide-react";

interface Expense {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: string;
}

interface Collaborator {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  description?: string;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
  payments: PaymentRecord[];
}

interface BalanceSummaryProps {
  expenses: Expense[];
  allParticipants: Collaborator[];
}

const BalanceSummary = ({ expenses, allParticipants }: BalanceSummaryProps) => {
  // State to track payment records for each settlement - key format: "from-to"
  const [settlementPayments, setSettlementPayments] = useState<Record<string, PaymentRecord[]>>({});
  const [paymentInputs, setPaymentInputs] = useState<Record<string, string>>({});
  const [paymentDescriptions, setPaymentDescriptions] = useState<Record<string, string>>({});

  const calculatePersonBalance = (person: string) => {
    let balance = 0;
    expenses.forEach(expense => {
      if (expense.paidBy === person) {
        balance += expense.amount;
      }
      if (expense.splitBetween.includes(person)) {
        balance -= expense.amount / expense.splitBetween.length;
      }
    });
    return balance;
  };

  const calculateSettlements = (person: string): Settlement[] => {
    const settlements: Settlement[] = [];
    const personBalance = calculatePersonBalance(person);
    
    if (personBalance < 0) {
      // Person owes money
      const amountOwed = Math.abs(personBalance);
      
      // Find people who are owed money (positive balance)
      const creditors = allParticipants
        .filter(p => p.name !== person)
        .map(p => ({ name: p.name, balance: calculatePersonBalance(p.name) }))
        .filter(p => p.balance > 0)
        .sort((a, b) => b.balance - a.balance);
      
      let remainingDebt = amountOwed;
      
      creditors.forEach(creditor => {
        if (remainingDebt > 0) {
          const paymentAmount = Math.min(remainingDebt, creditor.balance);
          if (paymentAmount > 0.01) {
            const paymentKey = `${person}-${creditor.name}`;
            const payments = settlementPayments[paymentKey] || [];
            
            settlements.push({
              from: person,
              to: creditor.name,
              amount: paymentAmount,
              payments: payments
            });
            remainingDebt -= paymentAmount;
          }
        }
      });
    } else if (personBalance > 0) {
      // Person is owed money
      const amountOwed = personBalance;
      
      // Find people who owe money (negative balance)
      const debtors = allParticipants
        .filter(p => p.name !== person)
        .map(p => ({ name: p.name, balance: calculatePersonBalance(p.name) }))
        .filter(p => p.balance < 0)
        .sort((a, b) => a.balance - b.balance);
      
      let remainingCredit = amountOwed;
      
      debtors.forEach(debtor => {
        if (remainingCredit > 0) {
          const paymentAmount = Math.min(remainingCredit, Math.abs(debtor.balance));
          if (paymentAmount > 0.01) {
            const paymentKey = `${debtor.name}-${person}`;
            const payments = settlementPayments[paymentKey] || [];
            
            settlements.push({
              from: debtor.name,
              to: person,
              amount: paymentAmount,
              payments: payments
            });
            remainingCredit -= paymentAmount;
          }
        }
      });
    }
    
    return settlements;
  };

  const handlePaymentAdd = (paymentKey: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return;

    const newPayment: PaymentRecord = {
      id: `${paymentKey}-${Date.now()}`,
      amount: numAmount,
      date: new Date().toLocaleDateString(),
      description: paymentDescriptions[paymentKey] || undefined
    };

    setSettlementPayments(prev => ({
      ...prev,
      [paymentKey]: [...(prev[paymentKey] || []), newPayment]
    }));

    // Clear inputs
    setPaymentInputs(prev => ({
      ...prev,
      [paymentKey]: ''
    }));
    setPaymentDescriptions(prev => ({
      ...prev,
      [paymentKey]: ''
    }));
  };

  const handleRemovePayment = (paymentKey: string, paymentId: string) => {
    setSettlementPayments(prev => ({
      ...prev,
      [paymentKey]: (prev[paymentKey] || []).filter(p => p.id !== paymentId)
    }));
  };

  const getTotalPaid = (paymentKey: string) => {
    const payments = settlementPayments[paymentKey] || [];
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getAdjustedBalance = (person: string) => {
    const originalBalance = calculatePersonBalance(person);
    
    // Calculate total payments made by this person
    let totalPaid = 0;
    Object.entries(settlementPayments).forEach(([key, payments]) => {
      const [from] = key.split('-');
      if (from === person) {
        totalPaid += payments.reduce((sum, payment) => sum + payment.amount, 0);
      }
    });

    // Calculate total payments received by this person
    let totalReceived = 0;
    Object.entries(settlementPayments).forEach(([key, payments]) => {
      const [, to] = key.split('-');
      if (to === person) {
        totalReceived += payments.reduce((sum, payment) => sum + payment.amount, 0);
      }
    });

    return originalBalance + totalPaid - totalReceived;
  };

  return (
    <Card>
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg">Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {allParticipants.map((participant) => {
            const originalBalance = calculatePersonBalance(participant.name);
            const adjustedBalance = getAdjustedBalance(participant.name);
            const settlements = calculateSettlements(participant.name);
            
            return (
              <div key={participant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded min-h-[52px]">
                <span className="text-sm md:text-base">{participant.name}</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`font-medium text-sm md:text-base hover:bg-gray-200 px-2 py-1 h-auto ${
                        adjustedBalance > 0 ? 'text-green-600 hover:text-green-700' : 
                        adjustedBalance < 0 ? 'text-red-600 hover:text-red-700' : 
                        'text-gray-600 hover:text-gray-700'
                      }`}
                      disabled={Math.abs(adjustedBalance) < 0.01}
                    >
                      {adjustedBalance > 0 ? '+' : ''}${adjustedBalance.toFixed(2)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 bg-white max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base">
                        Settlement Details for {participant.name}
                      </h4>
                      
                      {settlements.length > 0 ? (
                        <div className="space-y-3">
                          {settlements.map((settlement, index) => {
                            const paymentKey = `${settlement.from}-${settlement.to}`;
                            const totalPaid = getTotalPaid(paymentKey);
                            const remainingAmount = settlement.amount - totalPaid;
                            const canEditPayment = settlement.from === participant.name || settlement.from === "You";
                            
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
                                
                                {/* Payment History */}
                                {settlement.payments.length > 0 && (
                                  <div className="mb-3">
                                    <div className="flex items-center mb-2">
                                      <History size={12} className="mr-1 text-gray-500" />
                                      <span className="text-xs text-gray-600 font-medium">Payment History</span>
                                    </div>
                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                      {settlement.payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between bg-white p-2 rounded text-xs">
                                          <div>
                                            <span className="text-green-600 font-medium">${payment.amount.toFixed(2)}</span>
                                            {payment.description && (
                                              <span className="text-gray-500 ml-2">- {payment.description}</span>
                                            )}
                                            <div className="text-gray-400">{payment.date}</div>
                                          </div>
                                          {canEditPayment && (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleRemovePayment(paymentKey, payment.id)}
                                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                            >
                                              <X size={12} />
                                            </Button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {totalPaid > 0 && (
                                  <div className="flex items-center justify-between mb-2 text-xs">
                                    <span className="text-green-600 flex items-center">
                                      <Check size={12} className="mr-1" />
                                      Total Paid: ${totalPaid.toFixed(2)}
                                    </span>
                                    <span className="text-red-600">
                                      Remaining: ${remainingAmount.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                
                                {canEditPayment && remainingAmount > 0.01 && (
                                  <div className="mt-2 space-y-2">
                                    <Label htmlFor={`payment-${paymentKey}`} className="text-xs">
                                      Add payment:
                                    </Label>
                                    <div className="space-y-2">
                                      <div className="flex space-x-2">
                                        <div className="relative flex-1">
                                          <DollarSign size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                          <Input
                                            id={`payment-${paymentKey}`}
                                            type="number"
                                            placeholder="0.00"
                                            value={paymentInputs[paymentKey] || ''}
                                            onChange={(e) => setPaymentInputs(prev => ({
                                              ...prev,
                                              [paymentKey]: e.target.value
                                            }))}
                                            className="pl-6 h-8 text-xs"
                                            max={remainingAmount}
                                            step="0.01"
                                          />
                                        </div>
                                        <Button
                                          size="sm"
                                          onClick={() => handlePaymentAdd(paymentKey, paymentInputs[paymentKey] || '0')}
                                          className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
                                        >
                                          Add
                                        </Button>
                                      </div>
                                      <Input
                                        placeholder="Payment description (optional)"
                                        value={paymentDescriptions[paymentKey] || ''}
                                        onChange={(e) => setPaymentDescriptions(prev => ({
                                          ...prev,
                                          [paymentKey]: e.target.value
                                        }))}
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {remainingAmount <= 0.01 && (
                                  <div className="mt-2 text-xs text-green-600 font-medium flex items-center">
                                    <Check size={12} className="mr-1" />
                                    Fully paid!
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {Math.abs(adjustedBalance) < 0.01 
                            ? "All settled up! No payments needed."
                            : "No settlements required at this time."
                          }
                        </p>
                      )}
                      
                      {originalBalance !== 0 && (
                        <div className="pt-2 border-t space-y-1">
                          <p className="text-xs text-gray-500">
                            Original balance: {originalBalance > 0 ? '+' : ''}${originalBalance.toFixed(2)}
                          </p>
                          {Math.abs(originalBalance - adjustedBalance) > 0.01 && (
                            <p className="text-xs text-blue-600">
                              After payments: {adjustedBalance > 0 ? '+' : ''}${adjustedBalance.toFixed(2)}
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
