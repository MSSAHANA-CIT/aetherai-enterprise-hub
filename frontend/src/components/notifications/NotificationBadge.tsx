interface NotificationBadgeProps {
  type: string;
  className?: string;
}

const TYPE_STYLES: Record<string, string> = {
  security: "bg-red-500/15 text-red-300 border-red-500/25",
  task: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  chat: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  document: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  ai: "bg-aether-500/15 text-aether-300 border-aether-500/25",
  system: "bg-gray-500/15 text-gray-300 border-gray-500/25",
};

export default function NotificationBadge({ type, className = "" }: NotificationBadgeProps) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.system;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${style} ${className}`}
    >
      {type}
    </span>
  );
}
