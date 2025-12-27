import { Metadata } from "next";

export const siteConfig = {
    name: "VisitPune.in",
    description: "Experience Pune like never before. AI-powered itineraries, curated vibes, and hidden gems in the Oxford of the East.",
    url: "https://visitpune.in",
    ogImage: "https://visitpune.in/og-image.jpg", // We should add a real image later
    keywords: ["Pune Tourism", "AI Itinerary", "Pune Guide", "Weekend in Pune", "Pune Heritage", "Pune Food"],
};

export const sharedMetadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
};
