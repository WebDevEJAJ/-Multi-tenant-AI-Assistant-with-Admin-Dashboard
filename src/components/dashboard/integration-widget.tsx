"use client";

interface IntegrationWidgetProps {
  title: string;
  data: { shopify: boolean; crm: boolean } | null;
  projectId: string;
}

export function IntegrationWidget({ title, data, projectId }: IntegrationWidgetProps) {
  const integrations = data ?? { shopify: false, crm: false };

  const items = [
    {
      name: "Shopify",
      description: "E-commerce orders, revenue & product analytics",
      enabled: integrations.shopify,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.054-.121-.074l-.914 21.104zm-1.332-17.446c0-.15-.014-.27-.014-.405 0-.405-.211-.622-.481-.622-.27 0-.71.189-.71.189l-.338.782s.405-.189.54-.189c.135 0 .189.054.189.189 0 .081-.013.189-.013.324-.405.082-.856.189-1.305.324-.27-.81-.734-1.364-1.385-1.364-.955 0-1.71 1.197-1.926 2.916-.399.121-.804.243-1.187.364.335-1.275.83-2.592 1.654-3.456.945-.99 2.04-1.23 2.618-1.23 1.965 0 2.876 1.751 3.135 3.176-.399.095-.775.189-1.18.296l.403-.294z" />
        </svg>
      ),
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "CRM",
      description: "Lead tracking, pipeline & conversion analytics",
      enabled: integrations.crm,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-600",
    },
  ];

  return (
    <div className="glass-card p-6 fade-in" data-testid="integration-widget">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-4 p-4 rounded-xl transition-all"
            style={{
              background: item.enabled
                ? "rgba(var(--color-success), 0.08)"
                : "rgba(var(--color-surface-2), 0.5)",
              border: item.enabled
                ? "1px solid rgba(var(--color-success), 0.2)"
                : "1px solid rgba(var(--color-border), 0.3)",
            }}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shrink-0 ${
                !item.enabled ? "opacity-40" : ""
              }`}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{item.name}</span>
                <span
                  className={`status-badge text-[10px] ${
                    item.enabled ? "status-badge--active" : "status-badge--inactive"
                  }`}
                >
                  {item.enabled ? "Active" : "Inactive"}
                </span>
              </div>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgb(var(--color-text-muted))" }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p
        className="text-xs mt-4"
        style={{ color: "rgb(var(--color-text-muted))" }}
      >
        Toggle integrations via the API to change AI context injection.
      </p>
    </div>
  );
}
