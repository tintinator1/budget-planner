"use client";

import type { BudgetPlanResult } from "@/lib/calculator";
import type { PlanAdvice, PlanMode } from "@/lib/ai/types";
import type { BudgetPlanInput } from "@/lib/types";

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
      <h2 className="text-lg font-semibold text-foreground">Your plan</h2>

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
          <dt className="text-muted">Monthly Money After Expenses</dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatCurrency(result.surplus)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Monthly Required Savings</dt>
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
              <p className="text-foreground">{advice.summary}</p>

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
