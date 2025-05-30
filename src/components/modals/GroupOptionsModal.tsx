import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { DollarSign, Vote } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ExpensesTab from "./group-options/ExpensesTab";
import DecisionsTab from "./group-options/DecisionsTab";
import CreateDecisionModal from "./group-options/CreateDecisionModal";

interface GroupOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: string;
}

interface Decision {
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

interface Collaborator {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const GroupOptionsModal = ({ isOpen, onClose, trip }: GroupOptionsModalProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("expenses");
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editingDecisionId, setEditingDecisionId] = useState<number | null>(null);
  const [showCreateDecisionModal, setShowCreateDecisionModal] = useState(false);
  
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

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitBetween: [] as string[]
  });

  const [newDecision, setNewDecision] = useState({
    title: "",
    description: "",
    options: ["", ""],
    endDate: "",
    selectedParticipants: [] as string[]
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

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount && newExpense.paidBy) {
      if (editingExpenseId) {
        // Update existing expense
        setExpenses(expenses.map(expense => 
          expense.id === editingExpenseId 
            ? {
                ...expense,
                description: newExpense.description,
                amount: parseFloat(newExpense.amount),
                paidBy: newExpense.paidBy,
                splitBetween: newExpense.splitBetween.length > 0 ? newExpense.splitBetween : [newExpense.paidBy]
              }
            : expense
        ));
        setEditingExpenseId(null);
      } else {
        // Add new expense
        const expense: Expense = {
          id: expenses.length + 1,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          paidBy: newExpense.paidBy,
          splitBetween: newExpense.splitBetween.length > 0 ? newExpense.splitBetween : [newExpense.paidBy],
          date: new Date().toISOString().split('T')[0]
        };
        setExpenses([...expenses, expense]);
      }
      setNewExpense({ description: "", amount: "", paidBy: "", splitBetween: [] });
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      paidBy: expense.paidBy,
      splitBetween: expense.splitBetween
    });
    setEditingExpenseId(expense.id);
  };

  const handleDeleteExpense = (expenseId: number) => {
    setExpenses(expenses.filter(expense => expense.id !== expenseId));
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setNewExpense({ description: "", amount: "", paidBy: "", splitBetween: [] });
  };

  const handleCreateDecision = () => {
    if (newDecision.title && 
        newDecision.options.filter(opt => opt.trim()).length >= 2 &&
        newDecision.selectedParticipants.length > 0) {
      const validOptions = newDecision.options.filter(opt => opt.trim());
      const initialVotes: Record<string, number> = {};
      const initialVotersPerOption: Record<string, string[]> = {};
      validOptions.forEach(option => {
        initialVotes[option] = 0;
        initialVotersPerOption[option] = [];
      });
      
      const decision: Decision = {
        id: decisions.length + 1,
        title: newDecision.title,
        description: newDecision.description,
        options: validOptions,
        votes: initialVotes,
        votersPerOption: initialVotersPerOption,
        status: "active",
        endDate: newDecision.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: "You"
      };
      setDecisions([...decisions, decision]);
      setNewDecision({ title: "", description: "", options: ["", ""], endDate: "", selectedParticipants: [] });
      setShowCreateDecisionModal(false);
    }
  };

  const handleEditDecision = (decision: Decision) => {
    setNewDecision({
      title: decision.title,
      description: decision.description || "",
      options: decision.options,
      endDate: decision.endDate,
      selectedParticipants: allParticipants.map(p => p.name) // Default to all participants for existing decisions
    });
    setEditingDecisionId(decision.id);
    setShowCreateDecisionModal(true);
  };

  const handleUpdateDecision = () => {
    if (editingDecisionId && 
        newDecision.title && 
        newDecision.options.filter(opt => opt.trim()).length >= 2 &&
        newDecision.selectedParticipants.length > 0) {
      const validOptions = newDecision.options.filter(opt => opt.trim());
      
      setDecisions(decisions.map(decision => 
        decision.id === editingDecisionId 
          ? {
              ...decision,
              title: newDecision.title,
              description: newDecision.description,
              options: validOptions,
              endDate: newDecision.endDate
            }
          : decision
      ));
      setNewDecision({ title: "", description: "", options: ["", ""], endDate: "", selectedParticipants: [] });
      setEditingDecisionId(null);
      setShowCreateDecisionModal(false);
    }
  };

  const handleDeleteDecision = (decisionId: number) => {
    setDecisions(decisions.filter(decision => decision.id !== decisionId));
  };

  const handleVote = (decisionId: number, option: string) => {
    const currentUser = "You";
    
    setDecisions(decisions.map(decision => {
      if (decision.id === decisionId) {
        const newVotersPerOption = { ...decision.votersPerOption };
        const newVotes = { ...decision.votes };
        
        // Remove user's previous vote if any
        Object.keys(newVotersPerOption).forEach(opt => {
          const index = newVotersPerOption[opt].indexOf(currentUser);
          if (index > -1) {
            newVotersPerOption[opt].splice(index, 1);
            newVotes[opt]--;
          }
        });
        
        // Add new vote
        if (!newVotersPerOption[option].includes(currentUser)) {
          newVotersPerOption[option].push(currentUser);
          newVotes[option]++;
        }
        
        return {
          ...decision,
          votes: newVotes,
          votersPerOption: newVotersPerOption
        };
      }
      return decision;
    }));
  };

  const resetCreateDecisionForm = () => {
    setNewDecision({ title: "", description: "", options: ["", ""], endDate: "", selectedParticipants: [] });
    setEditingDecisionId(null);
  };

  const handleCloseCreateDecisionModal = () => {
    setShowCreateDecisionModal(false);
    resetCreateDecisionForm();
  };

  if (!trip) return null;

  const ModalWrapper = isMobile ? Drawer : Dialog;
  const ModalContent = isMobile ? DrawerContent : DialogContent;
  const ModalHeader = isMobile ? DrawerHeader : DialogHeader;
  const ModalTitle = isMobile ? DrawerTitle : DialogTitle;

  return (
    <>
      <ModalWrapper open={isOpen} onOpenChange={onClose}>
        <ModalContent className={isMobile ? "max-h-[95vh]" : "max-w-4xl max-h-[95vh] w-[95vw] mx-auto overflow-hidden flex flex-col"}>
          <ModalHeader className="flex-shrink-0 pb-4">
            <ModalTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <span>Group Options - {trip.name}</span>
            </ModalTitle>
          </ModalHeader>

          {/* Tab Navigation - Mobile Optimized */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4 md:mb-6 flex-shrink-0">
            <Button
              variant={activeTab === "expenses" ? "default" : "ghost"}
              className={`flex-1 min-h-[48px] text-xs md:text-sm px-2 md:px-4 ${
                activeTab === "expenses" 
                  ? "bg-[#EA6123] text-white hover:bg-[#EA6123] shadow-sm" 
                  : "text-black hover:text-black"
              }`}
              onClick={() => setActiveTab("expenses")}
            >
              <DollarSign size={16} className="mr-1 md:mr-2" />
              <span className="hidden sm:inline">Split Costs</span>
              <span className="sm:hidden">Costs</span>
            </Button>
            <Button
              variant={activeTab === "decisions" ? "default" : "ghost"}
              className={`flex-1 min-h-[48px] text-xs md:text-sm px-2 md:px-4 ${
                activeTab === "decisions" 
                  ? "bg-[#EA6123] text-white hover:bg-[#EA6123] shadow-sm" 
                  : "text-black hover:text-black"
              }`}
              onClick={() => setActiveTab("decisions")}
            >
              <Vote size={16} className="mr-1 md:mr-2" />
              <span className="hidden sm:inline">Group Decisions</span>
              <span className="sm:hidden">Decisions</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "expenses" && (
              <ExpensesTab
                expenses={expenses}
                editingExpenseId={editingExpenseId}
                newExpense={newExpense}
                setNewExpense={setNewExpense}
                allParticipants={allParticipants}
                onAddExpense={handleAddExpense}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
                onCancelEdit={handleCancelEdit}
              />
            )}

            {activeTab === "decisions" && (
              <DecisionsTab
                decisions={decisions}
                onCreateDecision={() => setShowCreateDecisionModal(true)}
                onVote={handleVote}
                onEditDecision={handleEditDecision}
                onDeleteDecision={handleDeleteDecision}
              />
            )}
          </div>
        </ModalContent>
      </ModalWrapper>
      
      <CreateDecisionModal
        isOpen={showCreateDecisionModal}
        onClose={handleCloseCreateDecisionModal}
        editingDecisionId={editingDecisionId}
        newDecision={newDecision}
        setNewDecision={setNewDecision}
        allParticipants={allParticipants}
        onCreateDecision={handleCreateDecision}
        onUpdateDecision={handleUpdateDecision}
      />
    </>
  );
};

export default GroupOptionsModal;
