
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Check, DollarSign, History, X } from "lucide-react";
import { Expense, Collaborator } from "@/types";

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
      // Cantidad que esta persona pagó (dividida entre todos los que pagaron)
      if (expense.paidBy.includes(person)) {
        balance += expense.amount / expense.paidBy.length;
      }
      
      // Cantidad que esta persona debe (dividida entre todos los que deben pagar)
      if (expense.splitBetween.includes(person)) {
        balance -= expense.amount / expense.splitBetween.length;
      }
    });
    
    return balance;
  };

  const calculateOptimalSettlements = (): Settlement[] => {
    const settlements: Settlement[] = [];
    
    // Calcular balances de todos los participantes
    const balances = allParticipants.map(participant => ({
      name: participant.name,
      balance: calculatePersonBalance(participant.name)
    }));
    
    // Separar deudores y acreedores
    const debtors = balances.filter(p => p.balance < -0.01).map(p => ({ 
      name: p.name, 
      amount: Math.abs(p.balance) 
    }));
    const creditors = balances.filter(p => p.balance > 0.01).map(p => ({ 
      name: p.name, 
      amount: p.balance 
    }));
    
    // Algoritmo de settlements óptimos
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const settleAmount = Math.min(debtor.amount, creditor.amount);
      
      if (settleAmount > 0.01) {
        const paymentKey = `${debtor.name}-${creditor.name}`;
        const payments = settlementPayments[paymentKey] || [];
        
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: settleAmount,
          payments: payments
        });
      }
      
      // Actualizar cantidades restantes
      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;
      
      // Mover al siguiente si se completó el settlement
      if (debtor.amount <= 0.01) i++;
      if (creditor.amount <= 0.01) j++;
    }
    
    return settlements;
  };

  const getPersonSettlements = (person: string): Settlement[] => {
    const allSettlements = calculateOptimalSettlements();
    return allSettlements.filter(s => s.from === person || s.to === person);
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
    
    // Calcular total de pagos realizados por esta persona
    let totalPaid = 0;
    Object.entries(settlementPayments).forEach(([key, payments]) => {
      const [from] = key.split('-');
      if (from === person) {
        totalPaid += payments.reduce((sum, payment) => sum + payment.amount, 0);
      }
    });

    // Calcular total de pagos recibidos por esta persona
    let totalReceived = 0;
    Object.entries(settlementPayments).forEach(([key, payments]) => {
      const [, to] = key.split('-');
      if (to === person) {
        totalReceived += payments.reduce((sum, payment) => sum + payment.amount, 0);
      }
    });

    // Balance ajustado: balance original + dinero recibido - dinero pagado
    return originalBalance + totalReceived - totalPaid;
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <Card>
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg">Balance Summary</CardTitle>
        <div className="text-sm text-gray-600">
          Total gastado: ${getTotalExpenses().toFixed(2)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {allParticipants.map((participant) => {
            const originalBalance = calculatePersonBalance(participant.name);
            const adjustedBalance = getAdjustedBalance(participant.name);
            const settlements = getPersonSettlements(participant.name);
            
            return (
              <div key={participant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded min-h-[52px]">
                <span className="text-sm md:text-base font-medium">{participant.name}</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`font-medium text-sm md:text-base hover:bg-gray-200 px-3 py-2 h-auto ${
                        Math.abs(adjustedBalance) < 0.01 ? 'text-gray-600 hover:text-gray-700' :
                        adjustedBalance > 0 ? 'text-green-600 hover:text-green-700' : 
                        'text-red-600 hover:text-red-700'
                      }`}
                    >
                      {Math.abs(adjustedBalance) < 0.01 ? 'Balanceado' : 
                       adjustedBalance > 0 ? `+$${adjustedBalance.toFixed(2)}` : 
                       `-$${Math.abs(adjustedBalance).toFixed(2)}`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 bg-white max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base">
                        Detalles de Settlement - {participant.name}
                      </h4>
                      
                      {/* Resumen del balance */}
                      <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Balance original:</span>
                          <span className={originalBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {originalBalance >= 0 ? '+' : ''}${originalBalance.toFixed(2)}
                          </span>
                        </div>
                        {Math.abs(originalBalance - adjustedBalance) > 0.01 && (
                          <div className="flex justify-between text-sm font-medium">
                            <span>Balance actual:</span>
                            <span className={adjustedBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {adjustedBalance >= 0 ? '+' : ''}${adjustedBalance.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {settlements.length > 0 ? (
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm text-gray-700">Settlements Requeridos:</h5>
                          {settlements.map((settlement, index) => {
                            const paymentKey = `${settlement.from}-${settlement.to}`;
                            const totalPaid = getTotalPaid(paymentKey);
                            const remainingAmount = settlement.amount - totalPaid;
                            const canEditPayment = settlement.from === participant.name;
                            
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
                                      <span className="text-xs text-gray-600 font-medium">Historial de Pagos</span>
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
                                      Total Pagado: ${totalPaid.toFixed(2)}
                                    </span>
                                    {remainingAmount > 0.01 && (
                                      <span className="text-red-600">
                                        Pendiente: ${remainingAmount.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {canEditPayment && remainingAmount > 0.01 && (
                                  <div className="mt-2 space-y-2">
                                    <Label htmlFor={`payment-${paymentKey}`} className="text-xs">
                                      Registrar pago:
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
                                          disabled={!paymentInputs[paymentKey] || parseFloat(paymentInputs[paymentKey]) <= 0}
                                        >
                                          Añadir
                                        </Button>
                                      </div>
                                      <Input
                                        placeholder="Descripción del pago (opcional)"
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
                                    ¡Totalmente pagado!
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {Math.abs(adjustedBalance) < 0.01 
                            ? "¡Todo balanceado! No se requieren pagos."
                            : "No se requieren settlements en este momento."
                          }
                        </p>
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
