
export interface Expense {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: string;
}

export interface Decision {
  id: number;
  title: string;
  description?: string;
  options: string[];
  votes: Record<string, number>;
  votersPerOption: Record<string, string[]>;
  status: string;
  endDate: string;
  createdBy: string;
}

export interface Collaborator {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface NewExpense {
  description: string;
  amount: string;
  paidBy: string;
  splitBetween: string[];
}

export interface NewDecision {
  title: string;
  description: string;
  options: string[];
  endDate: string;
  selectedParticipants: string[];
}
