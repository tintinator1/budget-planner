import type { BudgetPlanResult } from "@/lib/calculator";

export type PlanAdvice = {
  summary: string;
  actions: string[];
  riskFlags: string[];
};

export type PlanMode = "calculator" | "ai";

export type PlanCalculatorResponse = {
  result: BudgetPlanResult;
};

export type PlanAdviceResponse = {
  result: BudgetPlanResult;
  advice: PlanAdvice | null;
  adviceError: string | null;
};
