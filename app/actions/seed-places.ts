"use server";

import { getJson } from "serpapi";

const API_KEY = process.env.SERPAPI_KEY;

export async function fetchPlacesFromSerpApi(query: string = "Top tourist places in Pune") {
    if (!API_KEY) {
        return { error: "Missing SERPAPI_KEY" };
    }

    try {
        // We wrap getJson in a promise because the library uses callbacks usually, 
        // but getJson might return a promise in newer versions? 
        // Actually the standard library uses callbacks. "google-search-results-nodejs"
        // But "serpapi" package is different. I installed "google-search-results-nodejs".
        // I should check import.
        // The library "google-search-results-nodejs" exports `getJson`.

        // Let's use a dynamic import or require to be safe with Node environment in Next.js
        // const Search = require("google-search-results-nodejs");
        // const search = new Search.GoogleSearch(API_KEY);

        // But since I installed it, I can import it.
        // However, it's a common issue with Typescript.
        // I will use a simple fetch to the REST API to avoid library issues and keep it lightweight.

        const params = new URLSearchParams({
            engine: "google_maps",
            q: query,
            ll: "@18.5204,73.8567,14z", // Pune Lat/Long
            type: "search",
            api_key: API_KEY
        });

        const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
        const data = await response.json();

        if (data.error) {
            return { error: data.error };
        }

        if (!data.local_results) {
            return { error: "No results found", raw: data };
        }

        return {
            data: data.local_results.map((result: any) => ({
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
                image_url: result.thumbnail,
                types: result.types
            }))
        };

    } catch (error) {
        console.error("SerpApi Fetch Error", error);
        return { error: "Failed to fetch from SerpApi" };
    }
}
