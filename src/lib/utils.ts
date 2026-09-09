import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates a long wallet address with an ellipsis in the middle.
 * Example: 0x7B1234...3F2a
 */
export function truncateAddress(addr: string, head = 4, tail = 4): string {
  if (!addr) return "";
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head + 2)}...${addr.slice(-tail)}`;
}

/**
 * Copy-to-clipboard utility.
 * Returns true on success, false on failure. The caller is responsible for
 * surfacing a "Copied!" toast — keeping this pure makes it easy to test and
 * reuse without coupling it to a specific toast library.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers / insecure contexts
    if (typeof document !== "undefined") {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    }
    return false;
  } catch {
    return false;
  }
}

/** Formats a USD budget integer into a readable currency string. */
export function formatBudget(budget: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(budget);
}

/** Maps raw category strings to human-friendly labels. */
export function categoryLabel(cat: string): string {
  switch (cat.toLowerCase()) {
    case "writing":
      return "Writing";
    case "video":
      return "Video Editing";
    case "script":
      return "Scriptwriting";
    default:
      return cat;
  }
}
