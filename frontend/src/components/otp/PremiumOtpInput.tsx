import {
  useRef,
  useState,
  useEffect,
  useCallback,
  memo,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface PremiumOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  success?: boolean;
}

const OTP_LENGTH = 6;

function PremiumOtpInput({
  value,
  onChange,
  disabled = false,
  error,
  success = false,
}: PremiumOtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const isComplete = value.length === OTP_LENGTH;

  const digits = value.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const updateValue = useCallback(
    (index: number, digit: string) => {
      const chars = value.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH);
      chars[index] = digit;
      const next = chars.join("").replace(/\s/g, "").slice(0, OTP_LENGTH);
      onChange(next);
    },
    [value, onChange]
  );

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
      <motion.div
        className="flex justify-center gap-2 sm:gap-3"
        role="group"
        aria-label="6-digit verification code"
        animate={error && !reducedMotion ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {digits.map((digit, index) => {
          const isFocused = focusedIndex === index;
          const isFilled = !!digit.trim();

          return (
            <motion.div
              key={index}
              className="relative"
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
            >
              {/* Focus glow */}
              <AnimatePresence>
                {isFocused && !error && (
                  <motion.div
                    className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-aether-500/30 to-purple-500/30 blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {/* Success glow */}
              {success && isFilled && (
                <motion.div
                  className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                disabled={disabled}
                value={digit.trim()}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={() => setFocusedIndex(index)}
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                className={cn(
                  "relative z-10 w-11 h-14 sm:w-[52px] sm:h-[60px] text-center text-xl sm:text-2xl font-semibold rounded-2xl",
                  "bg-white/[0.04] backdrop-blur-sm border-2 text-white",
                  "focus:outline-none transition-all duration-300",
                  error
                    ? "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                    : success && isFilled
                      ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : isFocused
                        ? "border-aether-400/60 shadow-[0_0_24px_rgba(99,102,241,0.2)]"
                        : isFilled
                          ? "border-aether-500/30"
                          : "border-white/[0.08]",
                  disabled && "opacity-50 cursor-not-allowed",
                  isComplete && !error && !success && "border-aether-400/40"
                )}
              />

              {/* Bottom accent line */}
              <motion.div
                className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full",
                  error ? "bg-red-400" : success ? "bg-emerald-400" : "bg-gradient-to-r from-aether-400 to-purple-400"
                )}
                initial={{ width: 0 }}
                animate={{ width: isFocused || isFilled ? "60%" : 0 }}
                transition={{ duration: 0.25 }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            id="otp-error"
            role="alert"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="text-sm text-red-400 text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(PremiumOtpInput);
