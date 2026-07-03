import { PageLoader } from "../../design/components/Loading";
import { cn } from "../../lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingState({
  message = "Loading workspace...",
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("py-8", className)}>
      <PageLoader message={message} />
    </div>
  );
}
