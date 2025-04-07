import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to get all values from a TypeScript enum
 * Works with both string and numeric enums
 */
export function getEnumValues<T extends Record<string, string | number>>(
  enumObject: T
): string[] {
  return Object.keys(enumObject)
    .filter((key) => isNaN(Number(key)))
    .map((key) => enumObject[key] as string);
}
