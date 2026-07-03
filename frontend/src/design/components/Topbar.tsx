import { type ReactNode } from "react";
import { Bell, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { layout } from "../layout";
import { IconButton } from "./Button";

export interface TopbarProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  notifications?: ReactNode;
  profile?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Topbar({
  searchPlaceholder = "Search...",
  onSearch,
  notifications,
  profile,
  actions,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "flex items-center gap-4 px-4 lg:px-6 border-b border-ds-border bg-ds-surface/80 backdrop-blur-xl shrink-0",
        className
      )}
      style={{ height: layout.topbar.height }}
      role="banner"
    >
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ds-text-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-ds-glass border border-ds-border text-sm text-ds-text-primary placeholder:text-ds-text-muted focus:outline-none focus:ring-2 focus:ring-ds-focus/30 focus:border-ds-focus transition-all"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {actions}
        {notifications ?? (
          <IconButton aria-label="Notifications" variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </IconButton>
        )}
        {profile}
      </div>
    </header>
  );
}
