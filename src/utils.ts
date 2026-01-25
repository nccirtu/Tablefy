import { cva } from "class-variance-authority";
import clsx from "clsx";

export function cn(...inputs: Array<string | boolean | undefined | null>) {
  return clsx(inputs.filter(Boolean));
}

