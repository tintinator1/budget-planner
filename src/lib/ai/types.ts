import type { BudgetPlanResult } from "@/lib/calculator";

export type PlanVerdict = "on_track" | "tight" | "unlikely";

export type PlanAdvice = {
  headline: string;
  verdict: PlanVerdict;
  summary: string;
  win: string;
  actions: string[];
  riskFlags: string[];
  checkInHint: string;
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
