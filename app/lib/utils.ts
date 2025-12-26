import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Keyword-to-category mapping for efficient classification.
 * Each entry maps a keyword to its corresponding PlaceCategory.
 */
const KEYWORD_CATEGORY_MAP: Record<string, string> = {
  // History
  "historical": "history",
  "fort": "history",
  "wada": "history",
  "palace": "history",
  "museum": "history",
  "temple": "history",
  "heritage": "history",
  "ancient": "history",
  "monument": "history",

  // Food
  "misal": "food",
  "food": "food",
  "cafe": "food",
  "bakery": "food",
  "dining": "food",
  "restaurant": "food",
  "cuisine": "food",
  "eat": "food",
  "eatery": "food",

  // Nature
  "trek": "nature",
  "nature": "nature",
  "garden": "nature",
  "hill": "nature",
  "lake": "nature",
  "park": "nature",
  "waterfall": "nature",
  "hiking": "nature",
  "mountain": "nature",

  // Nightlife
  "pub": "nightlife",
  "bar": "nightlife",
  "night": "nightlife",
  "club": "nightlife",
  "brewery": "nightlife",
  "lounge": "nightlife",
  "disco": "nightlife",

  // Books
  "book": "books",
  "library": "books",
  "bookstore": "books",

  // Culture
  "art": "culture",
  "culture": "culture",
  "theatre": "culture",
  "theater": "culture",
  "gallery": "culture",
  "cultural": "culture",
};

/**
 * Infers a broad category from a search query using keyword matching.
 * Useful for tagging generic places data from external APIs.
 * 
 * Performance: O(m) where m is the number of words in the query.
 * Uses a keyword map for efficient lookups instead of nested if statements.
 * 
 * @param query The search query string
 * @returns A PlaceCategory ("history", "food", etc.)
 */
export function inferCategory(query: string): string {
  const q = query.toLowerCase();

  // Check each keyword in the map
  for (const [keyword, category] of Object.entries(KEYWORD_CATEGORY_MAP)) {
    if (q.includes(keyword)) {
      return category;
    }
  }

  return "general";
}
