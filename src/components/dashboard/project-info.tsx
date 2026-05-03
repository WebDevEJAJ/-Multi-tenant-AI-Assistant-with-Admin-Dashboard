"use client";

interface ProjectInfoProps {
  title: string;
  data: {
    name: string;
    slug: string;
    description: string;
    aiModel: string;
    isActive: boolean;
    createdAt: string;
  } | null;
}

export function ProjectInfo({ title, data }: ProjectInfoProps) {
  if (!data) return null;

  const fields = [
    { label: "Name", value: data.name },
    { label: "Slug", value: `/${data.slug}` },
    { label: "AI Model", value: data.aiModel },
    { label: "Status", value: data.isActive ? "Active" : "Inactive", isStatus: true },
    {
      label: "Created",
      value: new Date(data.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ];

  return (
    <div className="glass-card p-6 fade-in" data-testid="project-info-widget">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {data.description && (
        <p
          className="text-sm mb-4"
          style={{ color: "rgb(var(--color-text-secondary))" }}
        >
          {data.description}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {fields.map((field) => (
          <div key={field.label}>
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "rgb(var(--color-text-muted))" }}
            >
              {field.label}
            </p>
            {"isStatus" in field && field.isStatus ? (
              <span
                className={`status-badge text-xs ${
                  data.isActive ? "status-badge--active" : "status-badge--inactive"
                }`}
              >
                {field.value}
              </span>
            ) : (
              <p className="text-sm font-medium">{field.value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
