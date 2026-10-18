import type { EventLink } from "@/types/link";

export function parseLinks(links: EventLink[]) {
  return {
    generalLinks: links.filter((link) => link.type === "general"),
    policyLink: links.find((link) => link.type === "policy"),
  };
}
