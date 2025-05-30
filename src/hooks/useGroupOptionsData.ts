
import { useState } from "react";
import { Expense, Decision, Collaborator, NewExpense, NewDecision } from "@/types/groupOptions";

export const useGroupOptionsData = (trip: any) => {
  // Convert trip collaborators to the expected format and include current user
  const [collaborators] = useState<Collaborator[]>(() => {
    const tripCollaborators = trip?.collaborators?.map((collab: any, index: number) => ({
      id: index + 2, // Start from 2 since "You" will be id 1
      name: collab.name,
      email: collab.email,
      avatar: collab.avatar,
      role: collab.role
    })) || [];

    return tripCollaborators;
  });

  // Add current user to the list of all participants for expenses
  const allParticipants = [
    { id: 1, name: "You", email: "you@example.com", avatar: "Y", role: "owner" },
    ...collaborators
  ];

  // Get all participant names for easier reference
  const participantNames = allParticipants.map(p => p.name);

  // Mock data using actual collaborator names
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (participantNames.length < 2) {
      return []; // No expenses if no collaborators
    }

    return [
      {
        id: 1,
        description: "Hotel Booking",
        amount: 450,
        paidBy: "You",
        splitBetween: participantNames.slice(0, Math.min(3, participantNames.length)),
        date: "2024-12-10"
      },
      {
        id: 2,
        description: "Flight Tickets",
        amount: 850,
        paidBy: participantNames[1] || "You", // Use second participant or fallback to "You"
        splitBetween: participantNames.slice(0, Math.min(3, participantNames.length)),
        date: "2024-12-08"
      }
    ];
  });

  const [decisions, setDecisions] = useState<Decision[]>(() => {
    if (participantNames.length < 2) {
      return []; // No decisions if no collaborators
    }

    return [
      {
        id: 1,
        title: "Restaurant Choice for Day 1",
        description: "Where should we have dinner on our first day?",
        options: ["Local Warung", "Beachside Restaurant", "Hotel Restaurant"],
        votes: { "Local Warung": 2, "Beachside Restaurant": 1, "Hotel Restaurant": 0 },
        votersPerOption: { 
          "Local Warung": ["You", participantNames[1] || "You"], 
          "Beachside Restaurant": [participantNames[2] || participantNames[1] || "You"], 
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
          "Temple Visit": [participantNames[1] || "You"], 
          "Beach Day": ["You", participantNames[2] || participantNames[1] || "You"], 
          "Yoga Session": [] 
        },
        status: "active",
        endDate: "2024-12-21",
        createdBy: participantNames[1] || "You"
      }
    ];
  });

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
