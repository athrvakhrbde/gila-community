export const SUBCOMMUNITIES = [
  {
    slug: "general",
    name: "Diabetes",
    shortLabel: "Diabetes",
    description: "Type 1, type 2, and gestational diabetes peer support.",
  },
  {
    slug: "pcos",
    name: "PCOS",
    shortLabel: "PCOS",
    description: "Peer support for polycystic ovary syndrome.",
  },
  {
    slug: "obesity",
    name: "Obesity",
    shortLabel: "Obesity",
    description: "Weight, metabolic health, and everyday support.",
  },
] as const;

export type SubcommunitySlug = (typeof SUBCOMMUNITIES)[number]["slug"];

export function getSubcommunity(slug: string | undefined) {
  return SUBCOMMUNITIES.find((s) => s.slug === slug) ?? SUBCOMMUNITIES[0];
}

export function isSubcommunitySlug(value: string): value is SubcommunitySlug {
  return SUBCOMMUNITIES.some((s) => s.slug === value);
}
