import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-lg px-3 py-2 text-sm transition-all",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:opacity-50",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "focus:outline-none",
          className
        )}
        style={{
          background: "var(--color-bg-dark)",
          border: "1px solid var(--color-border-medium)",
          color: "var(--color-accent)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--fs-body)",
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = "var(--color-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(241,133,53,0.15)";
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = "var(--color-border-medium)";
          e.currentTarget.style.boxShadow = "none";
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
