import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        /** Orange primary CTA */
        default:
          "bg-[#f18535] text-[#31251f] hover:bg-[#d97b2f] shadow-[0_4px_12px_rgba(241,133,53,0.3)] hover:shadow-[0_6px_18px_rgba(241,133,53,0.4)] focus-visible:ring-[#f18535]",
        /** Subtle bordered */
        outline:
          "border border-[rgba(216,197,182,0.3)] bg-transparent text-[#d8c5b6] hover:border-[#f18535] hover:text-[#f18535] hover:bg-[rgba(241,133,53,0.06)] focus-visible:ring-[#f18535]",
        /** No background */
        ghost:
          "bg-transparent text-[#d8c5b6] hover:bg-[rgba(216,197,182,0.07)] hover:text-[#e8d5c7] focus-visible:ring-[#f18535]",
        /** Secondary — dark layer */
        secondary:
          "bg-[#403530] text-[#d8c5b6] border border-[rgba(216,197,182,0.15)] hover:border-[rgba(241,133,53,0.3)] hover:bg-[#31251f] focus-visible:ring-[#f18535]",
        /** Destructive */
        destructive:
          "bg-[rgba(244,67,54,0.15)] border border-[rgba(244,67,54,0.35)] text-[#F44336] hover:bg-[rgba(244,67,54,0.25)] focus-visible:ring-[#F44336]",
        /** Success */
        success:
          "bg-[rgba(76,175,80,0.15)] border border-[rgba(76,175,80,0.35)] text-[#4CAF50] hover:bg-[rgba(76,175,80,0.25)] focus-visible:ring-[#4CAF50]",
        /** Link style */
        link: "text-[#f18535] underline-offset-4 hover:underline hover:text-[#f5a35f] p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm:      "h-8 px-3 py-1.5 text-xs",
        lg:      "h-11 px-6 py-2.5 text-sm",
        icon:    "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
