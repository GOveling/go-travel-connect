import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Users } from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface ExpenseFormProps {
  editingExpenseId: string | null;
  newExpense: {
    trip_id: string;
    description: string;
    amount: number;
    paid_by: string[];
    split_between: string[];
  };
  setNewExpense: (expense: any) => void;
  allParticipants: Collaborator[];
  onAddExpense: () => void;
  onUpdateExpense: () => void;
  onCancelEdit: () => void;
}

const ExpenseForm = ({
  editingExpenseId,
  newExpense,
  setNewExpense,
  allParticipants,
  onAddExpense,
  onUpdateExpense,
  onCancelEdit,
}: ExpenseFormProps) => {
  const handleSplitBetweenChange = (
    participantName: string,
    checked: boolean
  ) => {
    if (checked) {
      setNewExpense({
        ...newExpense,
        split_between: [...newExpense.split_between, participantName],
      });
    } else {
      setNewExpense({
        ...newExpense,
        split_between: newExpense.split_between.filter(
          (name) => name !== participantName
        ),
      });
    }
  };

  const handlePaidByChange = (participantName: string, checked: boolean) => {
    if (checked) {
      setNewExpense({
        ...newExpense,
        paid_by: [...newExpense.paid_by, participantName],
      });
    } else {
      setNewExpense({
        ...newExpense,
        paid_by: newExpense.paid_by.filter((name) => name !== participantName),
      });
    }
  };

  const handleSelectAllPaidBy = () => {
    const allSelected = newExpense.paid_by.length === allParticipants.length;
    setNewExpense({
      ...newExpense,
      paid_by: allSelected ? [] : allParticipants.map((p) => p.name),
    });
  };

  const handleSelectAllSplitBetween = () => {
    const allSelected =
      newExpense.split_between.length === allParticipants.length;
    setNewExpense({
      ...newExpense,
      split_between: allSelected ? [] : allParticipants.map((p) => p.name),
    });
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
            <Label htmlFor="desc" className="text-sm">
              Description
            </Label>
            <Input
              id="desc"
              placeholder="Dinner, Gas, etc."
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="h-12 text-base"
            />
          </div>
          <div>
            <Label htmlFor="amount" className="text-sm">
              Amount ($)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={newExpense.amount.toString()}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })
              }
              className="h-12 text-base"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Paid By</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllPaidBy}
                className="h-7 px-2 text-xs"
              >
                <Users size={12} className="mr-1" />
                {newExpense.paid_by.length === allParticipants.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="border rounded-md p-3 space-y-3 max-h-32 overflow-y-auto">
              {allParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-3"
                >
                  <Checkbox
                    id={`paid-${participant.id}`}
                    checked={newExpense.paid_by.includes(participant.name)}
                    onCheckedChange={(checked) =>
                      handlePaidByChange(participant.name, checked as boolean)
                    }
                    className="h-5 w-5"
                  />
                  <label
                    htmlFor={`paid-${participant.id}`}
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
            {newExpense.paid_by.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                Selected: {newExpense.paid_by.join(", ")}
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Split Between</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllSplitBetween}
                className="h-7 px-2 text-xs"
              >
                <Users size={12} className="mr-1" />
                {newExpense.split_between.length === allParticipants.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="border rounded-md p-3 space-y-3 max-h-32 overflow-y-auto">
              {allParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-3"
                >
                  <Checkbox
                    id={`split-${participant.id}`}
                    checked={newExpense.split_between.includes(participant.name)}
                    onCheckedChange={(checked) =>
                      handleSplitBetweenChange(
                        participant.name,
                        checked as boolean
                      )
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
            {newExpense.split_between.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                Selected: {newExpense.split_between.join(", ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <Button 
            onClick={editingExpenseId ? onUpdateExpense : onAddExpense} 
            className="flex-1 h-12"
          >
            {editingExpenseId ? "Update Expense" : "Add Expense"}
          </Button>
          {editingExpenseId && (
            <Button
              onClick={onCancelEdit}
              variant="outline"
              className="flex-1 h-12"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;
