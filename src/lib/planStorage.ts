import type { BudgetPlanResult } from "@/lib/calculator";
import type { PlanAdvice, PlanMode } from "@/lib/ai/types";
import type { BudgetPlanInput } from "@/lib/types";

const STORAGE_KEY = "budget-plan";

export type StoredPlan = {
  input: BudgetPlanInput;
  result: BudgetPlanResult;
  planMode: PlanMode;
  advice: PlanAdvice | null;
  adviceError: string;
};

export function savePlan(plan: StoredPlan) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function loadPlan(): StoredPlan | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredPlan;
  } catch {
    return null;
  }
}
