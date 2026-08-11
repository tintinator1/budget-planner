export function Header() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-6 py-5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Budget Planner
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          Plan your savings with clear numbers first
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Enter your income, expenses, and goal. The calculator will compute the
          plan; AI guidance comes after that.
        </p>
      </div>
    </header>
  );
}
