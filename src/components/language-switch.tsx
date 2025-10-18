"use client";

import type { VariantProps } from "class-variance-authority";
import { GB, PL } from "country-flag-icons/react/3x2";
import Cookies from "js-cookie";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import type { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const languages = [
  { code: "pl", name: "Polski", icon: PL },
  { code: "en", name: "English", icon: GB },
];

export function LanguageSwitch({
  variant = "outline",
  className = "border-foreground",
}: VariantProps<typeof buttonVariants> & {
  className?: string;
}) {
  const locale = useLocale();
  const router = useRouter();

  const switchLanguage = (newLocale: string) => {
    Cookies.set("locale", newLocale, { path: "/", expires: 365 });
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          className={cn("size-12 [&_svg]:size-5", className)}
        >
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => {
              switchLanguage(language.code);
            }}
            className={locale === language.code ? "bg-accent/50" : ""}
          >
            <language.icon className="mr-2" />
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
