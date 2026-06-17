// Mock of the consumer's `@/lib/utils` cn() helper.
export function cn(...args: any[]): string {
  return args.flat(Infinity).filter(Boolean).join(" ");
}
