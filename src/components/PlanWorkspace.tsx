"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BudgetForm } from "@/components/BudgetForm";
import { Header } from "@/components/Header";
import { PasswordModal } from "@/components/PasswordModal";
import type { PlanAdvice, PlanMode } from "@/lib/ai/types";
import type { BudgetPlanResult } from "@/lib/calculator";
import { loadFormDraft, savePlan, subscribeToPlanStorage } from "@/lib/planStorage";
import type { BudgetPlanInput } from "@/lib/types";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function useStoredFormDraft() {
  return useSyncExternalStore(
    subscribeToPlanStorage,
    () => loadFormDraft(),
    () => null,
  );
}

export function PlanWorkspace() {
  const router = useRouter();
  const isClient = useIsClient();
  const initialDraft = useStoredFormDraft();
  const [apiError, setApiError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingInput, setPendingInput] = useState<BudgetPlanInput | null>(null);

  async function fetchPlan(input: BudgetPlanInput, mode: PlanMode, password = "") {
    setIsGenerating(true);
    setApiError("");

    const endpoint = mode === "ai" ? "/api/plan/advice" : "/api/plan";

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (mode === "ai") {
        headers["AI-Access-Password"] = password;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      });

      if (response.status === 401) {
        setPasswordError("Incorrect password.");
        return false;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setApiError(data?.error ?? "Could not generate plan. Please try again.");
        return false;
      }

      const data = (await response.json()) as {
        result: BudgetPlanResult;
        advice?: PlanAdvice | null;
        adviceError?: string | null;
      };

      savePlan({
        input,
        result: data.result,
        planMode: mode,
        advice: mode === "ai" ? (data.advice ?? null) : null,
        adviceError: mode === "ai" ? (data.adviceError ?? "") : "",
      });
      router.push("/plan");
      return true;
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleFormSubmit(input: BudgetPlanInput, mode: PlanMode) {
    if (mode === "ai") {
      setPendingInput(input);
      setPasswordError("");
      setShowPasswordModal(true);
      return;
    }

    await fetchPlan(input, mode);
  }

  async function handlePasswordSubmit(password: string) {
    if (!pendingInput) return;

    if (!password.trim()) {
      setPasswordError("Enter password.");
      return;
    }

    setPasswordError("");
    const success = await fetchPlan(pendingInput, "ai", password);

    if (success) {
      setShowPasswordModal(false);
      setPendingInput(null);
      setPasswordError("");
    }
  }

  function handlePasswordModalClose() {
    if (isGenerating) return;
    setShowPasswordModal(false);
    setPendingInput(null);
    setPasswordError("");
  }

  return (
    <div className="min-h-full bg-background">
      <Header />

      <PasswordModal
        open={showPasswordModal}
        error={passwordError}
        isSubmitting={isGenerating}
        onClose={handlePasswordModalClose}
        onSubmit={handlePasswordSubmit}
      />

      <main className="mx-auto max-w-3xl px-6 py-8">
        {isClient ? (
          <BudgetForm
            key={initialDraft ? "restored" : "empty"}
            initialDraft={initialDraft ?? undefined}
            onSubmit={handleFormSubmit}
            isGenerating={isGenerating || showPasswordModal}
          />
        ) : null}
        {apiError ? <p className="mt-4 text-sm text-danger">{apiError}</p> : null}
      </main>
    </div>
  );
}
