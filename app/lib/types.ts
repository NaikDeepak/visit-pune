export interface Place {
    id: string;
    name: string;
    description: string;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    image_url?: string;
    rating?: number;
    reviews?: number;
    estimated_time?: string; // "1 hour"
    category?: PlaceCategory;
    price_level?: number; // 0-4
}

export type PlaceCategory =
    | "history"
    | "food"
    | "nature"
    | "nightlife"
    | "books"
    | "culture"
    | "general";

export const PLACE_CATEGORIES: PlaceCategory[] = [
    "history", "food", "nature", "nightlife", "books", "culture", "general"
];

export interface ItineraryStop {
    place: Place;
    time_slot: string; // "10:00 AM"
    activity: string; // "Eat Misal at Bedekar"
    tips: string;
}

export interface Itinerary {
    title: string;
    description: string;
    stops: ItineraryStop[];
    total_duration: string;
}
