
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Expense {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
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

interface ExpenseFormProps {
  editingExpenseId: number | null;
  newExpense: {
    description: string;
    amount: string;
    paidBy: string;
    splitBetween: string[];
  };
  setNewExpense: (expense: any) => void;
  allParticipants: Collaborator[];
  onAddExpense: () => void;
  onCancelEdit: () => void;
}

const ExpenseForm = ({
  editingExpenseId,
  newExpense,
  setNewExpense,
  allParticipants,
  onAddExpense,
  onCancelEdit
}: ExpenseFormProps) => {
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

  return (
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
          <Button onClick={onAddExpense} className="flex-1 h-12">
            {editingExpenseId ? "Update Expense" : "Add Expense"}
          </Button>
          {editingExpenseId && (
            <Button onClick={onCancelEdit} variant="outline" className="flex-1 h-12">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;
