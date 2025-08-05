import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import ExpensesTab from "./group-options/ExpensesTab";
import DecisionsTab from "./group-options/DecisionsTab";
import CreateDecisionModal from "./group-options/CreateDecisionModal";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseTripExpenses, type TripExpense } from "@/hooks/useSupabaseTripExpenses";
import { useSupabaseTripDecisions, type TripDecision } from "@/hooks/useSupabaseTripDecisions";

interface GroupOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const GroupOptionsModal = ({ isOpen, onClose, trip }: GroupOptionsModalProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("expenses");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState<Omit<TripExpense, "id" | "created_at" | "updated_at" | "created_by">>({
    trip_id: trip?.id || "",
    description: "",
    amount: 0,
    paid_by: [],
    split_between: [],
  });

  // Use Supabase hooks for data management
  const { expenses, loading: expensesLoading, createExpense, updateExpense, deleteExpense } = useSupabaseTripExpenses(trip?.id || "");
  const { decisions, loading: decisionsLoading, createDecision, updateDecision, deleteDecision, vote } = useSupabaseTripDecisions(trip?.id || "");

  // Create decision modal state
  const [isCreateDecisionModalOpen, setIsCreateDecisionModalOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<TripDecision | null>(null);
  const [newDecision, setNewDecision] = useState<Omit<TripDecision, "id" | "created_at" | "updated_at" | "created_by" | "votes">>({
    trip_id: trip?.id || "",
    title: "",
    description: "",
    options: [""],
    end_date: "",
    status: "active",
    selected_participants: [],
  });

  // Get all participants (trip owner + collaborators)
  const allParticipants = [
    {
      id: user?.id || "current-user",
      name: user?.user_metadata?.full_name || "You",
      email: user?.email || "you@example.com",
      avatar: user?.user_metadata?.avatar_url || "",
      role: "owner",
    },
    ...(trip?.collaborators || []).map((collaborator: any) => ({
      id: collaborator.user_id || collaborator.id,
      name: collaborator.name || collaborator.full_name,
      email: collaborator.email,
      avatar: collaborator.avatar || "",
      role: collaborator.role,
    })),
  ];

  // Reset new expense when trip changes
  useEffect(() => {
    if (trip?.id) {
      setNewExpense(prev => ({
        ...prev,
        trip_id: trip.id,
      }));
      setNewDecision(prev => ({
        ...prev,
        trip_id: trip.id,
      }));
    }
  }, [trip?.id]);

  // Show message if no collaborators are available
  if (!trip?.is_group_trip || allParticipants.length <= 1) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Group Options</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              This trip doesn't have any collaborators yet. Add collaborators to
              your trip to use group features like expense splitting and group
              decisions.
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleAddExpense = async () => {
    if (!newExpense.description || newExpense.amount <= 0) return;
    
    try {
      await createExpense(newExpense);
      setNewExpense({
        trip_id: trip?.id || "",
        description: "",
        amount: 0,
        paid_by: [],
        split_between: [],
      });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleEditExpense = (expense: TripExpense) => {
    setEditingExpenseId(expense.id);
    setNewExpense({
      trip_id: expense.trip_id,
      description: expense.description,
      amount: expense.amount,
      paid_by: expense.paid_by,
      split_between: expense.split_between,
    });
  };

  const handleUpdateExpense = async () => {
    if (!editingExpenseId || !newExpense.description || newExpense.amount <= 0) return;

    try {
      await updateExpense(editingExpenseId, newExpense);
      setEditingExpenseId(null);
      setNewExpense({
        trip_id: trip?.id || "",
        description: "",
        amount: 0,
        paid_by: [],
        split_between: [],
      });
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setNewExpense({
      trip_id: trip?.id || "",
      description: "",
      amount: 0,
      paid_by: [],
      split_between: [],
    });
  };

  // Decision management functions
  const handleCreateDecision = () => {
    setEditingDecision(null);
    setNewDecision({
      trip_id: trip?.id || "",
      title: "",
      description: "",
      options: [""],
      end_date: "",
      status: "active",
      selected_participants: [],
    });
    setIsCreateDecisionModalOpen(true);
  };

  const handleEditDecision = (decision: TripDecision) => {
    setEditingDecision(decision);
    setNewDecision({
      trip_id: decision.trip_id,
      title: decision.title,
      description: decision.description || "",
      options: decision.options,
      end_date: decision.end_date || "",
      status: decision.status,
      selected_participants: decision.selected_participants,
    });
    setIsCreateDecisionModalOpen(true);
  };

  const handleUpdateDecision = async (decisionData: Omit<TripDecision, "id" | "created_at" | "updated_at" | "created_by" | "votes">) => {
    try {
      if (editingDecision) {
        // Update existing decision
        await updateDecision(editingDecision.id, decisionData);
      } else {
        // Create new decision
        await createDecision(decisionData);
      }

      setIsCreateDecisionModalOpen(false);
      resetCreateDecisionForm();
    } catch (error) {
      console.error("Error saving decision:", error);
    }
  };

  const handleDeleteDecision = async (decisionId: string) => {
    try {
      await deleteDecision(decisionId);
    } catch (error) {
      console.error("Error deleting decision:", error);
    }
  };

  const handleVote = async (decisionId: string, optionIndex: number) => {
    try {
      await vote(decisionId, optionIndex);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const resetCreateDecisionForm = () => {
    setNewDecision({
      trip_id: trip?.id || "",
      title: "",
      description: "",
      options: [""],
      end_date: "",
      status: "active",
      selected_participants: [],
    });
    setEditingDecision(null);
  };

  const handleCloseCreateDecisionModal = () => {
    setIsCreateDecisionModalOpen(false);
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
        <ModalContent
          className={
            isMobile
              ? "max-h-[95vh]"
              : "max-w-4xl max-h-[95vh] w-[95vw] mx-auto overflow-hidden flex flex-col"
          }
        >
          <ModalHeader className="flex-shrink-0 pb-4">
            <ModalTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <span>Group Options - {trip.name}</span>
            </ModalTitle>
          </ModalHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="expenses">Split Costs</TabsTrigger>
              <TabsTrigger value="decisions">Group Decisions</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="expenses" className="h-full overflow-y-auto">
                <ExpensesTab
                  expenses={expenses}
                  editingExpenseId={editingExpenseId}
                  newExpense={newExpense}
                  setNewExpense={setNewExpense}
                  allParticipants={allParticipants}
                  onAddExpense={handleAddExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onEditExpense={handleEditExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onCancelEdit={handleCancelEdit}
                  loading={expensesLoading}
                />
              </TabsContent>

              <TabsContent value="decisions" className="h-full overflow-y-auto">
                <DecisionsTab
                  decisions={decisions}
                  onCreateDecision={handleCreateDecision}
                  onVote={handleVote}
                  onEditDecision={handleEditDecision}
                  onDeleteDecision={handleDeleteDecision}
                  loading={decisionsLoading}
                />
              </TabsContent>
            </div>
          </Tabs>
        </ModalContent>
      </ModalWrapper>

      <CreateDecisionModal
        isOpen={isCreateDecisionModalOpen}
        onClose={handleCloseCreateDecisionModal}
        onSave={handleUpdateDecision}
        newDecision={newDecision}
        setNewDecision={setNewDecision}
        editingDecision={editingDecision}
        allParticipants={allParticipants}
      />
    </>
  );
};

export default GroupOptionsModal;