import type { FormAttribute } from "@/types/attributes";

export interface Form {
  id: number;
  name: string;
  slug: string;
  startDate: string;
  // isOpen: boolean;
  isFirstForm: boolean;
  description: string;
  endDate: string;
  eventId: number;
  createdAt: string;
  updatedAt: string;
  attributes: FormAttribute[];
}

export interface FormErrorObject {
  rule: string;
  field: string;
  message: string;
}

/**
 * The type of the function that is passed to the ParticipantForm component.
 */
export type ParticipantFormSubmitHandler = (
  values: Record<string, unknown>,
  files: File[],
) => Promise<{ success: boolean; errors?: FormErrorObject[]; error?: string }>;
