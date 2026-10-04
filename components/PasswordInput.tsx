"use client";

import { useState, type ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
  name?: string;
  /**
   * Optional native length floor. Omitted by every caller that does not pass
   * it, so other forms keep the browser's default behaviour unchanged.
   */
  minLength?: number;
  autoComplete?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  className?: string;
}

/**
 * Password field with a visibility toggle.
 *
 * The eye button reveals the password in two ways:
 *  - a single click latches it open (click again to hide)
 *  - pressing and holding the button reveals the value for as long as it is
 *    held, then releases back to the previous state
 *
 * `autoComplete` follows the visible state so password managers treat a
 * revealed field the same way they would a plain text field.
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
  disabled,
  autoFocus,
  id,
  name,
  minLength,
  autoComplete = "current-password",
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  className = "",
}: PasswordInputProps) {
  // Latched open by a click.
  const [revealed, setRevealed] = useState(false);
  // Temporarily open while the button is physically held down.
  const [holding, setHolding] = useState(false);

  const visible = revealed || holding;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        minLength={minLength}
        type={visible ? "text" : "password"}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        autoComplete={visible ? "off" : autoComplete}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B] outline-none transition-all placeholder:text-slate-400 font-sans disabled:opacity-60 pr-11 ${className}`}
      />
      <button
        type="button"
        onPointerDown={(event) => {
          // Keep focus in the input so the caret is not lost mid-typing.
          event.preventDefault();
          setHolding(true);
        }}
        onPointerUp={() => setHolding(false)}
        onPointerLeave={() => setHolding(false)}
        onPointerCancel={() => setHolding(false)}
        onClick={() => setRevealed((previous) => !previous)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-slate-400 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16233B] focus-visible:ring-inset rounded-r-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {visible ? (
          <EyeOff className="w-4 h-4 pointer-events-none" aria-hidden="true" />
        ) : (
          <Eye className="w-4 h-4 pointer-events-none" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
