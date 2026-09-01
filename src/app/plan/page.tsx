"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { PlanResults } from "@/components/PlanResults";
import { loadPlan, type StoredPlan } from "@/lib/planStorage";

export default function PlanPage() {
  const router = useRouter();
  const [planData] = useState<StoredPlan | null>(() => loadPlan());

  useEffect(() => {
    if (!planData) {
      router.replace("/");
    }
  }, [planData, router]);

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
