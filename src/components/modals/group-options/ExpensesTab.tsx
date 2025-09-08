import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, X } from "lucide-react";
import ExpenseForm from "./ExpenseForm";
import BalanceSummary from "./BalanceSummary";

interface TripExpense {
  id: string;
  trip_id: string;
  description: string;
  amount: number;
  paid_by: string[];
  split_between: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface ExpensesTabProps {
  expenses: TripExpense[];
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
  onEditExpense: (expense: TripExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onCancelEdit: () => void;
  loading: boolean;
}

const ExpensesTab = ({
  expenses,
  editingExpenseId,
  newExpense,
  setNewExpense,
  allParticipants,
  onAddExpense,
  onUpdateExpense,
  onEditExpense,
  onDeleteExpense,
  onCancelEdit,
  loading,
}: ExpensesTabProps) => {
  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return (
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
                      <h4 className="font-medium text-sm">
                        {expense.description}
                      </h4>
                      <span className="font-bold text-green-600">
                        ${expense.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        Paid by:{" "}
                        {Array.isArray(expense.paid_by)
                          ? expense.paid_by.join(", ")
                          : expense.paid_by}
                      </div>
                      <div>Split: {expense.split_between.join(", ")}</div>
                      <div>
                        Date:{" "}
                        {new Date(expense.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditExpense(expense)}
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
                            <AlertDialogTitle className="text-base">
                              Delete Expense
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Are you sure you want to delete the expense "
                              {expense.description}"? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteExpense(expense.id)}
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
                  <TableHead className="text-gray-900 font-semibold">
                    Description
                  </TableHead>
                  <TableHead className="text-gray-900 font-semibold">
                    Amount
                  </TableHead>
                  <TableHead className="text-gray-900 font-semibold">
                    Paid By
                  </TableHead>
                  <TableHead className="text-gray-900 font-semibold">
                    Split Between
                  </TableHead>
                  <TableHead className="text-gray-900 font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-gray-900 font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {Array.isArray(expense.paid_by)
                        ? expense.paid_by.join(", ")
                        : expense.paid_by}
                    </TableCell>
                    <TableCell>{expense.split_between.join(", ")}</TableCell>
                    <TableCell>
                      {new Date(expense.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditExpense(expense)}
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
                              <AlertDialogTitle>
                                Delete Expense
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the expense "
                                {expense.description}"? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteExpense(expense.id)}
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

      <ExpenseForm
        editingExpenseId={editingExpenseId}
        newExpense={newExpense}
        setNewExpense={setNewExpense}
        allParticipants={allParticipants}
        onAddExpense={onAddExpense}
        onUpdateExpense={onUpdateExpense}
        onCancelEdit={onCancelEdit}
      />

      <BalanceSummary expenses={expenses} allParticipants={allParticipants} />
    </div>
  );
};

export default ExpensesTab;
