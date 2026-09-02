import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-[#001845] bg-[#17191f] backdrop-blur-sm">
      <div className="flex w-full items-center gap-3 px-10 py-2">
        <div className="shrink-0">
          <Image
            src="/android-chrome-512x512.png"
            alt="Budget Planner logo"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-base font-bold uppercase tracking-[0.2em] text-[#ffffff]">
            Budget Planner
          </p>
        </div>

        <ThemeToggle className="text-[#ffffff] hover:bg-white/10" />
      </div>
    </header>
  );
}
