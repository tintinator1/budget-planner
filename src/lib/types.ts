export type ExpenseItem = {
  id: string;
  label: string;
  amount: number;
};

export type TimeframeUnit = "months" | "years";

export type BudgetPlanInput = {
  monthlyIncome: number;
  expenses: ExpenseItem[];
  goalName: string;
  savingsTarget: number;
  timeframeValue: number;
  timeframeUnit: TimeframeUnit;
};

export type BudgetPlanFormState = {
  monthlyIncome: string;
  goalName: string;
  savingsTarget: string;
  timeframeValue: string;
  timeframeUnit: TimeframeUnit;
};

export type ExpenseFormItem = {
  id: string;
  label: string;
  amount: string;
};

export function toBudgetPlanInput(
  form: BudgetPlanFormState,
  expenses: ExpenseFormItem[],
): BudgetPlanInput | null {
  const monthlyIncome = Number(form.monthlyIncome);
  const savingsTarget = Number(form.savingsTarget);
  const timeframeValue = Number(form.timeframeValue);

  if (
    !form.goalName.trim() ||
    Number.isNaN(monthlyIncome) ||
    monthlyIncome <= 0 ||
    Number.isNaN(savingsTarget) ||
    savingsTarget <= 0 ||
    Number.isNaN(timeframeValue) ||
    timeframeValue <= 0
  ) {
    return null;
  }

  const parsedExpenses: ExpenseItem[] = [];

  for (const expense of expenses) {
    const amount = Number(expense.amount);
    if (!expense.label.trim() || Number.isNaN(amount) || amount < 0) {
      return null;
    }
    parsedExpenses.push({
      id: expense.id,
      label: expense.label.trim(),
      amount,
    });
  }

  return {
    monthlyIncome,
    expenses: parsedExpenses,
    goalName: form.goalName.trim(),
    savingsTarget,
    timeframeValue,
    timeframeUnit: form.timeframeUnit,
  };
}

export function totalMonthlyExpenses(expenses: ExpenseItem[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function timeframeInMonths(input: BudgetPlanInput): number {
  return input.timeframeUnit === "years"
    ? input.timeframeValue * 12
    : input.timeframeValue;
}
