"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

interface ClientFormattedDateProps {
  date: string | Date;
  formatStr?: string;
}

export function ClientFormattedDate({
  date,
  formatStr: formatString = "dd.MM.yyyy HH:mm",
}: ClientFormattedDateProps) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    setFormatted(format(new Date(date), formatString));
  }, [date, formatString]);

  if (formatted === null) {
    return (
      <span className="bg-muted inline-block h-4 w-24 animate-pulse rounded" />
    );
  }

  return <span>{formatted}</span>;
}
