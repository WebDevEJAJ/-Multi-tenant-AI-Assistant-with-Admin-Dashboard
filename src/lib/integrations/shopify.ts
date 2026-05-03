/**
 * SHOPIFY INTEGRATION (SIMULATED)
 *
 * Provides mock Shopify data (orders, revenue, products)
 * that gets injected into AI prompts when the Shopify
 * integration is enabled for a product instance.
 */

export interface ShopifyOrder {
  id: string;
  customerName: string;
  total: number;
  status: "pending" | "fulfilled" | "cancelled" | "refunded";
  items: { name: string; qty: number; price: number }[];
  createdAt: string;
}

export interface ShopifyDashboardData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: ShopifyOrder[];
  topProducts: { name: string; sales: number; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

// ─── Mock Data Generator ───
export function getShopifyData(): ShopifyDashboardData {
  const recentOrders: ShopifyOrder[] = [
    {
      id: "SHP-1001",
      customerName: "Alice Johnson",
      total: 129.99,
      status: "fulfilled",
      items: [
        { name: "Wireless Headphones", qty: 1, price: 89.99 },
        { name: "Phone Case", qty: 2, price: 20.0 },
      ],
      createdAt: "2026-05-02T14:30:00Z",
    },
    {
      id: "SHP-1002",
      customerName: "Bob Smith",
      total: 249.5,
      status: "pending",
      items: [
        { name: "Smart Watch", qty: 1, price: 199.5 },
        { name: "Watch Band", qty: 1, price: 50.0 },
      ],
      createdAt: "2026-05-02T10:15:00Z",
    },
    {
      id: "SHP-1003",
      customerName: "Carol Williams",
      total: 75.0,
      status: "fulfilled",
      items: [{ name: "Bluetooth Speaker", qty: 1, price: 75.0 }],
      createdAt: "2026-05-01T16:45:00Z",
    },
    {
      id: "SHP-1004",
      customerName: "David Brown",
      total: 450.0,
      status: "fulfilled",
      items: [{ name: "Laptop Stand Pro", qty: 3, price: 150.0 }],
      createdAt: "2026-05-01T09:20:00Z",
    },
    {
      id: "SHP-1005",
      customerName: "Eve Davis",
      total: 32.99,
      status: "cancelled",
      items: [{ name: "USB-C Cable Pack", qty: 1, price: 32.99 }],
      createdAt: "2026-04-30T20:00:00Z",
    },
  ];

  return {
    totalOrders: 1247,
    totalRevenue: 89432.5,
    averageOrderValue: 71.72,
    recentOrders,
    topProducts: [
      { name: "Wireless Headphones", sales: 342, revenue: 30758.58 },
      { name: "Smart Watch", sales: 198, revenue: 39501.0 },
      { name: "Bluetooth Speaker", sales: 276, revenue: 20700.0 },
      { name: "Laptop Stand Pro", sales: 89, revenue: 13350.0 },
      { name: "Phone Case", sales: 456, revenue: 9120.0 },
    ],
    monthlyRevenue: [
      { month: "Jan", revenue: 12450 },
      { month: "Feb", revenue: 15200 },
      { month: "Mar", revenue: 13800 },
      { month: "Apr", revenue: 18900 },
      { month: "May", revenue: 29082.5 },
    ],
  };
}

/**
 * Format Shopify data as context string for AI prompt injection.
 */
export function formatShopifyContext(): string {
  const data = getShopifyData();

  return `
[SHOPIFY INTEGRATION DATA]
Store Performance:
- Total Orders: ${data.totalOrders}
- Total Revenue: $${data.totalRevenue.toLocaleString()}
- Average Order Value: $${data.averageOrderValue}

Top Products:
${data.topProducts.map((p) => `  • ${p.name}: ${p.sales} sales, $${p.revenue.toLocaleString()} revenue`).join("\n")}

Monthly Revenue Trend:
${data.monthlyRevenue.map((m) => `  • ${m.month}: $${m.revenue.toLocaleString()}`).join("\n")}

Recent Orders:
${data.recentOrders
  .slice(0, 3)
  .map((o) => `  • ${o.id} - ${o.customerName}: $${o.total} (${o.status})`)
  .join("\n")}
[END SHOPIFY DATA]
`.trim();
}
