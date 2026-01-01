import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 dark:bg-slate-700 dark:text-slate-200",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground dark:border-slate-600",
        // Glowing variants for game states
        "glow-amber":
          "border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)] dark:bg-amber-500/10 dark:border-amber-500/30",
        "glow-emerald":
          "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] dark:bg-emerald-500/10 dark:border-emerald-500/30",
        "glow-violet":
          "border-violet-500/40 bg-violet-500/15 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.3)] dark:bg-violet-500/10 dark:border-violet-500/30",
        "glow-rose":
          "border-rose-500/40 bg-rose-500/15 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)] dark:bg-rose-500/10 dark:border-rose-500/30",
        "glow-cyan":
          "border-cyan-500/40 bg-cyan-500/15 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] dark:bg-cyan-500/10 dark:border-cyan-500/30",
        // Status badges
        "status-positive":
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
        "status-negative":
          "border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-400",
        "status-neutral":
          "border-slate-500/30 bg-slate-500/10 text-slate-500 dark:text-slate-400",
        "status-warning":
          "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
