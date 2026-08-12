import Image from "next/image";

export function Header() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4 sm:gap-6 sm:py-5">
        
        {/* Logo */}
        <div className="shrink-0">
          <Image
            src="/android-chrome-512x512.png"
            alt="Budget Planner logo"
            width={64}
            height={64}
            className="h-14 w-14 shrink-0"
          />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent sm:text-sm">
            Budget Planner
          </p>

          <p className="mt-2 max-w-2xl text-xs text-muted sm:text-sm md:text-base">
            Still in development
          </p>
        </div>
      </div>
    </header>
  );
}