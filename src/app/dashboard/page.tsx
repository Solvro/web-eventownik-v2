import { Smile } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Link
        href="/dashboard/event/create/general-info"
        className={buttonVariants({ variant: "default" })}
      >
        Click me <Smile />
      </Link>
    </div>
  );
}
