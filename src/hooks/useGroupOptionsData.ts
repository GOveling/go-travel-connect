
import { useState } from "react";
import { Expense, Decision, Collaborator, NewExpense, NewDecision } from "@/types/groupOptions";

export const useGroupOptionsData = (trip: any) => {
  // Mock data for demonstration
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      description: "Hotel Booking",
      amount: 450,
      paidBy: "You",
      splitBetween: ["You", "Emma Wilson", "David Brown"],
      date: "2024-12-10"
    },
    {
      id: 2,
      description: "Flight Tickets",
      amount: 850,
      paidBy: "Emma Wilson",
      splitBetween: ["You", "Emma Wilson", "David Brown"],
      date: "2024-12-08"
    }
  ]);

  const [decisions, setDecisions] = useState<Decision[]>([
    {
      id: 1,
      title: "Restaurant Choice for Day 1",
      description: "Where should we have dinner on our first day?",
      options: ["Local Warung", "Beachside Restaurant", "Hotel Restaurant"],
      votes: { "Local Warung": 2, "Beachside Restaurant": 1, "Hotel Restaurant": 0 },
      votersPerOption: { 
        "Local Warung": ["You", "Emma Wilson"], 
        "Beachside Restaurant": ["David Brown"], 
        "Hotel Restaurant": [] 
      },
      status: "active",
      endDate: "2024-12-20",
      createdBy: "You"
    },
    {
      id: 2,
      title: "Activities for Day 2",
      description: "What activities should we do on day 2?",
      options: ["Temple Visit", "Beach Day", "Yoga Session"],
      votes: { "Temple Visit": 1, "Beach Day": 2, "Yoga Session": 0 },
      votersPerOption: { 
        "Temple Visit": ["Emma Wilson"], 
        "Beach Day": ["You", "David Brown"], 
        "Yoga Session": [] 
      },
      status: "active",
      endDate: "2024-12-21",
      createdBy: "Emma Wilson"
    }
  ]);

  const [newExpense, setNewExpense] = useState<NewExpense>({
    description: "",
    amount: "",
    paidBy: "",
    splitBetween: []
  });

  const [newDecision, setNewDecision] = useState<NewDecision>({
    title: "",
    description: "",
    options: ["", ""],
    endDate: "",
    selectedParticipants: []
  });

  // Use actual trip collaborators and convert them to the expected format
  const [collaborators] = useState<Collaborator[]>(
    trip?.collaborators?.map((collab: any, index: number) => ({
      id: index + 1,
      name: collab.name,
      email: collab.email,
      avatar: collab.avatar,
      role: collab.role
    })) || []
  );

  // Add current user to the list of all participants for expenses
  const allParticipants = [
    { id: 0, name: "You", email: "you@example.com", avatar: "Y", role: "owner" },
    ...collaborators
  ];

  return {
    expenses,
    setExpenses,
    decisions,
    setDecisions,
    newExpense,
    setNewExpense,
    newDecision,
    setNewDecision,
    collaborators,
    allParticipants
  };
};
