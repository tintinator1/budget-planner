"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { PlanExpenseBreakdown, PlanResults } from "@/components/PlanResults";
import { loadPlan, subscribeToPlanStorage, type StoredPlan } from "@/lib/planStorage";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function useStoredPlan(): StoredPlan | null {
  return useSyncExternalStore(subscribeToPlanStorage, () => loadPlan(), () => null);
}

export default function PlanPage() {
  const router = useRouter();
  const isClient = useIsClient();
  const planData = useStoredPlan();

  useEffect(() => {
    if (!isClient) return;
    if (!loadPlan()) {
      router.replace("/");
    }
  }, [isClient, router]);

  if (!planData) return null;

  return (
    <div className="min-h-full bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link href="/" className="text-sm text-muted transition hover:text-foreground">
          ← Edit Plan
        </Link>

        <div className="mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8">
          <PlanResults {...planData} />
          <PlanExpenseBreakdown
            expenses={planData.input.expenses}
            totalExpenses={planData.result.totalExpenses}
            monthlyIncome={planData.input.monthlyIncome}
          />
        </div>
      </main>
    </div>
  );
}
