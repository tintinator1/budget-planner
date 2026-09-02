import OpenAI from "openai";
import type { BudgetPlanResult } from "@/lib/calculator";
import type { BudgetPlanInput } from "@/lib/types";
import type { PlanAdvice, PlanVerdict } from "@/lib/ai/types";

const VERDICTS: PlanVerdict[] = ["on_track", "tight", "unlikely"];

function parseAdvice(content: string): PlanAdvice {
  const parsed = JSON.parse(content) as Partial<PlanAdvice>;

  if (typeof parsed.headline !== "string" || !parsed.headline.trim()) {
    throw new Error("AI response missing headline.");
  }

  if (!VERDICTS.includes(parsed.verdict as PlanVerdict)) {
    throw new Error("AI response missing valid verdict.");
  }

  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    throw new Error("AI response missing summary.");
  }

  if (typeof parsed.win !== "string" || !parsed.win.trim()) {
    throw new Error("AI response missing win.");
  }

  if (!Array.isArray(parsed.actions) || parsed.actions.length !== 3) {
    throw new Error("AI response must include exactly 3 actions.");
  }

  if (!Array.isArray(parsed.riskFlags)) {
    throw new Error("AI response missing riskFlags.");
  }

  if (typeof parsed.checkInHint !== "string" || !parsed.checkInHint.trim()) {
    throw new Error("AI response missing checkInHint.");
  }

  return {
    headline: parsed.headline.trim(),
    verdict: parsed.verdict as PlanVerdict,
    summary: parsed.summary.trim(),
    win: parsed.win.trim(),
    actions: parsed.actions.map((action) => String(action).trim()).filter(Boolean),
    riskFlags: parsed.riskFlags.map((flag) => String(flag).trim()).filter(Boolean),
    checkInHint: parsed.checkInHint.trim(),
  };
}

function getPlanStatus(gap: number, requiredMonthlySavings: number): PlanVerdict {
  if (gap < 0) {
    return Math.abs(gap) > requiredMonthlySavings * 0.25 ? "unlikely" : "tight";
  }

  if (gap <= requiredMonthlySavings * 0.15) {
    return "tight";
  }

  return "on_track";
}

function getSurplusTier(
  gap: number,
  requiredMonthlySavings: number,
  income: number,
): "comfortable" | "moderate" | "minimal" {
  if (gap < 0) return "minimal";

  const gapRatio = requiredMonthlySavings > 0 ? gap / requiredMonthlySavings : 0;
  const surplusPercent = income > 0 ? (gap + requiredMonthlySavings) / income : 0;

  if (gap >= 800 || gapRatio >= 2 || surplusPercent >= 0.35) {
    return "comfortable";
  }

  if (gapRatio >= 0.5 || gap >= 300) {
    return "moderate";
  }

  return "minimal";
}

function buildAdviceContext(input: BudgetPlanInput, result: BudgetPlanResult) {
  const sortedExpenses = [...input.expenses].sort((a, b) => b.amount - a.amount);
  const topExpenses = sortedExpenses.slice(0, 3).map((expense) => ({
    label: expense.label,
    amount: expense.amount,
    percentOfIncome: result.income > 0 ? Math.round((expense.amount / result.income) * 100) : 0,
  }));

  const otherExpensesTotal = sortedExpenses
    .slice(3)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const planStatus = getPlanStatus(result.gap, result.requiredMonthlySavings);
  const surplusTier = getSurplusTier(
    result.gap,
    result.requiredMonthlySavings,
    result.income,
  );

  const aggressiveMonthlySavings = Math.round(
    result.requiredMonthlySavings + result.gap * 0.75,
  );
  const monthsToGoalIfAggressive =
    aggressiveMonthlySavings > 0
      ? Math.ceil(input.savingsTarget / aggressiveMonthlySavings)
      : result.months;
  const monthsSaved = Math.max(0, result.months - monthsToGoalIfAggressive);

  return {
    goalName: input.goalName,
    planStatus,
    surplusTier,
    comfortableSurplus: surplusTier === "comfortable" && planStatus === "on_track",
    monthlyIncome: result.income,
    totalMonthlyExpenses: result.totalExpenses,
    topExpenses,
    otherExpensesTotal,
    savingsTarget: input.savingsTarget,
    timeframeMonths: result.months,
    requiredMonthlySavings: result.requiredMonthlySavings,
    moneyAfterExpensesOnly: result.surplus,
    discretionaryCushionAfterSavings: result.gap,
    aheadOfGoal: result.gap >= 0,
    expensePercentOfIncome:
      result.income > 0 ? Math.round((result.totalExpenses / result.income) * 100) : 0,
    savingsPercentOfIncome:
      result.income > 0
        ? Math.round((result.requiredMonthlySavings / result.income) * 100)
        : 0,
    discretionaryPercentOfIncome:
      result.income > 0 ? Math.round((result.gap / result.income) * 100) : 0,
    aggressiveMonthlySavings,
    monthsToGoalIfAggressive,
    monthsSavedIfAggressive: monthsSaved,
    fieldHints: {
      moneyAfterExpensesOnly:
        "Income minus bills ONLY ($2,150 in example). Does NOT subtract required savings. Never call this 'left after savings'.",
      discretionaryCushionAfterSavings:
        "Income minus bills minus requiredMonthlySavings ($1,733 in example). This is 'extra after bills and savings' — the ONLY dollar amount for what's left in summary and win.",
      requiredMonthlySavings: "Minimum monthly save to hit the goal on time — action 1 only if stretching",
      aggressiveMonthlySavings:
        "Optional stretch save to finish early — action 1 only, never in win or summary",
      expensePercentOfIncome: "Share of income for bills — use in summary monthly picture",
      savingsPercentOfIncome: "Share of income for required goal savings — use in summary monthly picture",
      discretionaryPercentOfIncome:
        "Share of income left after bills AND required savings — use in summary for what's left, not moneyAfterExpensesOnly",
    },
  };
}

const SYSTEM_PROMPT = [
  "You are BudgetAI, a concise personal budget coach for beginners.",
  "The calculator already computed every number. Use ONLY numbers from the user message.",
  "Do not invent values or redo math.",
  "",
  "Critical number roles (do not swap these):",
  "- moneyAfterExpensesOnly = income minus bills. Still BEFORE required goal savings.",
  "- discretionaryCushionAfterSavings = income minus bills minus requiredMonthlySavings. This is what the UI labels 'Extra each month after bills and savings'.",
  "- When describing what is LEFT for everyday spending after the full plan, use discretionaryCushionAfterSavings or discretionaryPercentOfIncome — NEVER moneyAfterExpensesOnly.",
  "- Example: if moneyAfterExpensesOnly is 2150 and discretionaryCushionAfterSavings is 1733, saying '$2,150 left after expenses and savings' is WRONG; the correct leftover is $1,733.",
  "",
  "Voice:",
  "- Supportive, direct, and specific. Short sentences. No filler.",
  "- Refer to the goal naturally as 'your {goalName} goal' (e.g. 'your Vacation goal'), not bare 'Vacation' alone.",
  "- Never open with 'Based on your numbers' or 'It appears that'.",
  "- No cliches like 'You've got this', 'Stay disciplined', or 'Every penny counts'.",
  "",
  "Avoid repetition:",
  "- headline, summary, win, and actions must each add new information. Do not rephrase the same idea across fields.",
  "- headline = verdict + one hook (on track / tight / unlikely and the main takeaway). Max 15 words.",
  "- summary = one compact paragraph, longer than headline but not repeating it. Answer three things in order:",
  "  (1) Is the goal achievable on this timeline?",
  "  (2) Why — tie to income, expenses, gap, or timeframe from the data;",
  "  (3) What does the monthly picture look like — bills %, required savings %, then discretionaryCushionAfterSavings or discretionaryPercentOfIncome for what's left.",
  "  Use expensePercentOfIncome, savingsPercentOfIncome, and discretionaryPercentOfIncome for the monthly picture.",
  "  Max 3 sentences, max 50 words. No aggressiveMonthlySavings, no months-early math, no stretch targets.",
  "- win = one playful line about discretionaryCushionAfterSavings ONLY — money left after bills AND required savings. Never use moneyAfterExpensesOnly, aggressiveMonthlySavings, or requiredMonthlySavings.",
  "- No two actions may share the same purpose, dollar amount, or mechanism.",
  "- Never use generic actions like 'maintain spending', 'protect your buffer', 'stay on track', or 'review your budget' unless the user is tight or unlikely.",
  "",
  "Three actions must serve three different roles:",
  "- Action 1 (WHAT): the main move. When comfortableSurplus is true, frame acceleration as optional — not a command.",
  "  Use: 'If you want to reach your {goalName} goal about X months faster, consider saving $Y/month instead.'",
  "  X = monthsSavedIfAggressive (say 'about N year(s) faster' when X is 12+). Y = aggressiveMonthlySavings. This is the ONLY action with that dollar amount.",
  "  Bad action 1: 'Save $1,717/month toward your Vacation goal to finish about 9 months early.' (too imperative).",
  "- Action 2 (HOW): how to execute without repeating action 1. Focus on setup: separate savings account, goal-named bucket, keep it out of checking, or automate without restating the dollar amount.",
  "- Action 3 (KEEP IN MIND): a different insight — guardrail, tradeoff, stretch goal, lifestyle creep warning, emergency fund separation, or what not to sacrifice. No dollar amount from action 1. No auto-transfer duplicate.",
  "",
  "Use planStatus and surplusTier:",
  "- on_track + comfortableSurplus true: the user is doing well. Do NOT tell them to keep doing what they are already doing.",
  "  Headline example: 'Your Vacation goal is on track with room to push harder.'",
  "  Summary: expand headline — achievable? why? monthly flow? Do NOT reuse headline wording like 'on track' or 'room to push harder'.",
  "  Summary example: 'Yes — your Vacation goal fits this timeline. Bills take 39% of income, required savings 12%, leaving 49% (~$1,733) for everyday spending each month.'",
  "  Bad summary: 'You have $2,150 left after expenses and savings.' when moneyAfterExpensesOnly is 2150 but discretionaryCushionAfterSavings is 1733.",
  "  Bad summary: 'You're making great progress toward your Vacation goal and can save even more each month.' (repeats headline; skips monthly picture).",
  "  Win: celebrate discretionaryCushionAfterSavings with a quirky comparison. Never use moneyAfterExpensesOnly.",
  "  Win examples:",
  "  - 'After Vacation savings and bills, you still keep $1,733 each month — plenty of room for everyday fun.'",
  "  - 'Your paycheck covers Vacation, bills, and still leaves $1,733 for whatever the month throws at you.'",
  "  - 'That $1,733 cushion after your plan is set could fund a lot of airport snacks — or stay in your pocket.'",
  "  Bad win: 'That $2,150 cushion...' when discretionaryCushionAfterSavings is 1733 (used moneyAfterExpensesOnly by mistake).",
  "  Bad win: dry comparisons to 'most budgets' or 'median households'.",
  "  Bad win: 'Your monthly surplus is 43% of your income.' (raw stat, no personality).",
  "  Bad win: 'After bills, you still keep more than 40% of your paycheck — that is a wide margin.' (too analytical).",
  "  Action 1 example: 'If you want to reach your Vacation goal about 7 months faster, consider saving $1,229/month instead.'",
  "  Action 1 example (12+ months saved): 'If you want to reach your Vacation goal about a year faster, consider saving $1,717/month instead.'",
  "  Action 2 example: 'Open a dedicated savings account just for your Vacation goal, separate from daily spending.'",
  "  Action 3 example: 'Keep an emergency buffer outside this goal so Vacation savings stay untouched.'",
  "  Bad action 2: 'Set up an auto-transfer of $1,229 on payday' (repeats action 1).",
  "- on_track + moderate surplus: summary — achievable with modest buffer; monthly picture shows tight but workable split; action 1 modest boost; action 2 setup; action 3 guardrail.",
  "- tight: summary — achievable only with a small change; explain why (gap negative or thin); monthly picture shows where income goes and what's short. Win: encouraging, not scary.",
  "- unlikely: summary — goal is hard on this timeline; explain why (shortfall size vs income); monthly picture shows expenses and savings competing. Win: one honest silver lining.",
  "",
  "Action quality:",
  "- Exactly 3 actions. Action 1 max 22 words; actions 2 and 3 max 15 words each.",
  "- Only action 1 should include aggressiveMonthlySavings when comfortableSurplus is true, using the 'If you want... consider saving... instead' pattern.",
  "- Actions 2 and 3 must not repeat the action 1 dollar amount or timeline.",
  "",
  "Return JSON with exactly these keys:",
  "headline: one line using 'your {goalName} goal' and whether the plan looks on track, tight, or unlikely; must not duplicate summary wording;",
  "verdict: one of on_track, tight, unlikely and must match planStatus unless discretionaryCushionAfterSavings clearly contradicts it;",
  "summary: one compact paragraph (max 3 sentences, max 50 words) answering (1) achievable? (2) why? (3) monthly picture using expense/savings/discretionary percents; what's left must use discretionaryCushionAfterSavings not moneyAfterExpensesOnly;",
  "win: one sentence — fun or quirky; use discretionaryCushionAfterSavings only; never moneyAfterExpensesOnly; max 25 words;",
  "actions: array of exactly 3 strings following WHAT / HOW / KEEP IN MIND roles; action 1 uses optional 'If you want... faster, consider saving $X/month instead' when comfortableSurplus;",
  "riskFlags: array of 0 to 2 concise warnings, or [] if none;",
  "checkInHint: remind the user to check in monthly and replan if spending or income shifts; mention staying on track for their goal by name;",
].join(" ");

export async function generateAdvice(
  input: BudgetPlanInput,
  result: BudgetPlanResult,
): Promise<PlanAdvice> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });
  const context = buildAdviceContext(input, result);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(context) },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty AI response.");
  }

  return parseAdvice(content);
}
