import { useRef, useState, useEffect, type ClipboardEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const OTP_LENGTH = 6;

export default function OtpInput({ value, onChange, disabled = false, error }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const digits = value.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const updateValue = (index: number, digit: string) => {
    const chars = value.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH);
    chars[index] = digit;
    const next = chars.join("").replace(/\s/g, "").slice(0, OTP_LENGTH);
    onChange(next);
  };

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, "").slice(-1);
    if (!digit) {
      updateValue(index, "");
      return;
    }

    updateValue(index, digit);
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]?.trim()) {
        updateValue(index, "");
        return;
      }
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
        updateValue(index - 1, "");
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    onChange(pasted);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
    setFocusedIndex(focusIndex);
  };

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            value={digit.trim()}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-semibold rounded-xl",
              "bg-white/[0.04] border text-white",
              "focus:outline-none focus:ring-2 focus:ring-aether-500/30 focus:border-aether-500/50",
              "transition-all duration-200",
              error
                ? "border-red-500/50"
                : focusedIndex === index
                  ? "border-aether-500/50 shadow-glow-sm"
                  : "border-white/[0.1]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        ))}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-xs text-red-400 text-center mt-3"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
