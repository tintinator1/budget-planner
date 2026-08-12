import { NextResponse } from "next/server";
import { generateAdvice } from "@/lib/ai/generateAdvice";
import type { PlanAdviceResponse } from "@/lib/ai/types";
import { calculatePlan } from "@/lib/calculator";
import { readPlanInput } from "@/lib/readPlanInput";

export async function POST(request: Request) {
  const input = await readPlanInput(request);

  if (!input) {
    return NextResponse.json({ error: "Invalid budget plan input." }, { status: 400 });
  }

  const result = calculatePlan(input);

  let advice: PlanAdviceResponse["advice"] = null;
  let adviceError: PlanAdviceResponse["adviceError"] = null;

  try {
    advice = await generateAdvice(input, result);
  } catch (error) {
    adviceError =
      error instanceof Error ? error.message : "Could not generate AI advice.";
  }

  const response: PlanAdviceResponse = {
    result,
    advice,
    adviceError,
  };

  return NextResponse.json(response);
}
