import OpenAI from "openai";
import type { BudgetPlanResult } from "@/lib/calculator";
import type { BudgetPlanInput } from "@/lib/types";
import type { PlanAdvice } from "@/lib/ai/types";

function parseAdvice(content: string): PlanAdvice {
  const parsed = JSON.parse(content) as Partial<PlanAdvice>;

  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    throw new Error("AI response missing summary.");
  }

  if (!Array.isArray(parsed.actions) || parsed.actions.length === 0) {
    throw new Error("AI response missing actions.");
  }

  if (!Array.isArray(parsed.riskFlags)) {
    throw new Error("AI response missing riskFlags.");
  }

  return {
    summary: parsed.summary.trim(),
    actions: parsed.actions.map((action) => String(action).trim()).filter(Boolean),
    riskFlags: parsed.riskFlags.map((flag) => String(flag).trim()).filter(Boolean),
  };
}

export async function generateAdvice(
  input: BudgetPlanInput,
  result: BudgetPlanResult,
): Promise<PlanAdvice> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });

  const context = {
    goalName: input.goalName,
    monthlyIncome: result.income,
    totalMonthlyExpenses: result.totalExpenses,
    expenseBreakdown: input.expenses.map((expense) => ({
      label: expense.label,
      amount: expense.amount,
    })),
    savingsTarget: input.savingsTarget,
    timeframeMonths: result.months,
    monthlySurplus: result.surplus,
    requiredMonthlySavings: result.requiredMonthlySavings,
    monthlyGap: result.gap,
    aheadOfGoal: result.gap >= 0,
  };

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are a practical personal budget coach for beginners.",
          
          "The calculator has already computed all financial numbers.",
          "Do NOT simply restate the user's financial numbers as the summary. You may reference provided numbers when they make a recommendation more specific or actionable.",
          
          "Your job is to interpret the numbers and give useful real-world advice.",
          
          "Use ONLY numbers provided in the user message. Do not invent or recalculate values that are not provided.",
          
          "Evaluate how realistic the savings plan is:",
          
          "- If the user's monthly surplus is much larger than the required monthly savings, explain that they have flexibility. Suggest optionally saving more each month to reach the goal sooner while keeping enough money for normal spending and emergencies.",
          
          "- If the monthly surplus is only slightly above the required savings, advise them to keep the plan conservative and maintain a buffer rather than committing every available dollar.",
          
          "- If the monthly surplus is below the required monthly savings, identify the shortfall using the provided numbers and recommend reducing discretionary expenses, increasing income, extending the goal timeline, or lowering the goal.",
          
          "- If the user has little or no remaining money after expenses, warn against aggressively saving at the expense of necessities or an emergency buffer.",
          
          "Recommendations should be actionable and specific to the user's situation, not generic advice.",
          
          "Avoid obvious suggestions such as 'make a budget' or 'review your expenses' unless they directly solve a problem shown by the numbers.",
          
          "Return JSON with exactly these keys:",
          "summary: 2-3 sentences interpreting how achievable or aggressive the plan is and what strategy makes sense,",
          "actions: an array of exactly 3 specific recommended actions based on the numbers,",
          "riskFlags: an array of 0-3 concise warnings; use [] if there are no meaningful concerns."
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify(context),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty AI response.");
  }

  return parseAdvice(content);
}
