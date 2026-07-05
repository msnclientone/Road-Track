"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

import { COUNTRY_CODE, PHONE_DIGITS, sanitizePhone, validatePhone } from "@/lib/phone";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  label?: string;
  showIcon?: boolean;
  error?: string | null;
  onError?: (error: string | null) => void;
  className?: string;
  inputClassName?: string;
  prefixClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  wrapperClassName?: string;
};

export default function PhoneInput({
  value,
  onChange,
  required = false,
  placeholder = "9876543210",
  label,
  showIcon = false,
  error: externalError,
  onError,
  className = "",
  inputClassName = "",
  prefixClassName = "",
  iconClassName = "",
  labelClassName = "",
  wrapperClassName = "",
}: PhoneInputProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const displayError = externalError ?? internalError;

  function handleChange(raw: string) {
    const sanitized = sanitizePhone(raw);
    onChange(sanitized);

    const err = required && sanitized.length > 0 ? validatePhone(sanitized) : null;
    setInternalError(err);
    onError?.(err);
  }

  function handleBlur() {
    if (required && value) {
      const err = validatePhone(value);
      setInternalError(err);
      onError?.(err);
    }
  }

  return (
    <div className={wrapperClassName}>
      {label ? (
        <p className={`mb-1 text-sm font-black ${labelClassName}`}>{label}</p>
      ) : null}
      <div className={`relative ${className}`}>
        {showIcon ? (
          <Phone className={`pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-stone ${iconClassName}`} />
        ) : null}
        <div className={`flex ${showIcon ? "pl-11" : ""}`}>
          <span
            className={`inline-flex items-center border border-r-0 border-ink/15 bg-ivory px-3 text-base font-semibold text-stone ${
              showIcon ? "" : "rounded-l-md"
            } ${prefixClassName}`}
          >
            {COUNTRY_CODE}
          </span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={PHONE_DIGITS}
            required={required}
            className={`flex-1 rounded-r-md border border-ink/15 px-3 text-base outline-none focus:border-coral ${
              showIcon ? "h-12" : "h-11"
            } ${inputClassName}`}
          />
        </div>
      </div>
      {displayError ? (
        <p className="mt-1 text-xs font-semibold text-coral">{displayError}</p>
      ) : null}
    </div>
  );
}
