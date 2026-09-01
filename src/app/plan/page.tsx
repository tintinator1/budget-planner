"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { PlanResults } from "@/components/PlanResults";
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
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/" className="text-sm text-muted transition hover:text-foreground">
          ← Edit inputs
        </Link>
        <div className="mt-6">
          <PlanResults {...planData} />
        </div>
      </main>
    </div>
  );
}
