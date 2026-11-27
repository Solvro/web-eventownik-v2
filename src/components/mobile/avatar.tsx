import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function MobileAvatar({
  person,
  size = 40,
  className,
}: {
  person: { displayName: string; photoUrl: string | null };
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (person.photoUrl !== null && person.photoUrl !== "") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={person.photoUrl}
        alt={person.displayName}
        style={style}
        className={cn(
          "bg-secondary shrink-0 rounded-full object-cover",
          className,
        )}
        loading="lazy"
      />
    );
  }
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[var(--mobile-accent)] font-bold tracking-normal text-[var(--mobile-accent-foreground)]",
        className,
      )}
    >
      {initials(person.displayName)}
    </span>
  );
}
