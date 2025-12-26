import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Infers a broad category from a search query.
 * Useful for tagging generic places data from external APIs.
 * @param query The search query string
 * @returns A PlaceCategory ("history", "food", etc.)
 */
export function inferCategory(query: string): string {
  const q = query.toLowerCase();

  // Heuristics mapping
  // O(1) loop over map would be cleaner if list grows, but this is fine for now.
  if (q.includes("historical") || q.includes("fort") || q.includes("wada") || q.includes("palace") || q.includes("museum") || q.includes("temple") || q.includes("heritage")) return "history";
  if (q.includes("misal") || q.includes("food") || q.includes("cafe") || q.includes("bakery") || q.includes("dining") || q.includes("restaurant")) return "food";
  if (q.includes("trek") || q.includes("nature") || q.includes("garden") || q.includes("hill") || q.includes("lake")) return "nature";
  if (q.includes("pub") || q.includes("bar") || q.includes("night") || q.includes("club") || q.includes("brewery")) return "nightlife";
  if (q.includes("book") || q.includes("library")) return "books";
  if (q.includes("art") || q.includes("culture") || q.includes("theatre")) return "culture";

  return "general";
}
