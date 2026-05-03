/**
 * CRM INTEGRATION (SIMULATED)
 *
 * Provides mock CRM data (leads, contacts, pipeline)
 * that gets injected into AI prompts when the CRM
 * integration is enabled for a product instance.
 */

export interface CRMLead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  value: number;
  source: string;
  lastContactedAt: string;
}

export interface CRMDashboardData {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  pipelineValue: number;
  recentLeads: CRMLead[];
  leadsByStatus: { status: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
}

// ─── Mock Data Generator ───
export function getCRMData(): CRMDashboardData {
  const recentLeads: CRMLead[] = [
    {
      id: "CRM-2001",
      name: "TechCorp Inc.",
      email: "john@techcorp.com",
      company: "TechCorp Inc.",
      status: "qualified",
      value: 25000,
      source: "Website",
      lastContactedAt: "2026-05-02T11:00:00Z",
    },
    {
      id: "CRM-2002",
      name: "GreenLeaf Solutions",
      email: "sarah@greenleaf.io",
      company: "GreenLeaf Solutions",
      status: "proposal",
      value: 45000,
      source: "Referral",
      lastContactedAt: "2026-05-01T15:30:00Z",
    },
    {
      id: "CRM-2003",
      name: "DataFlow Analytics",
      email: "mike@dataflow.com",
      company: "DataFlow Analytics",
      status: "new",
      value: 15000,
      source: "LinkedIn",
      lastContactedAt: "2026-05-01T09:00:00Z",
    },
    {
      id: "CRM-2004",
      name: "CloudNine Services",
      email: "lisa@cloudnine.dev",
      company: "CloudNine Services",
      status: "contacted",
      value: 32000,
      source: "Cold Email",
      lastContactedAt: "2026-04-30T14:00:00Z",
    },
    {
      id: "CRM-2005",
      name: "InnovateTech",
      email: "raj@innovatetech.com",
      company: "InnovateTech",
      status: "won",
      value: 58000,
      source: "Conference",
      lastContactedAt: "2026-04-29T10:00:00Z",
    },
  ];

  return {
    totalLeads: 342,
    qualifiedLeads: 87,
    conversionRate: 23.4,
    pipelineValue: 1250000,
    recentLeads,
    leadsByStatus: [
      { status: "New", count: 45 },
      { status: "Contacted", count: 78 },
      { status: "Qualified", count: 87 },
      { status: "Proposal", count: 42 },
      { status: "Won", count: 65 },
      { status: "Lost", count: 25 },
    ],
    leadsBySource: [
      { source: "Website", count: 120 },
      { source: "Referral", count: 85 },
      { source: "LinkedIn", count: 62 },
      { source: "Cold Email", count: 45 },
      { source: "Conference", count: 30 },
    ],
  };
}

/**
 * Format CRM data as context string for AI prompt injection.
 */
export function formatCRMContext(): string {
  const data = getCRMData();

  return `
[CRM INTEGRATION DATA]
Lead Pipeline Overview:
- Total Leads: ${data.totalLeads}
- Qualified Leads: ${data.qualifiedLeads}
- Conversion Rate: ${data.conversionRate}%
- Pipeline Value: $${data.pipelineValue.toLocaleString()}

Leads by Status:
${data.leadsByStatus.map((s) => `  • ${s.status}: ${s.count}`).join("\n")}

Leads by Source:
${data.leadsBySource.map((s) => `  • ${s.source}: ${s.count}`).join("\n")}

Recent Leads:
${data.recentLeads
  .slice(0, 3)
  .map(
    (l) =>
      `  • ${l.id} - ${l.company}: $${l.value.toLocaleString()} (${l.status})`
  )
  .join("\n")}
[END CRM DATA]
`.trim();
}
