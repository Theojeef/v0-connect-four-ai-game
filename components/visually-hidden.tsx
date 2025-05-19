import { cn } from "@/lib/utils"
import { type HTMLAttributes, forwardRef } from "react"

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {}

const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("absolute h-px w-px p-0 overflow-hidden whitespace-nowrap border-0", className)}
      style={{
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        margin: "-1px",
      }}
      {...props}
    />
  )
})
VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden }
