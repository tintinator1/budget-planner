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

let cachedRaw: string | null | undefined;
let cachedPlan: StoredPlan | null = null;

export function savePlan(plan: StoredPlan) {
  if (typeof window === "undefined") return;

  const serialized = JSON.stringify(plan);
  sessionStorage.setItem(STORAGE_KEY, serialized);
  cachedRaw = serialized;
  cachedPlan = plan;
}

export function loadPlan(): StoredPlan | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedPlan;

  cachedRaw = raw;
  if (!raw) {
    cachedPlan = null;
    return null;
  }

  try {
    cachedPlan = JSON.parse(raw) as StoredPlan;
  } catch {
    cachedPlan = null;
  }

  return cachedPlan;
}

export function subscribeToPlanStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}
