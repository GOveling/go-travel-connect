import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Vote, Plus } from "lucide-react";
import DecisionCard from "./DecisionCard";

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

interface DecisionsTabProps {
  decisions: Decision[];
  onCreateDecision: () => void;
  onVote: (decisionId: number, option: string) => void;
  onEditDecision: (decision: Decision) => void;
  onDeleteDecision: (decisionId: number) => void;
}

const DecisionsTab = ({
  decisions,
  onCreateDecision,
  onVote,
  onEditDecision,
  onDeleteDecision,
}: DecisionsTabProps) => {
  const activeDecisions = decisions.filter((d) => d.status === "active");

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Group Decisions</h3>
          <p className="text-sm text-gray-600">
            Vote on trip decisions with your group
          </p>
        </div>
        <Button
          onClick={onCreateDecision}
          className="w-full sm:w-auto bg-[#EA6123] hover:bg-[#EA6123]/90"
        >
          <Plus size={16} className="mr-2" />
          Create Decision
        </Button>
      </div>

      <div className="grid gap-4">
        {activeDecisions.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            onVote={onVote}
            onEdit={onEditDecision}
            onDelete={onDeleteDecision}
          />
        ))}

        {activeDecisions.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 text-center">
              <Vote size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Active Decisions
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first group decision to start voting with your trip
                collaborators.
              </p>
              <Button
                onClick={onCreateDecision}
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
  );
};

export default DecisionsTab;
