import { NextResponse } from "next/server";
import { generateAdvice } from "@/lib/ai/generateAdvice";
import type { PlanApiResponse } from "@/lib/ai/types";
import { calculatePlan } from "@/lib/calculator";
import { parseBudgetPlanInput } from "@/lib/validatePlanInput";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseBudgetPlanInput(body);

  if (!input) {
    return NextResponse.json({ error: "Invalid budget plan input." }, { status: 400 });
  }

  const result = calculatePlan(input);

  let advice: PlanApiResponse["advice"] = null;
  let adviceError: PlanApiResponse["adviceError"] = null;

  try {
    advice = await generateAdvice(input, result);
  } catch (error) {
    adviceError =
      error instanceof Error ? error.message : "Could not generate AI advice.";
  }

  const response: PlanApiResponse = {
    result,
    advice,
    adviceError,
  };

  return NextResponse.json(response);
}
