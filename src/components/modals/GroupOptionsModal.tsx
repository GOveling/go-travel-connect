
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, Vote, Edit, X, Plus, Calendar, Users, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

const GroupOptionsModal = ({ isOpen, onClose, trip }: GroupOptionsModalProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("expenses");
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editingDecisionId, setEditingDecisionId] = useState<number | null>(null);
  const [showCreateDecisionModal, setShowCreateDecisionModal] = useState(false);
  const [selectedPersonSettlement, setSelectedPersonSettlement] = useState<string | null>(null);
  
  // Mock data for demonstration
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      description: "Hotel Booking",
      amount: 450,
      paidBy: "Alice Johnson",
      splitBetween: ["Alice Johnson", "Bob Smith", "Carol Davis"],
      date: "2024-12-10"
    },
    {
      id: 2,
      description: "Flight Tickets",
      amount: 850,
      paidBy: "You",
      splitBetween: ["Alice Johnson", "Bob Smith", "You"],
      date: "2024-12-08"
    }
  ]);

  const [decisions, setDecisions] = useState<Decision[]>([
    {
      id: 1,
      title: "Restaurant Choice for Day 1",
      description: "Where should we have dinner on our first day?",
      options: ["Le Bernardin", "Eleven Madison Park", "Per Se"],
      votes: { "Le Bernardin": 2, "Eleven Madison Park": 1, "Per Se": 0 },
      votersPerOption: { 
        "Le Bernardin": ["Alice Johnson", "Bob Smith"], 
        "Eleven Madison Park": ["Carol Davis"], 
        "Per Se": [] 
      },
      status: "active",
      endDate: "2024-12-20",
      createdBy: "Alice Johnson"
    },
    {
      id: 2,
      title: "Activities for Day 2",
      description: "What activities should we do on day 2?",
      options: ["Central Park Walk", "Museum Visit", "Shopping"],
      votes: { "Central Park Walk": 1, "Museum Visit": 2, "Shopping": 0 },
      votersPerOption: { 
        "Central Park Walk": ["Bob Smith"], 
        "Museum Visit": ["Alice Johnson", "Carol Davis"], 
        "Shopping": [] 
      },
      status: "active",
      endDate: "2024-12-21",
      createdBy: "Bob Smith"
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
    endDate: ""
  });

  // Initialize collaborators with mock data if trip doesn't have collaborators
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    trip?.collaborators || [
      {
        id: 1,
        name: "Alice Johnson",
        email: "alice@example.com",
        avatar: "A",
        role: "owner"
      },
      {
        id: 2,
        name: "Bob Smith",
        email: "bob@example.com",
        avatar: "B",
        role: "editor"
      },
      {
        id: 3,
        name: "Carol Davis",
        email: "carol@example.com",
        avatar: "C",
        role: "viewer"
      }
    ]
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
    if (newDecision.title && newDecision.options.filter(opt => opt.trim()).length >= 2) {
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
        createdBy: "You" // In a real app, this would be the current user
      };
      setDecisions([...decisions, decision]);
      setNewDecision({ title: "", description: "", options: ["", ""], endDate: "" });
      setShowCreateDecisionModal(false);
    }
  };

  const handleEditDecision = (decision: Decision) => {
    setNewDecision({
      title: decision.title,
      description: decision.description || "",
      options: decision.options,
      endDate: decision.endDate
    });
    setEditingDecisionId(decision.id);
    setShowCreateDecisionModal(true);
  };

  const handleUpdateDecision = () => {
    if (editingDecisionId && newDecision.title && newDecision.options.filter(opt => opt.trim()).length >= 2) {
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
      setNewDecision({ title: "", description: "", options: ["", ""], endDate: "" });
      setEditingDecisionId(null);
      setShowCreateDecisionModal(false);
    }
  };

  const handleDeleteDecision = (decisionId: number) => {
    setDecisions(decisions.filter(decision => decision.id !== decisionId));
  };

  const handleVote = (decisionId: number, option: string) => {
    const currentUser = "You"; // In a real app, this would be the current user
    
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

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const handleSplitBetweenChange = (participantName: string, checked: boolean) => {
    if (checked) {
      setNewExpense({
        ...newExpense,
        splitBetween: [...newExpense.splitBetween, participantName]
      });
    } else {
      setNewExpense({
        ...newExpense,
        splitBetween: newExpense.splitBetween.filter(name => name !== participantName)
      });
    }
  };

  const resetCreateDecisionForm = () => {
    setNewDecision({ title: "", description: "", options: ["", ""], endDate: "" });
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

  const CreateDecisionModal = () => (
    <Dialog 
      open={showCreateDecisionModal} 
      onOpenChange={(open) => {
        if (!open) {
          handleCloseCreateDecisionModal();
        }
      }}
      modal={true}
    >
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] mx-auto"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking on input fields or other interactive elements
          const target = e.target as Element;
          if (target.closest('input, textarea, select, button')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing when interacting with form elements
          const target = e.target as Element;
          if (target.closest('input, textarea, select, button')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Vote size={20} />
            <span>{editingDecisionId ? "Edit Decision" : "Create New Decision"}</span>
          </DialogTitle>
          <DialogDescription>
            {editingDecisionId ? "Update the decision details below." : "Create a new decision for your group to vote on."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 md:space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="decisionTitle" className="text-sm font-medium">Decision Title *</Label>
              <Input
                id="decisionTitle"
                placeholder="What should we decide on?"
                value={newDecision.title}
                onChange={(e) => {
                  e.stopPropagation();
                  setNewDecision(prev => ({...prev, title: e.target.value}));
                }}
                onFocus={(e) => e.stopPropagation()}
                className="mt-1 h-12 text-base"
              />
            </div>
            
            <div>
              <Label htmlFor="decisionDescription" className="text-sm font-medium">Description (Optional)</Label>
              <Input
                id="decisionDescription"
                placeholder="Add more details about this decision..."
                value={newDecision.description}
                onChange={(e) => {
                  e.stopPropagation();
                  setNewDecision(prev => ({...prev, description: e.target.value}));
                }}
                onFocus={(e) => e.stopPropagation()}
                className="mt-1 h-12 text-base"
              />
            </div>
            
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={newDecision.endDate}
                onChange={(e) => {
                  e.stopPropagation();
                  setNewDecision(prev => ({...prev, endDate: e.target.value}));
                }}
                onFocus={(e) => e.stopPropagation()}
                className="mt-1 h-12 text-base"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div>
            <Label className="flex items-center space-x-2 mb-3 text-sm font-medium">
              <span>Options *</span>
              <span className="text-xs text-gray-500">(Minimum 2 required)</span>
            </Label>
            <div className="space-y-3">
              {newDecision.options.map((option, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newOptions = [...newDecision.options];
                      newOptions[index] = e.target.value;
                      setNewDecision(prev => ({...prev, options: newOptions}));
                    }}
                    onFocus={(e) => e.stopPropagation()}
                    className="flex-1 h-12 text-base"
                  />
                  {newDecision.options.length > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newOptions = newDecision.options.filter((_, i) => i !== index);
                        setNewDecision(prev => ({...prev, options: newOptions}));
                      }}
                      className="h-12 w-full sm:w-12 shrink-0"
                    >
                      <X size={16} />
                      <span className="sm:hidden ml-2">Remove Option</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-10 w-full sm:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                setNewDecision(prev => ({...prev, options: [...prev.options, ""]}));
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Option
            </Button>
          </div>
          
          <div>
            <Label className="flex items-center space-x-2 mb-3 text-sm font-medium">
              <Users size={16} />
              <span>Trip Collaborators</span>
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {allParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg min-h-[60px]">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-sm text-white font-medium shrink-0">
                    {participant.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{participant.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              All trip collaborators will be able to vote on this decision.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 pt-4 border-t">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                editingDecisionId ? handleUpdateDecision() : handleCreateDecision();
              }}
              disabled={!newDecision.title || newDecision.options.filter(opt => opt.trim()).length < 2}
              className="w-full h-12 text-base"
            >
              {editingDecisionId ? "Update Decision" : "Create Decision"}
            </Button>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseCreateDecisionModal();
              }}
              className="w-full h-12 text-base"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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
            {/* Split Costs Tab */}
            {activeTab === "expenses" && (
              <div className="space-y-4 md:space-y-6">
                <Card>
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-base md:text-lg">Trip Expenses</CardTitle>
                    <div className="text-xl md:text-2xl font-bold text-green-600">
                      Total: ${getTotalExpenses().toFixed(2)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Mobile-friendly expenses list */}
                    <div className="block md:hidden space-y-3">
                      {expenses.map((expense) => (
                        <Card key={expense.id} className="border-l-4 border-l-blue-400">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm">{expense.description}</h4>
                                <span className="font-bold text-green-600">${expense.amount.toFixed(2)}</span>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div>Paid by: {expense.paidBy}</div>
                                <div>Split: {expense.splitBetween.join(", ")}</div>
                                <div>Date: {expense.date}</div>
                              </div>
                              <div className="flex space-x-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditExpense(expense)}
                                  className="flex-1 text-xs h-8"
                                >
                                  <Edit size={14} className="mr-1" />
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3"
                                    >
                                      <X size={14} />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="w-[90vw] max-w-md">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-base">Delete Expense</AlertDialogTitle>
                                      <AlertDialogDescription className="text-sm">
                                        Are you sure you want to delete the expense "{expense.description}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                                      <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteExpense(expense.id)}
                                        className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Desktop table view */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-gray-900 font-semibold">Description</TableHead>
                            <TableHead className="text-gray-900 font-semibold">Amount</TableHead>
                            <TableHead className="text-gray-900 font-semibold">Paid By</TableHead>
                            <TableHead className="text-gray-900 font-semibold">Split Between</TableHead>
                            <TableHead className="text-gray-900 font-semibold">Date</TableHead>
                            <TableHead className="text-gray-900 font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expenses.map((expense) => (
                            <TableRow key={expense.id}>
                              <TableCell>{expense.description}</TableCell>
                              <TableCell>${expense.amount.toFixed(2)}</TableCell>
                              <TableCell>{expense.paidBy}</TableCell>
                              <TableCell>{expense.splitBetween.join(", ")}</TableCell>
                              <TableCell>{expense.date}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditExpense(expense)}
                                  >
                                    <Edit size={16} className="mr-1" />
                                    Edit
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X size={16} />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete the expense "{expense.description}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteExpense(expense.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-base md:text-lg">
                      {editingExpenseId ? "Edit Expense" : "Add New Expense"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="desc" className="text-sm">Description</Label>
                        <Input
                          id="desc"
                          placeholder="Dinner, Gas, etc."
                          value={newExpense.description}
                          onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                          className="h-12 text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount" className="text-sm">Amount ($)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                          className="h-12 text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="paidBy" className="text-sm">Paid By</Label>
                        <Select 
                          value={newExpense.paidBy} 
                          onValueChange={(value) => setNewExpense({...newExpense, paidBy: value})}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select who paid" />
                          </SelectTrigger>
                          <SelectContent>
                            {allParticipants.map((participant) => (
                              <SelectItem key={participant.id} value={participant.name}>
                                <div className="flex items-center space-x-2">
                                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-xs text-white">
                                    {participant.avatar}
                                  </div>
                                  <span>{participant.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Split Between</Label>
                        <div className="border rounded-md p-3 space-y-3 max-h-32 overflow-y-auto">
                          {allParticipants.map((participant) => (
                            <div key={participant.id} className="flex items-center space-x-3">
                              <Checkbox
                                id={`split-${participant.id}`}
                                checked={newExpense.splitBetween.includes(participant.name)}
                                onCheckedChange={(checked) => 
                                  handleSplitBetweenChange(participant.name, checked as boolean)
                                }
                                className="h-5 w-5"
                              />
                              <label 
                                htmlFor={`split-${participant.id}`} 
                                className="flex items-center space-x-2 cursor-pointer flex-1 min-h-[44px]"
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-xs text-white">
                                  {participant.avatar}
                                </div>
                                <span className="text-sm">{participant.name}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                        {newExpense.splitBetween.length > 0 && (
                          <p className="text-xs text-gray-600 mt-2">
                            Selected: {newExpense.splitBetween.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                      <Button onClick={handleAddExpense} className="flex-1 h-12">
                        {editingExpenseId ? "Update Expense" : "Add Expense"}
                      </Button>
                      {editingExpenseId && (
                        <Button onClick={handleCancelEdit} variant="outline" className="flex-1 h-12">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

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
              </div>
            )}

            {/* Group Decisions Tab */}
            {activeTab === "decisions" && (
              <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Group Decisions</h3>
                    <p className="text-sm text-gray-600">Vote on trip decisions with your group</p>
                  </div>
                  <Button
                    onClick={() => setShowCreateDecisionModal(true)}
                    className="w-full sm:w-auto bg-[#EA6123] hover:bg-[#EA6123]/90"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Decision
                  </Button>
                </div>

                <div className="grid gap-4">
                  {decisions.filter(d => d.status === 'active').map((decision) => (
                    <Card key={decision.id} className="border-l-4 border-l-blue-400">
                      <CardContent className="p-4 md:p-6">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base md:text-lg mb-1">{decision.title}</h4>
                              {decision.description && (
                                <p className="text-sm text-gray-600 mb-2">{decision.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Calendar size={12} />
                                  <span>Ends: {decision.endDate}</span>
                                </span>
                                <span>By: {decision.createdBy}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditDecision(decision)}
                                className="h-8 px-3"
                              >
                                <Edit size={14} className="sm:mr-1" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3"
                                  >
                                    <X size={14} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="w-[90vw] max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Decision</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the decision "{decision.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                                    <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteDecision(decision.id)}
                                      className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {decision.options.map((option) => {
                              const voteCount = decision.votes[option];
                              const voters = decision.votersPerOption[option] || [];
                              const hasVoted = voters.includes("You");
                              const totalVotes = Object.values(decision.votes).reduce((sum, count) => sum + count, 0);
                              const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                              
                              return (
                                <div key={option} className="space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded space-y-2 sm:space-y-0">
                                    <div className="flex-1">
                                      <span className="text-sm md:text-base font-medium">{option}</span>
                                      {voters.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Voted by: {voters.join(", ")}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                                      <div className="text-center">
                                        <div className="text-sm font-semibold">{voteCount}</div>
                                        <div className="text-xs text-gray-500">votes</div>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant={hasVoted ? "default" : "outline"}
                                        onClick={() => handleVote(decision.id, option)}
                                        className={`h-9 px-4 ${hasVoted ? 'bg-[#EA6123] hover:bg-[#EA6123]/90' : ''}`}
                                      >
                                        {hasVoted ? "Voted" : "Vote"}
                                      </Button>
                                    </div>
                                  </div>
                                  {totalVotes > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-[#EA6123] h-2 rounded-full transition-all duration-300" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {decisions.filter(d => d.status === 'active').length === 0 && (
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="p-8 text-center">
                        <Vote size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Decisions</h3>
                        <p className="text-gray-500 mb-4">Create your first group decision to start voting with your trip collaborators.</p>
                        <Button
                          onClick={() => setShowCreateDecisionModal(true)}
                          className="bg-[#EA6123] hover:bg-[#EA6123]/90"
                        >
                          <Plus size={16} className="mr-2" />
                          Create Decision
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </ModalContent>
      </ModalWrapper>
      
      <CreateDecisionModal />
    </>
  );
};

export default GroupOptionsModal;
