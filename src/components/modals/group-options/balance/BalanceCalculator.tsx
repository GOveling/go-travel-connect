
interface Expense {
  id: number;
  description: string;
  amount: number;
  paidBy: string[];
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

export const calculatePersonBalance = (person: string, expenses: Expense[]) => {
  let balance = 0;
  
  expenses.forEach(expense => {
    const paidBy = expense.paidBy;
    const splitBetween = expense.splitBetween;
    
    // Amount this person paid
    if (paidBy.includes(person)) {
      balance += expense.amount / paidBy.length;
    }
    
    // Amount this person owes
    if (splitBetween.includes(person)) {
      balance -= expense.amount / splitBetween.length;
    }
  });
  
  return balance;
};

export const calculateSettlements = (
  person: string, 
  expenses: Expense[], 
  allParticipants: Collaborator[], 
  paymentHistory: Record<string, PaymentRecord[]>
): Settlement[] => {
  const settlements: Settlement[] = [];
  
  // Calculate all individual balances
  const balances = new Map<string, number>();
  allParticipants.forEach(participant => {
    balances.set(participant.name, calculatePersonBalance(participant.name, expenses));
  });
  
  const personBalance = balances.get(person) || 0;
  
  if (personBalance < -0.01) {
    // Person owes money - find who they owe to
    const amountOwed = Math.abs(personBalance);
    
    // Find people with positive balances (creditors)
    const creditors = allParticipants
      .filter(p => p.name !== person)
      .map(p => ({ name: p.name, balance: balances.get(p.name) || 0 }))
      .filter(p => p.balance > 0.01)
      .sort((a, b) => b.balance - a.balance);
    
    let remainingDebt = amountOwed;
    
    creditors.forEach(creditor => {
      if (remainingDebt > 0.01) {
        const paymentAmount = Math.min(remainingDebt, creditor.balance);
        
        if (paymentAmount > 0.01) {
          const paymentKey = `${person}-${creditor.name}`;
          const payments = paymentHistory[paymentKey] || [];
          
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
    
  } else if (personBalance > 0.01) {
    // Person is owed money - find who owes them
    const amountOwed = personBalance;
    
    // Find people with negative balances (debtors)
    const debtors = allParticipants
      .filter(p => p.name !== person)
      .map(p => ({ name: p.name, balance: balances.get(p.name) || 0 }))
      .filter(p => p.balance < -0.01)
      .sort((a, b) => a.balance - b.balance);
    
    let remainingCredit = amountOwed;
    
    debtors.forEach(debtor => {
      if (remainingCredit > 0.01) {
        const paymentAmount = Math.min(remainingCredit, Math.abs(debtor.balance));
        
        if (paymentAmount > 0.01) {
          const paymentKey = `${debtor.name}-${person}`;
          const payments = paymentHistory[paymentKey] || [];
          
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

export const getAdjustedBalance = (person: string, expenses: Expense[], paymentHistory: Record<string, PaymentRecord[]>) => {
  const originalBalance = calculatePersonBalance(person, expenses);
  
  // Calculate net effect of payments for this person
  let paymentAdjustment = 0;
  
  Object.entries(paymentHistory).forEach(([key, payments]) => {
    const [from, to] = key.split('-');
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    if (from === person) {
      // This person made payments, so their debt decreases (balance increases)
      paymentAdjustment += totalPayments;
    } else if (to === person) {
      // This person received payments, so their credit decreases (balance decreases)
      paymentAdjustment -= totalPayments;
    }
  });
  
  return originalBalance + paymentAdjustment;
};
