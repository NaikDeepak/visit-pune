"use server";

export interface EventData {
    id?: string;
    title: string;
    date: {
        start_date?: string;
        when?: string;
    };
    address: string[];
    link: string;
    event_location_map?: {
        image?: string;
        link?: string;
        serpapi_link?: string;
    };
    description?: string;
    image?: string;
    thumbnail?: string;
    venue?: {
        name: string;
        rating?: number;
        reviews?: number;
        link?: string;
    };
    startDateVal?: number;
}

const API_KEY = process.env.SERPAPI_KEY;

const FALLBACK_EVENTS: EventData[] = [
    {
        title: "Pune International Film Festival",
        date: {
            start_date: "Jan 12",
            when: "Thu, Jan 12 – Thu, Jan 19"
        },
        address: ["Pune, Maharashtra"],
        link: "https://www.piffindia.com/",
        description: "Annual film festival showcasing global cinema.",
        thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-M-u7y6Y5l8E4b5c2j9x4k3_1h5r8o6_7n9w2_3&s",
        venue: {
            name: "Multiple Venues"
        }
    },
    {
        title: "Sawai Gandharva Bhimsen Mahotsav",
        date: {
            start_date: "Dec 14",
            when: "Wed, Dec 14 – Sun, Dec 18"
        },
        address: ["Maharashtriya Mandal Krida Sankul, Pune"],
        link: "https://en.wikipedia.org/wiki/Sawai_Gandharva_Bhimsen_Festival",
        description: "One of the most prestigious Indian classical music festivals.",
        thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq9_1p3r6s5v8y4x2z0a7b4c8d1e5f9g6h3_2&s",
        venue: {
            name: "Maharashtriya Mandal Krida Sankul"
        }
    },
    {
        title: " NH7 Weekender Pune",
        date: {
            start_date: "Nov 25",
            when: "Fri, Nov 25 – Sun, Nov 27"
        },
        address: ["Mahalakshmi Lawns, Pune"],
        link: "https://nh7.in/",
        description: "The happiest music festival with diverse lineup.",
        thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1_5j9x3l7k4n2m8o5p6q0r1s2t3u4v5w6x7y8&s",
        venue: {
            name: "Mahalakshmi Lawns"
        }
    },
    {
        title: "Pune Comedy Festival",
        date: {
            start_date: "Feb 04",
            when: "Sat, Feb 04, 6:00 PM"
        },
        address: ["Phoenix Marketcity, Pune"],
        link: "https://in.bookmyshow.com/",
        description: "Stand-up comedy from India's best comedians.",
        thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1_2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8&s", // Placeholder
        venue: {
            name: "Phoenix Marketcity"
        }
    }
];

export async function fetchEventsFromSerpApi(query: string = "Events in Pune"): Promise<{ events: EventData[]; error?: string }> {
    if (!API_KEY) {
        console.warn("Missing SERPAPI_KEY, returning fallback data.");
        return { events: FALLBACK_EVENTS };
    }

    try {
        const params = new URLSearchParams({
            engine: "google_events",
            q: query,
            hl: "en",
            gl: "in",
            api_key: API_KEY,
        });

        const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`SerpApi responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            console.warn("SerpApi error:", data.error);
            return { events: FALLBACK_EVENTS, error: data.error };
        }

        if (!data.events_results) {
            return { events: FALLBACK_EVENTS };
        }

        return { events: data.events_results };

    } catch (error) {
        console.error("Failed to fetch events:", error);
        return { events: FALLBACK_EVENTS };
    }
}
