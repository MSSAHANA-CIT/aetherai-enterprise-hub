import { type ReactNode } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Spinner } from "./Loading";
import { EmptyState } from "./EmptyState";

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  stickyHeader?: boolean;
  className?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string) => void;
  sortKey?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyTitle = "No data",
  emptyDescription,
  stickyHeader = true,
  className,
  page = 1,
  totalPages = 1,
  onPageChange,
  onSort,
  sortKey,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-ds-border", className)}>
      <div className="overflow-x-auto ds-scrollbar">
        <table className="w-full text-sm" role="table">
          <TableHeader sticky={stickyHeader}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-ds-text-muted uppercase tracking-wide bg-ds-surface-raised border-b border-ds-border",
                    col.sortable && "cursor-pointer select-none hover:text-ds-text-secondary",
                    col.className
                  )}
                  onClick={col.sortable ? () => onSort?.(col.key) : undefined}
                  aria-sort={sortKey === col.key ? "ascending" : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="w-3 h-3 opacity-50" aria-hidden="true" />}
                  </span>
                </th>
              ))}
            </tr>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-ds-border bg-ds-surface-raised">
          <span className="text-xs text-ds-text-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-hover disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg text-ds-text-muted hover:text-ds-text-primary hover:bg-ds-hover disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TableHeader({
  children,
  sticky,
  className,
}: {
  children: ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return <thead className={cn(sticky && "sticky top-0 z-10", className)}>{children}</thead>;
}

export function TableBody({ children, className }: { children: ReactNode; className?: string }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("border-b border-ds-border last:border-0 hover:bg-ds-hover transition-colors", className)}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-ds-text-secondary", className)}>{children}</td>;
}
