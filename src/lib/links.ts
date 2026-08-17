import type { EventLink } from "@/types/link";

export function ParseLinks(links: EventLink[]) {
  const res =
    links && links.length > 0
      ? {
          generalLinks: links.filter(
            (link) => link.type === "general" && link.label != undefined,
          ),
          policyLink: links.find((link) => link.type === "policy"),
        }
      : {};
  return res;
}
