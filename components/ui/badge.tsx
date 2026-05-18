import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary/10 text-primary",
        muted: "border-border/80 bg-muted/50 text-muted-foreground",
        accent: "border-accent/25 bg-accent/10 text-accent"
      }
    },
    defaultVariants: { variant: "default" }
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
