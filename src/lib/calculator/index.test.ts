import { describe, expect, it } from "vitest";
import type { BudgetPlanInput } from "@/lib/types";
import { calculatePlan } from "./index";

/** Reusable baseline input — override only what each test cares about. */
function makeInput(overrides: Partial<BudgetPlanInput> = {}): BudgetPlanInput {
  return {
    monthlyIncome: 3500,
    expenses: [{ id: "1", label: "Rent", amount: 2800 }],
    goalName: "Emergency fund",
    savingsTarget: 5000,
    timeframeValue: 12,
    timeframeUnit: "months",
    ...overrides,
  };
}

describe("calculatePlan", () => {
  it("computes surplus when income exceeds expenses", () => {
    const result = calculatePlan(makeInput());

    expect(result.totalExpenses).toBe(2800);
    expect(result.surplus).toBe(700);
    expect(result.months).toBe(12);
    expect(result.requiredMonthlySavings).toBeCloseTo(5000 / 12);
  });

  it("returns positive gap when user is ahead of the savings goal", () => {
    const result = calculatePlan(makeInput());

    // gap = surplus - required → 700 - 416.67 ≈ 283.33
    expect(result.gap).toBeCloseTo(700 - 5000 / 12);
  });

  it("returns negative gap when user is short of the savings goal", () => {
    const result = calculatePlan(
      makeInput({
        expenses: [{ id: "1", label: "Rent", amount: 3300 }],
      }),
    );

    expect(result.surplus).toBe(200);
    expect(result.gap).toBeCloseTo(200 - 5000 / 12);
  });

  it("handles negative surplus when expenses exceed income", () => {
    const result = calculatePlan(
      makeInput({
        monthlyIncome: 2000,
        expenses: [{ id: "1", label: "Rent", amount: 2500 }],
      }),
    );

    expect(result.surplus).toBe(-500);
    expect(result.gap).toBeLessThan(0);
  });

  it("sums multiple expense lines", () => {
    const result = calculatePlan(
      makeInput({
        expenses: [
          { id: "1", label: "Rent", amount: 1500 },
          { id: "2", label: "Food", amount: 400 },
        ],
      }),
    );

    expect(result.totalExpenses).toBe(1900);
    expect(result.surplus).toBe(1600);
  });

  it("converts years to months for required savings", () => {
    const result = calculatePlan(
      makeInput({
        savingsTarget: 12000,
        timeframeValue: 1,
        timeframeUnit: "years",
      }),
    );

    expect(result.months).toBe(12);
    expect(result.requiredMonthlySavings).toBe(1000);
  });

  it("gap exactly 0, user is exactly on track", () => {
    const result = calculatePlan(
      makeInput({
        expenses: [{ id: "1", label: "Rent", amount: 3000 }],
        savingsTarget: 6000,
      }),
    );
    
    expect(result.gap).toBe(0);
  })

  it("zero expenses, income is surplus", () => {
    const result = calculatePlan(
      makeInput({
        expenses: [{ id: "1", label: "Rent", amount: 0 }],
      }),
    );
    
    expect(result.totalExpenses).toBe(0);
    expect(result.surplus).toBe(result.income);
  })
});
