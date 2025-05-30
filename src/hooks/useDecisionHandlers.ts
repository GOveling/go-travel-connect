
import { Decision, NewDecision, Collaborator } from "@/types/groupOptions";

export const useDecisionHandlers = (
  decisions: Decision[],
  setDecisions: (decisions: Decision[]) => void,
  newDecision: NewDecision,
  setNewDecision: (decision: NewDecision) => void,
  allParticipants: Collaborator[],
  editingDecisionId: number | null,
  setEditingDecisionId: (id: number | null) => void,
  setShowCreateDecisionModal: (show: boolean) => void
) => {
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

  return {
    handleCreateDecision,
    handleEditDecision,
    handleUpdateDecision,
    handleDeleteDecision,
    handleVote,
    resetCreateDecisionForm,
    handleCloseCreateDecisionModal
  };
};
