import Link from "next/link";
//import { useRouter } from "next/router";
import type React from "react";

//import { useCreateEvent } from "@/lib/useCreateEvent";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

interface MobileMenuProps {
  onClose: () => void;
  isOpen: boolean;
}

export function MobileMenu({ onClose, isOpen }: MobileMenuProps) {
  //TODO creating event and navigating to createEvent view
  //const event = useCreateEvent();
  //const router = useRouter();
  return isOpen ? (
    <>
      <button
        className="fixed inset-0 z-10 bg-black opacity-75"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-20 flex w-2/3 flex-col items-center justify-center bg-primary text-xl text-primary-foreground">
        <Toggle
          isOpen={isOpen}
          toggle={onClose}
          className="absolute right-6 top-8"
        />

        <Link
          href={{
            hash: "#",
          }}
          className="mt-8"
          onClick={onClose}
        >
          Home
        </Link>
        <Link
          href={{
            hash: "#",
          }}
          className="mt-8"
          onClick={onClose}
        >
          O nas
        </Link>
        <Link
          href={{
            hash: "#",
          }}
          className="mt-8"
          onClick={onClose}
        >
          O aplikacji
        </Link>
        <Link
          href={{
            hash: "#",
          }}
          className="mt-8"
          onClick={onClose}
        >
          Kontakt
        </Link>
        <Button
          onClick={() => {
            // void event.mutateAsync().then((data: { ownersSlug: any }) => {
            //   void router.push({
            //     pathname: "/event/[slug]/settings",
            //     query: { slug: data.ownersSlug },
            //   });
            // });
          }}
          variant="outline"
          className="mt-8 rounded-md border border-primary-foreground bg-transparent px-3 py-2"
        >
          {/* {event.isPending || Boolean(event.isSuccess) ? (
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          ) : null} */}
          Utwórz wydarzenie
        </Button>
      </div>
    </>
  ) : null;
}
