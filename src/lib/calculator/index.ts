import type { BudgetPlanInput } from "@/lib/types";
import { totalMonthlyExpenses, timeframeInMonths } from "@/lib/types";


export type BudgetPlanResult = {
  totalExpenses: number;
  months: number;
  surplus: number;
  requiredMonthlySavings: number;
  gap: number;
  income: number;
};

export function calculatePlan(input: BudgetPlanInput): BudgetPlanResult {
  const income = input.monthlyIncome;
  const totalExpenses = totalMonthlyExpenses(input.expenses);
  const months = timeframeInMonths(input);
  const surplus = input.monthlyIncome - totalExpenses;
  const requiredMonthlySavings = input.savingsTarget / months;
  const gap = surplus - requiredMonthlySavings;

  return { income, totalExpenses, months, surplus, requiredMonthlySavings, gap };
}
