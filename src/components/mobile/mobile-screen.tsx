import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Full-screen page chrome with a sticky top bar, for screens outside the tab bar */
export function MobileScreen({
  title,
  backHref,
  action,
  children,
  className,
}: {
  title: React.ReactNode;
  backHref?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-[#E7E7E7] bg-white/90 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="flex h-16 w-full items-center gap-2">
          {backHref === undefined ? (
            <span className="w-2" />
          ) : (
            <Link
              href={backHref}
              aria-label="Wróć"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] transition active:scale-95"
            >
              <ArrowLeft className="size-5" strokeWidth={2} />
            </Link>
          )}
          <h1 className="min-w-0 flex-1 truncate text-base leading-[1.2] font-bold">
            {title}
          </h1>
          {action === undefined ? null : (
            <div className="flex items-center">{action}</div>
          )}
        </div>
      </header>
      <main
        className={cn(
          "flex flex-1 flex-col pb-[calc(env(safe-area-inset-bottom)+1rem)]",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
