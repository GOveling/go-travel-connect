
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGroupOptionsData } from "@/hooks/useGroupOptionsData";
import { useExpenseHandlers } from "@/hooks/useExpenseHandlers";
import { useDecisionHandlers } from "@/hooks/useDecisionHandlers";
import ExpensesTab from "./group-options/ExpensesTab";
import DecisionsTab from "./group-options/DecisionsTab";
import CreateDecisionModal from "./group-options/CreateDecisionModal";
import GroupOptionsTabNavigation from "./group-options/GroupOptionsTabNavigation";

interface GroupOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
}

const GroupOptionsModal = ({ isOpen, onClose, trip }: GroupOptionsModalProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("expenses");
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editingDecisionId, setEditingDecisionId] = useState<number | null>(null);
  const [showCreateDecisionModal, setShowCreateDecisionModal] = useState(false);

  const {
    expenses,
    setExpenses,
    decisions,
    setDecisions,
    newExpense,
    setNewExpense,
    newDecision,
    setNewDecision,
    allParticipants
  } = useGroupOptionsData(trip);

  const {
    handleAddExpense,
    handleEditExpense,
    handleDeleteExpense,
    handleCancelEdit
  } = useExpenseHandlers(
    expenses,
    setExpenses,
    newExpense,
    setNewExpense,
    editingExpenseId,
    setEditingExpenseId
  );

  const {
    handleCreateDecision,
    handleEditDecision,
    handleUpdateDecision,
    handleDeleteDecision,
    handleVote,
    handleCloseCreateDecisionModal
  } = useDecisionHandlers(
    decisions,
    setDecisions,
    newDecision,
    setNewDecision,
    allParticipants,
    editingDecisionId,
    setEditingDecisionId,
    setShowCreateDecisionModal
  );

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

          <GroupOptionsTabNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

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
