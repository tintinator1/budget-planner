import type { BudgetPlanInput, TimeframeUnit } from "@/lib/types";

export function isBudgetPlanInput(value: unknown): value is BudgetPlanInput {
  if (!value || typeof value !== "object") return false;

  const input = value as Record<string, unknown>;

  if (typeof input.monthlyIncome !== "number" || input.monthlyIncome <= 0) return false;
  if (typeof input.goalName !== "string" || !input.goalName.trim()) return false;
  if (typeof input.savingsTarget !== "number" || input.savingsTarget <= 0) return false;
  if (typeof input.timeframeValue !== "number" || input.timeframeValue <= 0) return false;
  if (input.timeframeUnit !== "months" && input.timeframeUnit !== "years") return false;

  if (!Array.isArray(input.expenses)) return false;

  for (const expense of input.expenses) {
    if (!expense || typeof expense !== "object") return false;
    const item = expense as Record<string, unknown>;
    if (typeof item.id !== "string") return false;
    if (typeof item.label !== "string" || !item.label.trim()) return false;
    if (typeof item.amount !== "number" || item.amount < 0) return false;
  }

  return true;
}

export function parseBudgetPlanInput(value: unknown): BudgetPlanInput | null {
  if (!isBudgetPlanInput(value)) return null;

  return {
    monthlyIncome: value.monthlyIncome,
    goalName: value.goalName.trim(),
    savingsTarget: value.savingsTarget,
    timeframeValue: value.timeframeValue,
    timeframeUnit: value.timeframeUnit as TimeframeUnit,
    expenses: value.expenses.map((expense) => ({
      id: expense.id,
      label: expense.label.trim(),
      amount: expense.amount,
    })),
  };
}
