import type { BudgetPlanResult } from "@/lib/calculator";

export type PlanAdvice = {
  summary: string;
  actions: string[];
  riskFlags: string[];
};

export type PlanApiResponse = {
  result: BudgetPlanResult;
  advice: PlanAdvice | null;
  adviceError: string | null;
};
