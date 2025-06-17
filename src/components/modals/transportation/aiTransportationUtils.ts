
import { Trip } from "@/types";
import { generateAITransportationPlan } from "./aiPlanningCore";
import { formatTransportationSummary, getTransportationBudgetEstimate } from "./planningUtils";

// Main export function
export const getAITransportationPlan = generateAITransportationPlan;

// Export utility functions
export { formatTransportationSummary, getTransportationBudgetEstimate };

// Re-export types for backwards compatibility
export type { AITransportationPlan, TransportationRecommendation } from "./types";
