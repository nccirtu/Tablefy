import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Tablefy-Status-Varianten (feste Paletten-Farben):
        success: "border-transparent bg-emerald-500 text-white",
        warning: "border-transparent bg-amber-500 text-white",
        info: "border-transparent bg-sky-500 text-white",
        muted: "border-transparent bg-muted text-muted-foreground",
        // Solides Grau mit weißer Schrift — die neutrale Markierung des
        // Designs ("System", "Vorlage"). `muted` ist die *stille* Variante mit
        // hellem Grund; diese hier soll gelesen werden.
        neutral: "border-transparent bg-faint text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
