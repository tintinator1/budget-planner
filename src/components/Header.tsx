import Image from "next/image";

export function Header() {
  return (
    <header className="border-b border-border bg-background backdrop-blur-sm">
      <div className="flex w-full items-center gap-3 px-10 py-2 sm:py-2">
        
        {/* Logo */}
        <div className="shrink-0">
          <Image
            src="/android-chrome-512x512.png"
            alt="Budget Planner logo"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0"
          />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold uppercase tracking-[0.2em] text-foreground sm:text-base">
            Budget Planner
          </p>

        </div>
      </div>
    </header>
  );
}