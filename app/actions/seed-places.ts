"use server";

import { Place } from "@/app/lib/types";

const API_KEY = process.env.SERPAPI_KEY;

const FALLBACK_DATA = [
    {
        id: "shaniwar-wada",
        name: "Shaniwar Wada",
        description: "18th-century fortification and a major historical landmark in Pune.",
        location: { lat: 18.5204, lng: 73.8567, address: "Shaniwar Peth, Pune" },
        rating: 4.4,
        reviews: 25000,
        estimated_time: "1.5 hours",
        image_url: "https://lh5.googleusercontent.com/p/AF1QipM5xDb" // Placeholder or leave empty if invalid
    },
    {
        id: "aga-khan-palace",
        name: "Aga Khan Palace",
        description: "Majestic palace with Italian arches and spacious lawns, housing a Gandhi memorial.",
        location: { lat: 18.5529, lng: 73.9015, address: "Yerawada, Pune" },
        rating: 4.5,
        reviews: 18000,
        estimated_time: "2 hours"
    },
    {
        id: "dagdusheth-halwai",
        name: "Shreemant Dagdusheth Halwai Ganpati Mandir",
        description: "Iconic Hindu temple dedicated to Lord Ganesha, known for its lavish decor.",
        location: { lat: 18.5165, lng: 73.8561, address: "Budhwar Peth, Pune" },
        rating: 4.8,
        reviews: 35000,
        estimated_time: "45 mins"
    },
    {
        id: "sinhagad-fort",
        name: "Sinhagad Fort",
        description: "Hill fortress located around 35 km southwest of Pune, popular for trekking.",
        location: { lat: 18.3663, lng: 73.7559, address: "Thoptewadi, Pune" },
        rating: 4.6,
        reviews: 22000,
        estimated_time: "4 hours"
    },
    {
        id: "german-bakery",
        name: "German Bakery",
        description: "Popular cafe in Koregaon Park known for its relaxed vibe and delicious treats.",
        location: { lat: 18.5361, lng: 73.8997, address: "Koregaon Park, Pune" },
        rating: 4.3,
        reviews: 8000,
        estimated_time: "1 hour"
    },
    {
        id: "phoenix-marketcity",
        name: "Phoenix Marketcity",
        description: "Large shopping mall with international brands, dining, and a cinema.",
        location: { lat: 18.5621, lng: 73.9167, address: "Viman Nagar, Pune" },
        rating: 4.5,
        reviews: 45000,
        estimated_time: "3 hours"
    }
];

export async function fetchPlacesFromSerpApi(query: string = "Top tourist places in Pune"): Promise<{ data: Place[]; error?: string }> {
    if (!API_KEY) {
        console.warn("Missing SERPAPI_KEY, returning fallback data.");
        return { data: FALLBACK_DATA };
    }

    try {
        const params = new URLSearchParams({
            engine: "google_maps",
            q: query,
            ll: "@18.5204,73.8567,14z", // Pune Lat/Long
            type: "search",
            api_key: API_KEY
        });

        const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
        const data = await response.json();

        if (data.error || !data.local_results) {
            console.warn("SerpApi failure, using fallback.", data.error);
            return { data: FALLBACK_DATA };
        }

        return {
            data: data.local_results.map((result: {
                place_id: string;
                title: string;
                description?: string;
                type?: string;
                address?: string;
                gps_coordinates?: { latitude: number; longitude: number };
                thumbnail?: string;
                rating?: number;
                reviews?: number;
            }) => ({
                id: result.place_id,
                name: result.title,
                description: result.description || result.type || "Attraction in Pune",
                location: {
                    lat: result.gps_coordinates?.latitude || 0,
                    lng: result.gps_coordinates?.longitude || 0,
                    address: result.address || ""
                },
                rating: result.rating,
                reviews: result.reviews,
                image_url: result.thumbnail
            }))
        };

    } catch (error) {
        console.error("SerpApi Fetch Error", error);
        return { data: FALLBACK_DATA };
    }
}
