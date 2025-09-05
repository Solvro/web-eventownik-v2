"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-foreground">
          {resolvedTheme === "light" ? <Sun /> : <Moon />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            setTheme("light");
          }}
        >
          <Sun className="mr-2" /> Jasny
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("dark");
          }}
        >
          <Moon className="mr-2" /> Ciemny
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("system");
          }}
        >
          <Monitor className="mr-2" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button className="border-foreground h-12 w-12" variant="outline"></Button>
  );
}

export { ThemeSwitch };
