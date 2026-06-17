import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names (vendored — replaces the consumer's `@/lib/utils`). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
