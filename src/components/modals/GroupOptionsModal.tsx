import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Vote, Edit, X } from "lucide-react";

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
  options: string[];
  votes: Record<string, number>;
  status: string;
  endDate: string;
}

interface Collaborator {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const GroupOptionsModal = ({ isOpen, onClose, trip }: GroupOptionsModalProps) => {
  const [activeTab, setActiveTab] = useState("expenses");
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  
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
      paidBy: "Bob Smith",
      splitBetween: ["Alice Johnson", "Bob Smith"],
      date: "2024-12-08"
    }
  ]);

  const [decisions, setDecisions] = useState<Decision[]>([
    {
      id: 1,
      title: "Restaurant Choice for Day 1",
      options: ["Le Bernardin", "Eleven Madison Park", "Per Se"],
      votes: { "Le Bernardin": 2, "Eleven Madison Park": 1, "Per Se": 0 },
      status: "active",
      endDate: "2024-12-20"
    },
    {
      id: 2,
      title: "Activities for Day 2",
      options: ["Central Park Walk", "Museum Visit", "Shopping"],
      votes: { "Central Park Walk": 1, "Museum Visit": 2, "Shopping": 0 },
      status: "active",
      endDate: "2024-12-21"
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
    options: ["", ""]
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
      validOptions.forEach(option => {
        initialVotes[option] = 0;
      });
      
      const decision: Decision = {
        id: decisions.length + 1,
        title: newDecision.title,
        options: validOptions,
        votes: initialVotes,
        status: "active",
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setDecisions([...decisions, decision]);
      setNewDecision({ title: "", options: ["", ""] });
    }
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

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const handleSplitBetweenChange = (collaboratorName: string, checked: boolean) => {
    if (checked) {
      setNewExpense({
        ...newExpense,
        splitBetween: [...newExpense.splitBetween, collaboratorName]
      });
    } else {
      setNewExpense({
        ...newExpense,
        splitBetween: newExpense.splitBetween.filter(name => name !== collaboratorName)
      });
    }
  };

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] mx-auto overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center space-x-2 text-lg md:text-xl">
            <span>Group Options - {trip.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation - Mobile Optimized */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4 md:mb-6 flex-shrink-0">
          <Button
            variant={activeTab === "expenses" ? "default" : "ghost"}
            className={`flex-1 min-h-[48px] text-xs md:text-sm px-2 md:px-4 ${activeTab === "expenses" ? "bg-white shadow-sm" : ""}`}
            onClick={() => setActiveTab("expenses")}
          >
            <DollarSign size={16} className="mr-1 md:mr-2" />
            <span className="hidden sm:inline">Split Costs</span>
            <span className="sm:hidden">Costs</span>
          </Button>
          <Button
            variant={activeTab === "decisions" ? "default" : "ghost"}
            className={`flex-1 min-h-[48px] text-xs md:text-sm px-2 md:px-4 ${activeTab === "decisions" ? "bg-white shadow-sm" : ""}`}
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
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Paid By</TableHead>
                          <TableHead>Split Between</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
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
                          <SelectValue placeholder="Select collaborator" />
                        </SelectTrigger>
                        <SelectContent>
                          {collaborators.map((collaborator) => (
                            <SelectItem key={collaborator.id} value={collaborator.name}>
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-xs text-white">
                                  {collaborator.avatar}
                                </div>
                                <span>{collaborator.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Split Between</Label>
                      <div className="border rounded-md p-3 space-y-3 max-h-32 overflow-y-auto">
                        {collaborators.map((collaborator) => (
                          <div key={collaborator.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`split-${collaborator.id}`}
                              checked={newExpense.splitBetween.includes(collaborator.name)}
                              onCheckedChange={(checked) => 
                                handleSplitBetweenChange(collaborator.name, checked as boolean)
                              }
                              className="h-5 w-5"
                            />
                            <label 
                              htmlFor={`split-${collaborator.id}`} 
                              className="flex items-center space-x-2 cursor-pointer flex-1 min-h-[44px]"
                            >
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-xs text-white">
                                {collaborator.avatar}
                              </div>
                              <span className="text-sm">{collaborator.name}</span>
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
                    {collaborators.map((collaborator) => {
                      const balance = calculatePersonBalance(collaborator.name);
                      return (
                        <div key={collaborator.id} className="flex justify-between items-center p-3 bg-gray-50 rounded min-h-[52px]">
                          <span className="text-sm md:text-base">{collaborator.name}</span>
                          <span className={`font-medium text-sm md:text-base ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {balance > 0 ? '+' : ''}${balance.toFixed(2)}
                          </span>
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
              <Card>
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Active Decisions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {decisions.filter(d => d.status === 'active').map((decision) => (
                    <div key={decision.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3 text-sm md:text-base">{decision.title}</h4>
                      <div className="space-y-3">
                        {decision.options.map((option) => (
                          <div key={option} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded space-y-2 sm:space-y-0">
                            <span className="text-sm md:text-base">{option}</span>
                            <div className="flex items-center justify-between sm:justify-end space-x-2">
                              <span className="text-xs md:text-sm text-gray-600">{decision.votes[option]} votes</span>
                              <Button size="sm" variant="outline" className="h-9 px-4">Vote</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">Ends: {decision.endDate}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Create New Decision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="decisionTitle" className="text-sm">Decision Title</Label>
                    <Input
                      id="decisionTitle"
                      placeholder="What should we decide on?"
                      value={newDecision.title}
                      onChange={(e) => setNewDecision({...newDecision, title: e.target.value})}
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Options</Label>
                    {newDecision.options.map((option, index) => (
                      <Input
                        key={index}
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newDecision.options];
                          newOptions[index] = e.target.value;
                          setNewDecision({...newDecision, options: newOptions});
                        }}
                        className="mt-2 h-12 text-base"
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-10"
                      onClick={() => setNewDecision({...newDecision, options: [...newDecision.options, ""]})}
                    >
                      Add Option
                    </Button>
                  </div>
                  <Button onClick={handleCreateDecision} className="w-full h-12">
                    Create Decision
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupOptionsModal;
