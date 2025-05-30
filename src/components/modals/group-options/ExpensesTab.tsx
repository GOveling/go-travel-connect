
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Plus } from "lucide-react";
import ExpenseForm from "./ExpenseForm";
import BalanceSummary from "./BalanceSummary";
import { Expense, Collaborator, NewExpense } from "@/types/groupOptions";

interface ExpensesTabProps {
  expenses: Expense[];
  editingExpenseId: number | null;
  newExpense: NewExpense;
  setNewExpense: (expense: any) => void;
  allParticipants: Collaborator[];
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: number) => void;
  onCancelEdit: () => void;
}

const ExpensesTab = ({
  expenses,
  editingExpenseId,
  newExpense,
  setNewExpense,
  allParticipants,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onCancelEdit
}: ExpensesTabProps) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddExpense = () => {
    onAddExpense();
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    onCancelEdit();
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Split Costs</h3>
          <p className="text-sm text-gray-600">Track and split expenses with your group</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto bg-[#EA6123] hover:bg-[#EA6123]/90"
        >
          <Plus size={16} className="mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Balance Summary */}
      <BalanceSummary expenses={expenses} allParticipants={allParticipants} />

      {/* Add/Edit Expense Form */}
      {(showAddForm || editingExpenseId) && (
        <ExpenseForm
          editingExpenseId={editingExpenseId}
          newExpense={newExpense}
          setNewExpense={setNewExpense}
          allParticipants={allParticipants}
          onAddExpense={handleAddExpense}
          onCancelEdit={handleCancelEdit}
        />
      )}

      {/* Expenses List */}
      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Card key={expense.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base">{expense.description}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Paid by {expense.paidBy} • Split between {expense.splitBetween.length} people
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{expense.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-lg text-[#EA6123]">${expense.amount}</p>
                    <p className="text-xs text-gray-500">
                      ${(expense.amount / expense.splitBetween.length).toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditExpense(expense)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {expenses.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 text-center">
              <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Expenses Yet</h3>
              <p className="text-gray-500 mb-4">Start tracking your group expenses to see who owes what.</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-[#EA6123] hover:bg-[#EA6123]/90"
              >
                <Plus size={16} className="mr-2" />
                Add First Expense
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExpensesTab;
