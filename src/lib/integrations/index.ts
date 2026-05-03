export { getShopifyData, formatShopifyContext } from "./shopify";
export type { ShopifyOrder, ShopifyDashboardData } from "./shopify";

export { getCRMData, formatCRMContext } from "./crm";
export type { CRMLead, CRMDashboardData } from "./crm";

import { formatShopifyContext } from "./shopify";
import { formatCRMContext } from "./crm";

/**
 * Get all integration context based on enabled toggles.
 * Returns a formatted string to inject into AI prompts.
 */
export function getIntegrationContext(integrations: {
  shopify: boolean;
  crm: boolean;
}): string {
  const contexts: string[] = [];

  if (integrations.shopify) {
    contexts.push(formatShopifyContext());
  }

  if (integrations.crm) {
    contexts.push(formatCRMContext());
  }

  if (contexts.length === 0) {
    return "";
  }

  return `\n\nYou have access to the following business data. Use it to provide relevant, data-driven insights when answering questions:\n\n${contexts.join("\n\n")}`;
}
