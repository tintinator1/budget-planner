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

export type StoredFormDraft = {
  input: BudgetPlanInput;
  planMode: PlanMode;
};

const PLAN_STORAGE_EVENT = "budget-plan-storage-change";

let cachedRaw: string | null | undefined;
let cachedPlan: StoredPlan | null = null;
let cachedFormDraft: StoredFormDraft | null = null;

function syncFormDraftCache(plan: StoredPlan | null) {
  if (!plan) {
    cachedFormDraft = null;
    return;
  }

  if (
    cachedFormDraft &&
    cachedFormDraft.input === plan.input &&
    cachedFormDraft.planMode === plan.planMode
  ) {
    return;
  }

  cachedFormDraft = { input: plan.input, planMode: plan.planMode };
}

function notifyPlanStorageChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PLAN_STORAGE_EVENT));
}

export function savePlan(plan: StoredPlan) {
  if (typeof window === "undefined") return;

  const serialized = JSON.stringify(plan);
  sessionStorage.setItem(STORAGE_KEY, serialized);
  cachedRaw = serialized;
  cachedPlan = plan;
  syncFormDraftCache(plan);
  notifyPlanStorageChange();
}

export function loadPlan(): StoredPlan | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedPlan;

  cachedRaw = raw;
  if (!raw) {
    cachedPlan = null;
    syncFormDraftCache(null);
    return null;
  }

  try {
    cachedPlan = JSON.parse(raw) as StoredPlan;
  } catch {
    cachedPlan = null;
  }

  syncFormDraftCache(cachedPlan);
  return cachedPlan;
}

export function loadFormDraft(): StoredFormDraft | null {
  loadPlan();
  return cachedFormDraft;
}

export function subscribeToPlanStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PLAN_STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PLAN_STORAGE_EVENT, onStoreChange);
  };
}
