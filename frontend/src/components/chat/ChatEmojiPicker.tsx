import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

interface ChatEmojiPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  anchorRef?: RefObject<HTMLElement | null>;
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😊", "🎉", "🔥", "✅", "👀", "🙏", "💯", "😍", "🚀"];

const EMOJI_CATEGORIES: Array<{ label: string; emojis: string[] }> = [
  {
    label: "Smileys",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗",
      "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐",
      "😑", "😶", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
    ],
  },
  {
    label: "Gestures",
    emojis: [
      "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✌️", "🤞", "🤟", "🤘",
      "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪", "🦾",
    ],
  },
  {
    label: "Hearts",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗"],
  },
  {
    label: "Work",
    emojis: ["💼", "📎", "📌", "📋", "📊", "📈", "📉", "🗂️", "📁", "📂", "🗃️", "📝", "✏️", "🖊️", "📅", "⏰", "✅", "❌", "⚠️", "💡", "🎯", "🚀", "🏆", "🔔"],
  },
  {
    label: "Celebration",
    emojis: ["🎉", "🎊", "🥳", "🎈", "🎁", "🏅", "🥇", "🍾", "🥂", "✨", "💫", "⭐", "🌟", "🔥", "💯", "👑"],
  },
  {
    label: "Objects",
    emojis: ["📱", "💻", "🖥️", "⌨️", "🖱️", "📷", "🎥", "🎧", "🎤", "📞", "☕", "🍕", "🍔", "🌮", "⚽", "🏀", "🎮", "🎵", "🎬", "📚"],
  },
];

export default function ChatEmojiPicker({ open, onClose, onSelect, anchorRef }: ChatEmojiPickerProps) {
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;
      onClose();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, anchorRef]);

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return EMOJI_CATEGORIES;
    }

    return EMOJI_CATEGORIES.map((category) => ({
      ...category,
      emojis: category.emojis.filter((emoji) => emoji.includes(normalized) || category.label.toLowerCase().includes(normalized)),
    })).filter((category) => category.emojis.length > 0);
  }, [query]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 z-50 w-80 rounded-2xl border border-white/[0.1] bg-[#1a1625]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-white/[0.06]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search emojis..."
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-aether-500/40"
                />
              </div>
            </div>

            <div className="px-3 pt-3 pb-2 border-b border-white/[0.06]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Quick</p>
              <div className="flex flex-wrap gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onSelect(emoji);
                      onClose();
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-white/[0.08] text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto p-3 space-y-3">
              {filteredCategories.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No emojis found</p>
              ) : (
                filteredCategories.map((category) => (
                  <div key={category.label}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      {category.label}
                    </p>
                    <div className="grid grid-cols-8 gap-0.5">
                      {category.emojis.map((emoji) => (
                        <button
                          key={`${category.label}-${emoji}`}
                          type="button"
                          onClick={() => {
                            onSelect(emoji);
                            onClose();
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-white/[0.08] text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
