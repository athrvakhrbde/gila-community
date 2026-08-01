export const SUBCOMMUNITY_SLUGS = ["general", "pcos", "obesity"] as const;

export type SubcommunitySlug = (typeof SUBCOMMUNITY_SLUGS)[number];

export function isSubcommunitySlug(value: unknown): value is SubcommunitySlug {
  return (
    typeof value === "string" &&
    (SUBCOMMUNITY_SLUGS as readonly string[]).includes(value)
  );
}
