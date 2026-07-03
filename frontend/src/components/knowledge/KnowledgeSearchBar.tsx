import { Search } from "lucide-react";

interface KnowledgeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function KnowledgeSearchBar({
  value,
  onChange,
  placeholder = "Search by title, description, file name, or content...",
}: KnowledgeSearchBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-surface-card/50 backdrop-blur-xl px-4 py-3 shadow-card">
      <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
      />
    </div>
  );
}
