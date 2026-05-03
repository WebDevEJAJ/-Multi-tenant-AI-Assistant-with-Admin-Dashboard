"use client";

interface ActivityItem {
  _id: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface RecentActivityProps {
  title: string;
  data: ActivityItem[] | null;
}

export function RecentActivity({ title, data }: RecentActivityProps) {
  const activities = (data ?? []) as ActivityItem[];

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="glass-card p-6 fade-in" data-testid="recent-activity-widget">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm" style={{ color: "rgb(var(--color-text-muted))" }}>
            No recent activity
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={activity._id}
              className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/5"
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: "rgba(var(--color-primary), 0.15)",
                  color: "rgb(var(--color-primary))",
                }}
              >
                {activity.user?.name?.charAt(0) ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {activity.title}
                </div>
                <div
                  className="text-xs flex items-center gap-2"
                  style={{ color: "rgb(var(--color-text-muted))" }}
                >
                  <span>{activity.user?.name ?? "Unknown"}</span>
                  <span>•</span>
                  <span>{activity.messageCount} messages</span>
                </div>
              </div>
              <span
                className="text-xs shrink-0"
                style={{ color: "rgb(var(--color-text-muted))" }}
              >
                {formatRelativeTime(activity.lastMessageAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
