"use client";

import type { VariantProps } from "class-variance-authority";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import type { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themes = [
  { name: "light", icon: Sun },
  { name: "dark", icon: Moon },
  { name: "system", icon: Monitor },
];

function ThemeSwitch({
  variant = "outline",
  className = "border-foreground",
}: VariantProps<typeof buttonVariants> & {
  className?: string;
}) {
  const { resolvedTheme, theme, setTheme } = useTheme();
  const t = useTranslations("Themes");

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state
    setMounted(true);
  }, []);

  return mounted ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          className={cn("size-12 [&_svg]:size-5", className)}
        >
          {resolvedTheme === "light" ? <Sun /> : <Moon />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {themes.map((_theme) => (
          <DropdownMenuItem
            onClick={() => {
              setTheme(_theme.name);
            }}
            key={_theme.name}
            className={theme === _theme.name ? "bg-accent/50" : ""}
          >
            <_theme.icon className="mr-2" /> {t(_theme.name)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button
      variant={variant}
      className={cn("border-foreground size-12 [&_svg]:size-5", className)}
    >
      <Sun />
    </Button>
  );
}

export { ThemeSwitch };
