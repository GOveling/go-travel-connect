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

interface Settlement {
  from: string;
  to: string;
  amount: number;
  payments: PaymentRecord[];
}

export const calculatePersonBalance = (person: string, expenses: TripExpense[]) => {
  let balance = 0;

  expenses.forEach((expense) => {
    const paidBy = expense.paid_by;
    const splitBetween = expense.split_between;

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

// Calculate global settlements that are consistent for all users
export const calculateGlobalSettlements = (
  expenses: TripExpense[],
  allParticipants: Collaborator[],
  paymentHistory: Record<string, PaymentRecord[]>
): Settlement[] => {
  const settlements: Settlement[] = [];

  // Calculate all individual balances
  const balances = new Map<string, number>();
  allParticipants.forEach((participant) => {
    balances.set(
      participant.name,
      calculatePersonBalance(participant.name, expenses)
    );
  });

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = allParticipants
    .map((p) => ({ name: p.name, balance: balances.get(p.name) || 0 }))
    .filter((p) => p.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);

  const debtors = allParticipants
    .map((p) => ({
      name: p.name,
      balance: Math.abs(balances.get(p.name) || 0),
    }))
    .filter((p) => (balances.get(p.name) || 0) < -0.01)
    .sort((a, b) => b.balance - a.balance);

  // Create settlements by matching debtors with creditors
  let creditorIndex = 0;
  let debtorIndex = 0;
  let remainingCredit = creditors[creditorIndex]?.balance || 0;
  let remainingDebt = debtors[debtorIndex]?.balance || 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const settlementAmount = Math.min(remainingCredit, remainingDebt);

    if (settlementAmount > 0.01) {
      const paymentKey = `${debtor.name}-${creditor.name}`;
      const payments = paymentHistory[paymentKey] || [];

      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: settlementAmount,
        payments: payments,
      });
    }

    remainingCredit -= settlementAmount;
    remainingDebt -= settlementAmount;

    if (remainingCredit <= 0.01) {
      creditorIndex++;
      remainingCredit = creditors[creditorIndex]?.balance || 0;
    }

    if (remainingDebt <= 0.01) {
      debtorIndex++;
      remainingDebt = debtors[debtorIndex]?.balance || 0;
    }
  }

  return settlements;
};

export const calculateSettlements = (
  person: string,
  expenses: TripExpense[],
  allParticipants: Collaborator[],
  paymentHistory: Record<string, PaymentRecord[]>
): Settlement[] => {
  // Get global settlements and filter for this person
  const globalSettlements = calculateGlobalSettlements(
    expenses,
    allParticipants,
    paymentHistory
  );

  // Return settlements where this person is involved (either as debtor or creditor)
  return globalSettlements.filter(
    (settlement) => settlement.from === person || settlement.to === person
  );
};

export const getAdjustedBalance = (
  person: string,
  expenses: TripExpense[],
  paymentHistory: Record<string, PaymentRecord[]>
) => {
  const originalBalance = calculatePersonBalance(person, expenses);

  // Calculate net effect of payments for this person
  let paymentAdjustment = 0;

  Object.entries(paymentHistory).forEach(([key, payments]) => {
    const [from, to] = key.split("-");
    const totalPayments = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

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
