import type { FormAttribute } from "@/types/attributes";

export interface Form {
  id: number;
  name: string;
  slug: string;
  startDate: string;
  isOpen: boolean;
  isFirstForm: boolean;
  description: string;
  endDate: string;
  eventId: number;
  createdAt: string;
  updatedAt: string;
  attributes: FormAttribute[];
}
