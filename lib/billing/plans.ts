export type AccountTier = "free" | "pro" | "enterprise";

export const ACCOUNT_TIER_LABELS: Record<AccountTier, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const getTierPrice = (tier: Exclude<AccountTier, "free">) => {
  const envValue = tier === "pro"
    ? process.env.ACCOUNT_UPGRADE_PRO_PRICE
    : process.env.ACCOUNT_UPGRADE_ENTERPRISE_PRICE;
  const parsed = Number.parseFloat(envValue ?? "");
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return tier === "pro" ? 49 : 199;
};
