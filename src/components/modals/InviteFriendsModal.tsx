import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Share2, DollarSign, Vote, Calendar, MapPin, Send, Copy, Check, Edit } from "lucide-react";

interface InviteFriendsModalProps {
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

const InviteFriendsModal = ({ isOpen, onClose, trip }: InviteFriendsModalProps) => {
  const [activeTab, setActiveTab] = useState("invite");
  const [inviteEmail, setInviteEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
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

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      console.log(`Inviting ${inviteEmail} to trip: ${trip?.name}`);
      setInviteEmail("");
      // Here you would typically send an invitation
    }
  };

  const handleCopyLink = () => {
    const shareLink = `https://yourapp.com/trips/${trip?.id}/join`;
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="text-blue-600" size={24} />
            <span>Manage Trip Collaboration - {trip.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          {[
            { id: "invite", label: "Invite Friends", icon: Users },
            { id: "share", label: "Share Itinerary", icon: Share2 },
            { id: "expenses", label: "Split Costs", icon: DollarSign },
            { id: "decisions", label: "Group Decisions", icon: Vote }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`flex-1 ${activeTab === tab.id ? "bg-white shadow-sm" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Invite Friends Tab */}
        {activeTab === "invite" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invite by Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Friend's Email</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="email"
                      type="email"
                      placeholder="friend@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleInvite}>
                      <Send size={16} className="mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Trip Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    value={`https://yourapp.com/trips/${trip.id}/join`}
                    readOnly
                    className="flex-1 bg-gray-50"
                  />
                  <Button onClick={handleCopyLink} variant="outline">
                    {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                    {linkCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Anyone with this link can join your trip as a collaborator.
                </p>
              </CardContent>
            </Card>

            {/* Current Collaborators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Collaborators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trip.collaborators?.map((collaborator: any) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                          {collaborator.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{collaborator.name}</p>
                          <p className="text-sm text-gray-600">{collaborator.email}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {collaborator.role}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Share Itinerary Tab */}
        {activeTab === "share" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trip Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray-600" />
                    <span className="text-sm">{trip.destination}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-600" />
                    <span className="text-sm">{trip.dates}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-600" />
                    <span className="text-sm">{trip.travelers} travelers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-gray-600" />
                    <span className="text-sm">{trip.budget}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{trip.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="message">Custom Message (Optional)</Label>
                  <textarea
                    id="message"
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={3}
                    placeholder="Add a personal message to share with your itinerary..."
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1">
                    <Share2 size={16} className="mr-2" />
                    Share via Email
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Copy size={16} className="mr-2" />
                    Copy Itinerary Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Split Costs Tab */}
        {activeTab === "expenses" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trip Expenses</CardTitle>
                <div className="text-2xl font-bold text-green-600">
                  Total: ${getTotalExpenses().toFixed(2)}
                </div>
              </CardHeader>
              <CardContent>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingExpenseId ? "Edit Expense" : "Add New Expense"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="desc">Description</Label>
                    <Input
                      id="desc"
                      placeholder="Dinner, Gas, etc."
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paidBy">Paid By</Label>
                    <Select 
                      value={newExpense.paidBy} 
                      onValueChange={(value) => setNewExpense({...newExpense, paidBy: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collaborator" />
                      </SelectTrigger>
                      <SelectContent>
                        {trip.collaborators?.map((collaborator: any) => (
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
                    <Label>Split Between</Label>
                    <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
                      {trip.collaborators?.map((collaborator: any) => (
                        <div key={collaborator.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`split-${collaborator.id}`}
                            checked={newExpense.splitBetween.includes(collaborator.name)}
                            onCheckedChange={(checked) => 
                              handleSplitBetweenChange(collaborator.name, checked as boolean)
                            }
                          />
                          <label 
                            htmlFor={`split-${collaborator.id}`} 
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-xs text-white">
                              {collaborator.avatar}
                            </div>
                            <span className="text-sm">{collaborator.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    {newExpense.splitBetween.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Selected: {newExpense.splitBetween.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddExpense} className="flex-1">
                    {editingExpenseId ? "Update Expense" : "Add Expense"}
                  </Button>
                  {editingExpenseId && (
                    <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Balance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trip.collaborators?.map((collaborator: any) => {
                    const balance = calculatePersonBalance(collaborator.name);
                    return (
                      <div key={collaborator.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{collaborator.name}</span>
                        <span className={`font-medium ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Decisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {decisions.filter(d => d.status === 'active').map((decision) => (
                  <div key={decision.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{decision.title}</h4>
                    <div className="space-y-2">
                      {decision.options.map((option) => (
                        <div key={option} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{option}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{decision.votes[option]} votes</span>
                            <Button size="sm" variant="outline">Vote</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Ends: {decision.endDate}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create New Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="decisionTitle">Decision Title</Label>
                  <Input
                    id="decisionTitle"
                    placeholder="What should we decide on?"
                    value={newDecision.title}
                    onChange={(e) => setNewDecision({...newDecision, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Options</Label>
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
                      className="mt-2"
                    />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setNewDecision({...newDecision, options: [...newDecision.options, ""]})}
                  >
                    Add Option
                  </Button>
                </div>
                <Button onClick={handleCreateDecision} className="w-full">
                  Create Decision
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendsModal;
