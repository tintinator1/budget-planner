import { NextResponse } from "next/server";
import { calculatePlan } from "@/lib/calculator";
import { readPlanInput } from "@/lib/readPlanInput";

export async function POST(request: Request) {
  const input = await readPlanInput(request);

  if (!input) {
    return NextResponse.json({ error: "Invalid budget plan input." }, { status: 400 });
  }

  const result = calculatePlan(input);

  return NextResponse.json({ result });
}
