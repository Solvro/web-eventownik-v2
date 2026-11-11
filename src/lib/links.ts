import type { EventLink } from "@/types/link";

export function parseLinks(links: EventLink[]) {
  const result =
    links.length > 0
      ? {
          generalLinks: links.filter((link) => link.type === "general"),
          policyLink: links.find((link) => link.type === "policy"),
        }
      : {};
  return result;
}
