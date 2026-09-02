"use client";

import type { BudgetPlanResult } from "@/lib/calculator";
import type { PlanAdvice, PlanMode } from "@/lib/ai/types";
import type { BudgetPlanInput, ExpenseItem } from "@/lib/types";

type PlanResultsProps = {
  input: BudgetPlanInput;
  result: BudgetPlanResult;
  planMode: PlanMode;
  advice: PlanAdvice | null;
  adviceError: string;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PlanResults({
  input,
  result,
  planMode,
  advice,
  adviceError,
}: PlanResultsProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Your Plan</h2>

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-muted">Monthly Income</dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatCurrency(input.monthlyIncome)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Monthly Expenses</dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatCurrency(result.totalExpenses)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Goal Name</dt>
          <dd className="mt-1 font-medium text-foreground">{input.goalName}</dd>
        </div>
        <div>
          <dt className="text-muted">Savings Target</dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatCurrency(input.savingsTarget)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Timeframe</dt>
          <dd className="mt-1 font-medium text-foreground">
            {input.timeframeValue} {input.timeframeUnit}
          </dd>
        </div>
      </dl>

      <dl className="mt-6 space-y-4 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-muted">Monthly money after expenses</dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatCurrency(result.surplus)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Monthly required savings</dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatCurrency(result.requiredMonthlySavings)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">
            {result.gap >= 0
              ? "Extra each month after bills and savings"
              : "Still short each month"}
          </dt>
          <dd
            className={`mt-1 font-medium ${result.gap >= 0 ? "text-safe" : "text-danger"}`}
          >
            {formatCurrency(Math.abs(result.gap))}
          </dd>
        </div>
      </dl>

      {planMode === "ai" ? (
        <section className="mt-6 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">BudgetAI</h3>

          {advice ? (
            <div className="mt-4 space-y-4 text-sm">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{advice.headline}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                      advice.verdict === "on_track"
                        ? "bg-safe/15 text-safe"
                        : advice.verdict === "tight"
                          ? "bg-accent/15 text-accent"
                          : "bg-danger/15 text-danger"
                    }`}
                  >
                    {advice.verdict.replace("_", " ")}
                  </span>
                </div>
                <p className="text-foreground">{advice.summary}</p>
                <p className="text-muted">{advice.win}</p>
              </div>

              <div>
                <p className="font-medium text-foreground">Next steps</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground">
                  {advice.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>

              {advice.riskFlags.length > 0 ? (
                <div>
                  <p className="font-medium text-danger">Watch out for</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-danger">
                    {advice.riskFlags.map((flag) => (
                      <li key={flag}>{flag}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <p className="rounded-xl border border-border bg-background px-4 py-3 text-muted">
                {advice.checkInHint}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              {adviceError || "BudgetAI advice unavailable."}
            </p>
          )}
        </section>
      ) : null}
    </article>
  );
}

type PlanExpenseBreakdownProps = {
  expenses: ExpenseItem[];
  totalExpenses: number;
  monthlyIncome: number;
};

export function PlanExpenseBreakdown({
  expenses,
  totalExpenses,
  monthlyIncome,
}: PlanExpenseBreakdownProps) {
  const sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount);

  return (
    <aside className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm lg:sticky lg:top-8 lg:self-start">
      <h2 className="text-lg font-semibold text-foreground">Expense Breakdown</h2>
      <p className="mt-1 text-sm text-muted">
        {formatCurrency(totalExpenses)} total ·{" "}
        {monthlyIncome > 0 ? Math.round((totalExpenses / monthlyIncome) * 100) : 0}% of income
      </p>

      <ul className="mt-5 space-y-3">
        {sortedExpenses.map((expense) => {
          const shareOfTotal =
            totalExpenses > 0 ? Math.round((expense.amount / totalExpenses) * 100) : 0;

          return (
            <li
              key={expense.id}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">{expense.label}</span>
                <span className="shrink-0 font-semibold text-foreground">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{shareOfTotal}% of expenses</p>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
