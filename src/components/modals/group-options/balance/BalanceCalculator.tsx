
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
    
    if (paidBy.includes(person)) {
      balance += expense.amount / paidBy.length;
    }
    if (expense.splitBetween.includes(person)) {
      balance -= expense.amount / expense.splitBetween.length;
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
  const personBalance = calculatePersonBalance(person, expenses);
  
  if (personBalance < 0) {
    // Person owes money
    const amountOwed = Math.abs(personBalance);
    
    // Find people who are owed money (positive balance)
    const creditors = allParticipants
      .filter(p => p.name !== person)
      .map(p => ({ name: p.name, balance: calculatePersonBalance(p.name, expenses) }))
      .filter(p => p.balance > 0)
      .sort((a, b) => b.balance - a.balance);
    
    let remainingDebt = amountOwed;
    
    creditors.forEach(creditor => {
      if (remainingDebt > 0) {
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
  } else if (personBalance > 0) {
    // Person is owed money
    const amountOwed = personBalance;
    
    // Find people who owe money (negative balance)
    const debtors = allParticipants
      .filter(p => p.name !== person)
      .map(p => ({ name: p.name, balance: calculatePersonBalance(p.name, expenses) }))
      .filter(p => p.balance < 0)
      .sort((a, b) => a.balance - b.balance);
    
    let remainingCredit = amountOwed;
    
    debtors.forEach(debtor => {
      if (remainingCredit > 0) {
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
  
  // Calculate total payments made by this person
  let totalPaid = 0;
  Object.entries(paymentHistory).forEach(([key, payments]) => {
    const [from] = key.split('-');
    if (from === person) {
      totalPaid += payments.reduce((sum, payment) => sum + payment.amount, 0);
    }
  });

  // Calculate total payments received by this person
  let totalReceived = 0;
  Object.entries(paymentHistory).forEach(([key, payments]) => {
    const [, to] = key.split('-');
    if (to === person) {
      totalReceived += payments.reduce((sum, payment) => sum + payment.amount, 0);
    }
  });

  return originalBalance + totalPaid - totalReceived;
};
