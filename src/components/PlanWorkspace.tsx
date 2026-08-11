"use client";

import { useState } from "react";
import { BudgetForm } from "@/components/BudgetForm";
import { Header } from "@/components/Header";
import { calculatePlan } from "@/lib/calculator";
import type { BudgetPlanInput } from "@/lib/types";
import type { BudgetPlanResult } from "@/lib/calculator";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PlanWorkspace() {
  const [submittedInput, setSubmittedInput] = useState<BudgetPlanInput | null>(null);
  const [result, setResult] = useState<BudgetPlanResult | null>(null);

  function handleSubmit(input: BudgetPlanInput) {
    setSubmittedInput(input);
    setResult(calculatePlan(input));
  }

  return (
    <div className="min-h-full bg-background">
      <Header />

      <main className="mx-auto grid max-w-3xl gap-8 px-6 py-8 lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_340px]">
        <BudgetForm onSubmit={handleSubmit} />

        <aside className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-sm lg:sticky lg:top-8">
          <h2 className="text-lg font-semibold text-foreground">Plan preview</h2>

            {!result || !submittedInput ? (
              <div className="mt-6 rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted">
                Fill out the form and click Generate plan.
              </div>
            ) : (
              <>

                {/* Calculator input */}
                <dl className="mt-6 space-y-4 text-sm">
                  <div>
                    <dt className="text-muted">Monthly Income</dt>
                    <dd className="mt-1 font-medium text-foreground"> {formatCurrency(submittedInput.monthlyIncome)} </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Monthly Expenses</dt>
                    <dd className="mt-1 font-medium text-foreground"> {formatCurrency(result.totalExpenses)} </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Goal Name</dt>
                    <dd className="mt-1 font-medium text-foreground">{submittedInput.goalName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Savings Target</dt>
                    <dd className="mt-1 font-medium text-foreground"> {formatCurrency(submittedInput.savingsTarget)} </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Timeframe</dt>
                    <dd className="mt-1 font-medium text-foreground"> {submittedInput.timeframeValue} {submittedInput.timeframeUnit} </dd>
                  </div>
                </dl>


                {/* Calculator results */}
                <dl className="mt-6 space-y-4 border-t border-border pt-4 text-sm">
                  <div>
                    <dt className="text-muted">Monthly Money After Expenses</dt>
                    <dd className="mt-1 font-medium text-foreground"> {formatCurrency(result.surplus)} </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Monthly Required Savings</dt>
                    <dd className="mt-1 font-medium text-foreground"> {formatCurrency(result.requiredMonthlySavings)} </dd>
                  </div>
                  <div>
                    <dt className="text-muted"> {result.gap >= 0 ? "Extra each month after bills and savings" : "Still short each month"}</dt>
                    <dd className={`mt-1 font-medium ${result.gap >= 0 ? "text-accent" : "text-danger"}`} > {formatCurrency(Math.abs(result.gap))} </dd>
                  </div>
                </dl>
              </>
            )} 

        </aside>
      </main>
    </div>
  );
}
