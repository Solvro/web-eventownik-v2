import { Smile } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function DashboardHomepage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Panel organizatora</h1>
      <Link
        href="/dashboard/event/create?step=1"
        className={buttonVariants({ variant: "default" })}
      >
        Click me <Smile />
      </Link>
    </div>
  );
}
