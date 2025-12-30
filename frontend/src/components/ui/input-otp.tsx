import * as React from "react";
import { cn } from "@/lib/utils";

interface InputOTPProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  (
    { length = 6, value, onChange, onComplete, disabled, className },
    ref
  ) => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, inputValue: string) => {
      if (disabled) return;

      // Only allow digits
      const digit = inputValue.replace(/[^0-9]/g, "");
      
      if (digit.length === 0) {
        // Handle backspace
        const newValue = value.substring(0, index) + value.substring(index + 1);
        onChange(newValue);
        
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
          setActiveIndex(index - 1);
        }
        return;
      }

      // Handle paste
      if (digit.length > 1) {
        const pastedValue = digit.slice(0, length);
        onChange(pastedValue);
        
        const nextIndex = Math.min(pastedValue.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
        setActiveIndex(nextIndex);
        
        if (pastedValue.length === length) {
          onComplete?.(pastedValue);
        }
        return;
      }

      // Normal single digit input
      const newValue = 
        value.substring(0, index) + 
        digit + 
        value.substring(index + 1);
      
      onChange(newValue);

      // Move to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }

      // Check if complete
      if (newValue.length === length) {
        onComplete?.(newValue);
      }
    };

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (disabled) return;

      if (e.key === "Backspace" && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      } else if (e.key === "ArrowRight" && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }
    };

    const handleFocus = (index: number) => {
      setActiveIndex(index);
      // Select the content on focus
      inputRefs.current[index]?.select();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text");
      const digits = pastedData.replace(/[^0-9]/g, "").slice(0, length);
      
      onChange(digits);
      
      const nextIndex = Math.min(digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setActiveIndex(nextIndex);
      
      if (digits.length === length) {
        onComplete?.(digits);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex gap-2 justify-center", className)}
        onPaste={handlePaste}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={cn(
              "w-12 h-12 text-center text-2xl font-mono font-semibold",
              "border-2 rounded-lg",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
              activeIndex === index && "border-primary",
              disabled && "opacity-50 cursor-not-allowed bg-gray-100",
              !disabled && "hover:border-gray-400"
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
    );
  }
);

InputOTP.displayName = "InputOTP";
