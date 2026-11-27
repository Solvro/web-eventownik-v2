/** Header + content wrapper for pages inside the tab bar */
export function MobileTabPage({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col px-5 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
      <MobileHeaderGlow />
      <header className="relative mb-8 text-center">
        <h1 className="text-2xl leading-[1.2] font-extrabold">{title}</h1>
        {subtitle === undefined ? null : (
          <p className="dark:text-muted-foreground mt-2 text-base leading-[1.2] font-semibold text-[#868686]">
            {subtitle}
          </p>
        )}
      </header>
      <div className="relative flex flex-col">{children}</div>
    </div>
  );
}

/** Soft blurred accent glow behind the top of a screen, as on the design's home screen */
export function MobileHeaderGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-[-15%] -top-24 h-[260px] bg-[var(--mobile-accent)] opacity-70 blur-[50px] dark:opacity-40"
    />
  );
}

/** Section heading in the 16/600 style of the design */
export function MobileSectionHeading({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base leading-[1.2] font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function MobileEmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="bg-card flex flex-col items-center gap-3 rounded-[32px] px-6 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)] [&_svg]:size-7">
        {icon}
      </div>
      <p className="text-base font-semibold">{title}</p>
      {description === undefined ? null : (
        <p className="text-muted-foreground text-sm font-medium">
          {description}
        </p>
      )}
    </div>
  );
}

export function MobileListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="bg-secondary h-24 animate-pulse rounded-[32px]"
        />
      ))}
    </div>
  );
}

export function MobileErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-card text-muted-foreground flex flex-col items-center gap-4 rounded-[32px] px-6 py-8 text-center text-base font-medium">
      Nie udało się wczytać danych.
      <button
        type="button"
        onClick={onRetry}
        className="bg-primary text-primary-foreground h-12 rounded-3xl px-6 text-base font-semibold tracking-[0.01em]"
      >
        Spróbuj ponownie
      </button>
    </div>
  );
}
