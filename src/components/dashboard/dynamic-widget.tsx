/**
 * DYNAMIC WIDGET RENDERER
 *
 * This is the core of the config-driven dashboard.
 * It maps widget types from the MongoDB config to
 * actual React components. Adding a new widget type
 * here automatically makes it available in the config.
 *
 * When the MongoDB `adminDashboardConfig` document changes,
 * the dashboard UI changes WITHOUT any code modifications.
 */

"use client";

import { StatsCard } from "./stats-card";
import { IntegrationWidget } from "./integration-widget";
import { RecentActivity } from "./recent-activity";
import { ProjectInfo } from "./project-info";
import { UserListWidget } from "./user-list";

interface Widget {
  id: string;
  type: string;
  title: string;
  source?: string;
  size: "small" | "medium" | "large" | "full";
  order: number;
  config?: Record<string, unknown>;
  isVisible: boolean;
  data: unknown;
}

interface DynamicWidgetProps {
  widget: Widget;
  projectId: string;
}

// ─── Widget Type Registry ───
const WIDGET_COMPONENTS: Record<
  string,
  React.FC<{ title: string; data: unknown; source?: string; projectId: string }>
> = {
  stats_card: ({ title, data, source }) => (
    <StatsCard title={title} value={data} source={source} />
  ),
  integration_status: ({ title, data, projectId }) => (
    <IntegrationWidget
      title={title}
      data={data as { shopify: boolean; crm: boolean } | null}
      projectId={projectId}
    />
  ),
  recent_activity: ({ title, data }) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <RecentActivity title={title} data={data as any} />
  ),
  project_info: ({ title, data }) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <ProjectInfo title={title} data={data as any} />
  ),
  user_list: ({ title, data }) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <UserListWidget title={title} data={data as any} />
  ),
  chart: ({ title, data }) => (
    <ChartWidget title={title} data={data} />
  ),
};

// ─── Simple Chart Widget ───
function ChartWidget({ title, data }: { title: string; data: unknown }) {
  const items = Array.isArray(data) ? data : [];
  const maxValue = Math.max(
    ...items.map((item: Record<string, unknown>) => {
      const val = (item.revenue ?? item.count ?? 0) as number;
      return val;
    }),
    1
  );

  return (
    <div className="glass-card p-6 fade-in" data-testid="chart-widget">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item: Record<string, unknown>, index: number) => {
          const label = (item.month ?? item.source ?? `Item ${index}`) as string;
          const value = (item.revenue ?? item.count ?? 0) as number;
          const percentage = (value / maxValue) * 100;

          return (
            <div key={index}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "rgb(var(--color-text-secondary))" }}>
                  {label}
                </span>
                <span className="font-medium">
                  {typeof value === "number" && value > 100
                    ? `$${value.toLocaleString()}`
                    : value}
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(var(--color-surface-3), 0.5)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, rgb(var(--color-primary)), rgb(var(--color-accent)))`,
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Size to Grid Class Mapping ───
function getSizeClass(size: string): string {
  switch (size) {
    case "small":
      return "col-span-1";
    case "medium":
      return "col-span-1 md:col-span-2 lg:col-span-1";
    case "large":
      return "col-span-1 md:col-span-2";
    case "full":
      return "col-span-1 md:col-span-2";
    default:
      return "col-span-1";
  }
}

// ─── Dynamic Widget ───
export function DynamicWidget({ widget, projectId }: DynamicWidgetProps) {
  const WidgetComponent = WIDGET_COMPONENTS[widget.type];

  if (!WidgetComponent) {
    return (
      <div className={getSizeClass(widget.size)}>
        <div className="glass-card p-6">
          <p className="text-sm" style={{ color: "rgb(var(--color-text-muted))" }}>
            Unknown widget type: <code>{widget.type}</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={getSizeClass(widget.size)}>
      <WidgetComponent
        title={widget.title}
        data={widget.data}
        source={widget.source}
        projectId={projectId}
      />
    </div>
  );
}
