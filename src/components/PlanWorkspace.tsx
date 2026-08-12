"use client";

import { useState } from "react";
import { BudgetForm } from "@/components/BudgetForm";
import { Header } from "@/components/Header";
import { PasswordModal } from "@/components/PasswordModal";
import type { BudgetPlanResult } from "@/lib/calculator";
import type { PlanAdvice, PlanMode } from "@/lib/ai/types";
import type { BudgetPlanInput } from "@/lib/types";

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
  const [advice, setAdvice] = useState<PlanAdvice | null>(null);
  const [adviceError, setAdviceError] = useState("");
  const [apiError, setApiError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [planMode, setPlanMode] = useState<PlanMode | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingInput, setPendingInput] = useState<BudgetPlanInput | null>(null);

  async function fetchPlan(input: BudgetPlanInput, mode: PlanMode, password = "") {
    setIsGenerating(true);
    setSubmittedInput(input);
    setPlanMode(mode);
    setApiError("");
    setAdvice(null);
    setAdviceError("");

    const endpoint = mode === "ai" ? "/api/plan/advice" : "/api/plan";

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (mode === "ai") {
        headers["AI-Access-Password"] = password;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      });

      if (response.status === 401) {
        setPasswordError("Incorrect password.");
        return false;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setResult(null);
        setAdvice(null);
        setApiError(data?.error ?? "Could not generate plan. Please try again.");
        return false;
      }

      if (mode === "calculator") {
        const data = (await response.json()) as { result: BudgetPlanResult };
        setResult(data.result);
        return true;
      }

      const data = (await response.json()) as {
        result: BudgetPlanResult;
        advice: PlanAdvice | null;
        adviceError: string | null;
      };

      setResult(data.result);
      setAdvice(data.advice);
      setAdviceError(data.adviceError ?? "");
      return true;
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleFormSubmit(input: BudgetPlanInput, mode: PlanMode) {
    if (mode === "ai") {
      setPendingInput(input);
      setPasswordError("");
      setShowPasswordModal(true);
      return;
    }

    await fetchPlan(input, mode);
  }

  async function handlePasswordSubmit(password: string) {
    if (!pendingInput) return;

    if (!password.trim()) {
      setPasswordError("Enter the AI access password.");
      return;
    }

    setPasswordError("");
    const success = await fetchPlan(pendingInput, "ai", password);

    if (success) {
      setShowPasswordModal(false);
      setPendingInput(null);
      setPasswordError("");
    }
  }

  function handlePasswordModalClose() {
    if (isGenerating) return;
    setShowPasswordModal(false);
    setPendingInput(null);
    setPasswordError("");
  }

  return (
    <div className="min-h-full bg-background">
      <Header />

      <PasswordModal
        open={showPasswordModal}
        error={passwordError}
        isSubmitting={isGenerating}
        onClose={handlePasswordModalClose}
        onSubmit={handlePasswordSubmit}
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-8 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
          <div className="flex flex-col gap-8">
            <BudgetForm
              onSubmit={handleFormSubmit}
              isGenerating={isGenerating || showPasswordModal}
            />
            {apiError ? <p className="text-sm text-danger">{apiError}</p> : null}
          </div>

          <aside className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-lg font-semibold text-foreground">Plan preview</h2>

            {!result || !submittedInput ? (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted">
                Fill out the form and click Generate plan.
              </div>
            ) : (
              <>
                {/* Calculator input */}
                <dl className="mt-6 space-y-4 text-sm">
                  <div>
                    <dt className="text-muted">Monthly Income</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {formatCurrency(submittedInput.monthlyIncome)}
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
                    <dd className="mt-1 font-medium text-foreground">
                      {submittedInput.goalName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Savings Target</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {formatCurrency(submittedInput.savingsTarget)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Timeframe</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {submittedInput.timeframeValue} {submittedInput.timeframeUnit}
                    </dd>
                  </div>
                </dl>

                {/* Calculator results */}
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
                      className={`mt-1 font-medium ${result.gap >= 0 ? "text-accent" : "text-danger"}`}
                    >
                      {formatCurrency(Math.abs(result.gap))}
                    </dd>
                  </div>
                </dl>

                <section className="mt-6 border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-foreground">BudgetAI</h3>

                  {planMode === "calculator" ? (
                    <p className="mt-3 text-sm text-muted">
                      Nothing to see here.
                    </p>
                  ) : advice ? (
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
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
