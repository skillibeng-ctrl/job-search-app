import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 overflow-hidden",
  {
    variants: {
      variant: {
        // Default Shadcn variants
        default: "border-transparent bg-emerald-600 text-white shadow hover:bg-emerald-700",
        secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        destructive: "border-transparent bg-rose-500 text-white shadow hover:bg-rose-600",
        outline: "text-gray-700 border-gray-300 hover:bg-gray-50",
        
        // 🔥 JobFlow specific variants
        emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        purple: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
        rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
        gray: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
        
        // Dark premium variant
        dark: "border-gray-800 bg-gray-900 text-white hover:bg-black",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px] uppercase tracking-wider",
        lg: "px-3 py-1 text-sm",
      },
      shape: {
        pill: "rounded-full",
        square: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "pill",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, shape }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }