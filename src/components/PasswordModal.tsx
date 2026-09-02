"use client";

import { Button } from "./Button";

type PasswordModalProps = {
  open: boolean;
  error: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
};

export function PasswordModal({
  open,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: PasswordModalProps) {
  if (!open) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    onSubmit(password);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close password dialog"
        className="absolute inset-0 bg-foreground/40"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg"
      >
        <h2 id="password-modal-title" className="text-lg font-bold text-foreground">
          Access Required
        </h2>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-base font-medium text-foreground">Password</span>
            <input
              name="password"
              type="password"
              autoFocus
              disabled={isSubmitting}
              className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-accent/30 transition focus:ring-2 disabled:opacity-70"
              placeholder="Enter password"
            />
          </label>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <Button variant="cancel" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Unlocking...
                </>
              ) : (
                "Unlock"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
