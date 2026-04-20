import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseJobDescription(desc: string) {
    if (!desc) return "";
    try {
        const parsed = JSON.parse(desc);
        if (Array.isArray(parsed)) {
            return parsed.map(item => item.description || "").filter(Boolean).join(" | ");
        }
        return desc;
    } catch {
        return desc;
    }
}
