import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-orange-400 hover:-translate-y-0.5 dark:shadow-amber-500/20",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-500 hover:to-rose-500 hover:-translate-y-0.5",
        outline:
          "border-2 border-amber-500/40 bg-transparent text-foreground shadow-sm hover:bg-amber-500/10 hover:border-amber-500/70 hover:shadow-amber-500/20 dark:border-amber-500/30 dark:hover:border-amber-400/60",
        secondary:
          "bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 dark:hover:from-slate-600 dark:hover:to-slate-500",
        ghost:
          "hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400",
        link:
          "text-amber-600 dark:text-amber-400 underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-900 font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 hover:-translate-y-0.5",
        glow:
          "relative bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold before:absolute before:-inset-1 before:bg-gradient-to-r before:from-amber-500 before:to-orange-500 before:rounded-lg before:blur-lg before:opacity-40 before:transition-opacity hover:before:opacity-70 before:-z-10 z-10 hover:-translate-y-0.5",
        success:
          "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-400 hover:to-green-400 hover:-translate-y-0.5",
        warning:
          "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:from-yellow-400 hover:to-amber-400 hover:-translate-y-0.5",
        cyber:
          "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:from-cyan-400 hover:to-blue-500 hover:-translate-y-0.5 border border-cyan-400/30",
        game:
          "bg-gradient-to-br from-slate-700 to-slate-800 text-amber-400 border border-amber-500/30 shadow-lg hover:shadow-amber-500/20 hover:border-amber-500/50 hover:text-amber-300 hover:-translate-y-0.5 dark:from-slate-800 dark:to-slate-900",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-8 text-base has-[>svg]:px-5",
        xl: "h-14 rounded-xl px-10 text-lg has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
