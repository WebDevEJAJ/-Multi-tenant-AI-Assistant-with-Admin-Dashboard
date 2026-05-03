"use client";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserListWidgetProps {
  title: string;
  data: UserItem[] | null;
}

export function UserListWidget({ title, data }: UserListWidgetProps) {
  const users = (data ?? []) as UserItem[];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "status-badge--active";
      case "member":
        return "status-badge--warning";
      default:
        return "status-badge--inactive";
    }
  };

  const getAvatarGradient = (index: number) => {
    const gradients = [
      "from-indigo-500 to-purple-600",
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-blue-500 to-cyan-600",
      "from-pink-500 to-rose-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="glass-card p-6 fade-in" data-testid="user-list-widget">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {users.length === 0 ? (
        <p
          className="text-sm text-center py-4"
          style={{ color: "rgb(var(--color-text-muted))" }}
        >
          No team members
        </p>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(index)} flex items-center justify-center text-white text-sm font-bold shrink-0`}
              >
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{user.name}</div>
                <div
                  className="text-xs truncate"
                  style={{ color: "rgb(var(--color-text-muted))" }}
                >
                  {user.email}
                </div>
              </div>
              <span className={`status-badge text-[10px] ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
