"use client";

import { useState } from "react";
import {
  type BudgetPlanFormState,
  type BudgetPlanInput,
  type ExpenseFormItem,
  toBudgetPlanInput,
  toBudgetPlanFormState,
} from "@/lib/types";
import type { PlanMode } from "@/lib/ai/types";
import { Button } from "./Button";

type BudgetFormProps = {
  onSubmit: (input: BudgetPlanInput, mode: PlanMode) => void | Promise<void>;
  isGenerating?: boolean;
  initialDraft?: {
    input: BudgetPlanInput;
    planMode: PlanMode;
  };
};

const defaultForm: BudgetPlanFormState = {
  monthlyIncome: "",
  goalName: "",
  savingsTarget: "",
  timeframeValue: "12",
  timeframeUnit: "Months",
};

function createExpenseItem(): ExpenseFormItem {
  return {
    id: crypto.randomUUID(),
    label: "",
    amount: "",
  };
}

function getInitialFormState(initialDraft?: BudgetFormProps["initialDraft"]) {
  if (!initialDraft) {
    return {
      form: defaultForm,
      expenses: [createExpenseItem()],
      planMode: "calculator" as PlanMode,
    };
  }

  const { form, expenses } = toBudgetPlanFormState(initialDraft.input);

  return {
    form,
    expenses: expenses.length > 0 ? expenses : [createExpenseItem()],
    planMode: initialDraft.planMode,
  };
}

export function BudgetForm({
  onSubmit,
  isGenerating = false,
  initialDraft,
}: BudgetFormProps) {
  const initial = getInitialFormState(initialDraft);
  const [form, setForm] = useState(initial.form);
  const [expenses, setExpenses] = useState(initial.expenses);
  const [error, setError] = useState("");
  const [planMode, setPlanMode] = useState<PlanMode>(initial.planMode);

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
          <Button variant="primary" type="button" onClick={addExpense}>
            Add Expense
          </Button>
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
              <Button variant="cancel" type="button" onClick={() => removeExpense(expense.id)}>
                Remove
              </Button>
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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={form.timeframeUnit === "Months" ? "primary" : "secondary"}
                  onClick={() => setForm({ ...form, timeframeUnit: "Months" })}
                >
                  Months
                </Button>
                <Button
                  type="button"
                  variant={form.timeframeUnit === "Years" ? "primary" : "secondary"}
                  onClick={() => setForm({ ...form, timeframeUnit: "Years" })}
                >
                  Years
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      <fieldset className="space-y-3">
        <legend className="text-lg font-bold text-foreground">Plan type</legend>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-surface hover:cursor-pointer hover:bg-button-hover/20 px-4 py-3">
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
            <span className="block text-sm text-muted">Straight forward budget calculation.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-surface hover:cursor-pointer hover:bg-button-hover/20 px-4 py-3">
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

      <Button variant="primary" type="submit" disabled={isGenerating}>
        {isGenerating ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
            Generating Plan...
          </>
        ) : (
          "Generate Plan"
        )}
      </Button>
    </form>
  );
}
