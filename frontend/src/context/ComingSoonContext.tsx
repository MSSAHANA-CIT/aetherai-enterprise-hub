import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import ComingSoonModal from "../components/ui/ComingSoonModal";

interface ComingSoonOptions {
  title?: string;
  description?: string;
  feature?: string;
}

interface ComingSoonContextValue {
  openComingSoon: (options?: ComingSoonOptions) => void;
}

const ComingSoonContext = createContext<ComingSoonContextValue | null>(null);

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ComingSoonOptions>({});

  const openComingSoon = useCallback((next?: ComingSoonOptions) => {
    setOptions(next ?? {});
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openComingSoon }), [openComingSoon]);

  return (
    <ComingSoonContext.Provider value={value}>
      {children}
      <ComingSoonModal
        open={open}
        onClose={() => setOpen(false)}
        title={options.title}
        description={options.description}
        feature={options.feature}
      />
    </ComingSoonContext.Provider>
  );
}

export function useComingSoon(): ComingSoonContextValue {
  const context = useContext(ComingSoonContext);
  if (!context) {
    throw new Error("useComingSoon must be used within ComingSoonProvider");
  }
  return context;
}
