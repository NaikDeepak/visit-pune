import "server-only";

/**
 * Scrapes the Open Graph image (og:image) from a given URL.
 * Used to upgrade low-resolution thumbnails from search results.
 * 
 * @param url The source URL to scrape
 * @returns The high-res image URL or null if not found/failed
 */
export async function fetchHighResImage(url: string): Promise<string | null> {
    if (!url) return null;

    // Fast fail for non-html endpoints or specific domains if needed?
    // For now, generic robust fetch.

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout to avoid hanging sync

        const res = await fetch(url, {
            headers: {
                // User-Agent to mimic a real browser and avoid some bot blockers
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            signal: controller.signal,
            next: { revalidate: 86400 } // Cache results for a day to be polite to source servers
        });
        clearTimeout(timeout);

        if (!res.ok) return null;

        // We only need the head, but we can't stream cleanly in limited envs, so text() is "okay" for now.
        // Optimization: checking content-length or trying to read only first 10kb would be better.
        const html = await res.text();

        // Regex is faster than parsing full DOM for simple meta tags
        // Look for og:image first, then twitter:image
        const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
            html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i) ||
            html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i); // Handling attribute order variance

        return match ? match[1] : null;
    } catch (e) {
        // Silently fail, fallback to original thumbnail is acceptable behavior
        return null;
    }
}
