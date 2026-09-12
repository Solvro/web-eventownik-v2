import { legacyTranslate } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";

import { EMAIL_TARGET, SKIP_TARGET } from "./types";
import type { MappingTarget } from "./types";

const EMAIL_HEADER_KEYS = new Set(
  [
    "email",
    "e-mail",
    "mail",
    "adres email",
    "adres e-mail",
    "email address",
  ].map((value) => getMatchKey(value)),
);
const ATTRIBUTE_ALIAS_GROUPS = [
  [
    "first name",
    "firstname",
    "first_name",
    "given name",
    "imie",
    "imię",
    "imiona",
  ],
  ["last name", "lastname", "last_name", "surname", "family name", "nazwisko"],
  [
    "full name",
    "fullname",
    "full_name",
    "name",
    "imie i nazwisko",
    "imię i nazwisko",
    "imie nazwisko",
    "imię nazwisko",
  ],
  ["phone", "phone number", "tel", "telephone", "telefon", "nr telefonu"],
  ["age", "wiek"],
  ["ticket", "ticket type", "ticket_type", "bilet", "typ biletu"],
  ["workshop", "warsztat", "warsztaty"],
  ["newsletter", "mailing", "zgoda marketingowa"],
].map((aliases) => aliases.map((alias) => getMatchKey(alias)));

export function getAttributeTarget(attributeId: number): `attr:${number}` {
  return `attr:${String(attributeId)}` as `attr:${number}`;
}

function getMatchKey(value: string) {
  return value
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036F]/g, "")
    .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replaceAll("&", "and")
    .replaceAll(/[^a-z0-9]+/g, "");
}

function getAttributeMatchKeys(attribute: Attribute) {
  const keys = new Set(
    [
      legacyTranslate(attribute.name, "pl"),
      legacyTranslate(attribute.name, "en"),
      attribute.slug ?? "",
    ]
      .filter((value) => value !== "")
      .map((value) => getMatchKey(value)),
  );

  for (const aliasGroup of ATTRIBUTE_ALIAS_GROUPS) {
    if (aliasGroup.some((alias) => keys.has(alias))) {
      for (const alias of aliasGroup) {
        keys.add(alias);
      }
    }
  }

  return keys;
}

export function guessInitialMappings(
  headers: string[],
  attributes: Attribute[],
) {
  const mappings: Record<number, MappingTarget> = {};
  const usedTargets = new Set<MappingTarget>();

  for (const [index, header] of headers.entries()) {
    const headerKey = getMatchKey(header);
    if (EMAIL_HEADER_KEYS.has(headerKey)) {
      mappings[index] = EMAIL_TARGET;
      usedTargets.add(EMAIL_TARGET);
      continue;
    }

    const matchingAttribute = attributes.find((attribute) =>
      getAttributeMatchKeys(attribute).has(headerKey),
    );

    if (matchingAttribute != null) {
      const target = getAttributeTarget(matchingAttribute.id);
      mappings[index] = usedTargets.has(target) ? SKIP_TARGET : target;
      usedTargets.add(target);
      continue;
    }

    mappings[index] = SKIP_TARGET;
  }

  return mappings;
}

export function getMappedAttribute(
  target: MappingTarget,
  attributes: Attribute[],
) {
  if (target === EMAIL_TARGET || target === SKIP_TARGET) {
    return null;
  }

  const attributeId = Number(target.replace("attr:", ""));
  return attributes.find((attribute) => attribute.id === attributeId) ?? null;
}
