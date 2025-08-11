import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Calendar, Edit, X } from "lucide-react";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";

interface TripDecision {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  options: string[];
  status: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  selected_participants: string[];
  votes?: any[];
}

interface DecisionCardProps {
  decision: TripDecision;
  onVote: (decisionId: string, optionIndex: number) => void;
  onEdit: (decision: TripDecision) => void;
  onDelete: (decisionId: string) => void;
}

const DecisionCard = ({
  decision,
  onVote,
  onEdit,
  onDelete,
}: DecisionCardProps) => {
  const { creatorProfile } = useCreatorProfile(decision.created_by, decision.trip_id);
  
  // Calculate votes from the votes array
  const votesByOption = decision.votes?.reduce((acc: Record<string, number>, vote: any) => {
    acc[vote.option_index] = (acc[vote.option_index] || 0) + 1;
    return acc;
  }, {}) || {};
  
  const totalVotes = decision.votes?.length || 0;

  return (
    <Card className="border-l-4 border-l-blue-400">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-base md:text-lg mb-1">
                {decision.title}
              </h4>
              {decision.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {decision.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>Ends: {decision.end_date ? new Date(decision.end_date).toLocaleDateString() : 'No end date'}</span>
                </span>
                <span>By: {creatorProfile?.full_name || creatorProfile?.email || "Unknown User"}</span>
              </div>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(decision)}
                className="h-8 px-3"
              >
                <Edit size={14} className="sm:mr-1" />
                <span className="hidden sm:inline">Edit</span>
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
                    <AlertDialogTitle>Delete Decision</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the decision "
                      {decision.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(decision.id)}
                      className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="space-y-3">
            {decision.options.map((option, index) => {
              const voteCount = votesByOption[index] || 0;
              const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
              
              // Check if current user has voted for this option
              const hasVoted = decision.votes?.some((vote: any) => 
                vote.option_index === index && vote.user_id === 'current-user' // Replace with actual user ID
              ) || false;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <span className="text-sm md:text-base font-medium">
                        {option}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                      <div className="text-center">
                        <div className="text-sm font-semibold">{voteCount}</div>
                        <div className="text-xs text-gray-500">votes</div>
                      </div>
                      <Button
                        size="sm"
                        variant={hasVoted ? "default" : "outline"}
                        onClick={() => onVote(decision.id, index)}
                        className={`h-9 px-4 ${hasVoted ? "bg-[#EA6123] hover:bg-[#EA6123]/90" : ""}`}
                      >
                        {hasVoted ? "Voted" : "Vote"}
                      </Button>
                    </div>
                  </div>
                  {totalVotes > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#EA6123] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DecisionCard;
