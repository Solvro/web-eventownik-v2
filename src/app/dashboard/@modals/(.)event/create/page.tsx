"use client";

import { useSearchParams } from "next/navigation";

import { AttributesForm } from "./steps/attributes";
import { CoorganizersForm } from "./steps/coorganizers";
import { GeneralInfoForm } from "./steps/general-info";
import { PersonalizationForm } from "./steps/personalization";

export default function Page() {
  const searchParameters = useSearchParams();
  const step = searchParameters.get("step");
  return step === "1" ? (
    <GeneralInfoForm />
  ) : step === "2" ? (
    <PersonalizationForm />
  ) : step === "3" ? (
    <CoorganizersForm />
  ) : step === "4" ? (
    <AttributesForm />
  ) : step === "5" ? (
    "WIP"
  ) : null;
}
