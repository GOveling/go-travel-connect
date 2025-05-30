
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight } from "lucide-react";

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

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface BalanceSummaryProps {
  expenses: Expense[];
  allParticipants: Collaborator[];
}

const BalanceSummary = ({ expenses, allParticipants }: BalanceSummaryProps) => {
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
          if (paymentAmount > 0.01) { // Avoid tiny amounts
            settlements.push({
              from: person,
              to: creditor.name,
              amount: paymentAmount
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
          if (paymentAmount > 0.01) { // Avoid tiny amounts
            settlements.push({
              from: debtor.name,
              to: person,
              amount: paymentAmount
            });
            remainingCredit -= paymentAmount;
          }
        }
      });
    }
    
    return settlements;
  };

  return (
    <Card>
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg">Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {allParticipants.map((participant) => {
            const balance = calculatePersonBalance(participant.name);
            const settlements = calculateSettlements(participant.name);
            
            return (
              <div key={participant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded min-h-[52px]">
                <span className="text-sm md:text-base">{participant.name}</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`font-medium text-sm md:text-base hover:bg-gray-200 px-2 py-1 h-auto ${
                        balance > 0 ? 'text-green-600 hover:text-green-700' : 
                        balance < 0 ? 'text-red-600 hover:text-red-700' : 
                        'text-gray-600 hover:text-gray-700'
                      }`}
                      disabled={Math.abs(balance) < 0.01}
                    >
                      {balance > 0 ? '+' : ''}${balance.toFixed(2)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-white">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-base">
                        Settlement Details for {participant.name}
                      </h4>
                      
                      {settlements.length > 0 ? (
                        <div className="space-y-2">
                          {settlements.map((settlement, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{settlement.from}</span>
                                <ArrowRight size={14} className="text-gray-500" />
                                <span className="font-medium">{settlement.to}</span>
                              </div>
                              <span className="font-semibold text-[#EA6123]">
                                ${settlement.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {Math.abs(balance) < 0.01 
                            ? "All settled up! No payments needed."
                            : "No settlements required at this time."
                          }
                        </p>
                      )}
                      
                      {balance !== 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500">
                            {balance > 0 
                              ? `${participant.name} is owed $${balance.toFixed(2)} total`
                              : `${participant.name} owes $${Math.abs(balance).toFixed(2)} total`
                            }
                          </p>
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
