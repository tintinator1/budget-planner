import { parseBudgetPlanInput } from "@/lib/validatePlanInput";
import type { BudgetPlanInput } from "@/lib/types";

export async function readPlanInput(request: Request): Promise<BudgetPlanInput | null> {
  try {
    const body = await request.json();
    return parseBudgetPlanInput(body);
  } catch {
    return null;
  }
}
