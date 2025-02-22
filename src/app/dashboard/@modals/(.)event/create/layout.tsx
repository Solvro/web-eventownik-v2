import { X } from "lucide-react";
import Link from "next/link";

export default function CreateEventFormLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return (
    <div className="absolute left-0 top-0 z-40 flex min-h-screen w-full flex-col items-center justify-center bg-black/80">
      <div className="flex w-full max-w-3xl flex-col items-end rounded-xl border bg-background p-6 shadow-lg">
        <Link
          href="/dashboard"
          className="absolute rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
