"use client";

import { useState } from "react";
import {
  type BudgetPlanFormState,
  type BudgetPlanInput,
  type ExpenseFormItem,
  toBudgetPlanInput,
} from "@/lib/types";
import type { PlanMode } from "@/lib/ai/types";

type BudgetFormProps = {
  onSubmit: (input: BudgetPlanInput, mode: PlanMode) => void | Promise<void>;
  isGenerating?: boolean;
};

const defaultForm: BudgetPlanFormState = {
  monthlyIncome: "",
  goalName: "",
  savingsTarget: "",
  timeframeValue: "12",
  timeframeUnit: "months",
};

function createExpenseItem(): ExpenseFormItem {
  return {
    id: crypto.randomUUID(),
    label: "",
    amount: "",
  };
}

export function BudgetForm({ onSubmit, isGenerating = false }: BudgetFormProps) {
  const [form, setForm] = useState<BudgetPlanFormState>(defaultForm);
  const [expenses, setExpenses] = useState<ExpenseFormItem[]>([
    createExpenseItem(),
    createExpenseItem(),
  ]);
  const [error, setError] = useState("");
  const [planMode, setPlanMode] = useState<PlanMode>("calculator");

  function updateExpense(id: string, patch: Partial<ExpenseFormItem>) {
    setExpenses((current) =>
      current.map((expense) =>
        expense.id === id ? { ...expense, ...patch } : expense,
      ),
    );
  }

  function addExpense() {
    setExpenses((current) => [...current, createExpenseItem()]);
  }

  function removeExpense(id: string) {
    setExpenses((current) =>
      current.length === 1 ? current : current.filter((expense) => expense.id !== id),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isGenerating) return;

    const parsed = toBudgetPlanInput(form, expenses);
    if (!parsed) {
      setError("Check your inputs — income, goal, target, timeline, and expenses must be valid.");
      return;
    }
    setError("");
    await onSubmit(parsed, planMode);
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Income</h2>
        <p className="mt-1 text-sm text-muted">Your take-home pay each month.</p>

        <label className="mt-5 grid gap-2">
          <span className="text-sm font-medium text-foreground">Monthly income</span>
          <input
            className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-accent/30 transition focus:ring-2"
            inputMode="decimal"
            placeholder="3500"
            value={form.monthlyIncome}
            onChange={(event) => setForm({ ...form, monthlyIncome: event.target.value })}
          />
        </label>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Expenses</h2>
            <p className="mt-1 text-sm text-muted">
              Break down monthly spending. The calculator will sum these for you.
            </p>
          </div>
          <button
            type="button"
            onClick={addExpense}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-background"
          >
            Add expense
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
              <input
                className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-accent/30 transition focus:ring-2"
                placeholder="Rent, groceries, subscriptions..."
                value={expense.label}
                onChange={(event) =>
                  updateExpense(expense.id, { label: event.target.value })
                }
              />
              <input
                className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-accent/30 transition focus:ring-2"
                inputMode="decimal"
                placeholder="Amount"
                value={expense.amount}
                onChange={(event) =>
                  updateExpense(expense.id, { amount: event.target.value })
                }
              />
              <button
                type="button"
                onClick={() => removeExpense(expense.id)}
                className="rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-background hover:text-danger"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Savings goal</h2>
        <p className="mt-1 text-sm text-muted">
          What you want to save and how long you have to get there.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Goal name</span>
            <input
              className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-accent/30 transition focus:ring-2"
              placeholder="Emergency fund, new laptop, move-out fund..."
              value={form.goalName}
              onChange={(event) => setForm({ ...form, goalName: event.target.value })}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Target amount</span>
            <input
              className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-accent/30 transition focus:ring-2"
              inputMode="decimal"
              placeholder="5000"
              value={form.savingsTarget}
              onChange={(event) => setForm({ ...form, savingsTarget: event.target.value })}
            />
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Timeframe</span>
            <div className="grid min-w-0 grid-cols-[1fr_auto] gap-3">
              <input
                className="min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-accent/30 transition focus:ring-2"
                inputMode="numeric"
                placeholder="12"
                value={form.timeframeValue}
                onChange={(event) =>
                  setForm({ ...form, timeframeValue: event.target.value })
                }
              />
              <select
                className="min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-accent/30 transition focus:ring-2"
                value={form.timeframeUnit}
                onChange={(event) =>
                  setForm({
                    ...form,
                    timeframeUnit: event.target.value as BudgetPlanFormState["timeframeUnit"],
                  })
                }
              >
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Plan type</legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <input
            type="radio"
            name="planMode"
            value="calculator"
            checked={planMode === "calculator"}
            onChange={() => setPlanMode("calculator")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">Numbers only</span>
            <span className="block text-sm text-muted">Calculator results</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <input
            type="radio"
            name="planMode"
            value="ai"
            checked={planMode === "ai"}
            onChange={() => setPlanMode("ai")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">Numbers + AI</span>
            <span className="block text-sm text-muted">Includes personalized BudgetAI summary.</span>
          </span>
        </label>             
      </fieldset>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={isGenerating}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isGenerating ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
            Generating plan...
          </>
        ) : (
          "Generate plan"
        )}
      </button>
    </form>
  );
}
