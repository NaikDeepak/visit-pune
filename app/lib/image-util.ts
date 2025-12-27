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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout to avoid hanging sync

    try {
        const res = await fetch(url, {
            headers: {
                // User-Agent to mimic a real browser and avoid some bot blockers
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            signal: controller.signal,
            next: { revalidate: 86400 } // Cache results for a day to be polite to source servers
        });

        if (!res.ok) return null;

        // Optimization: Stream response and stop after ~16KB to capture <head> without downloading full body
        let html = "";
        const reader = res.body?.getReader();

        if (reader) {
            const decoder = new TextDecoder("utf-8");
            let received = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                html += chunk;
                received += value.length;

                // Stop after 16KB - meta tags are almost always in the first few KB
                if (received > 16 * 1024) {
                    await reader.cancel();
                    break;
                }
            }
        } else {
            // Fallback for environments where streams aren't supported
            html = await res.text();
        }

        // Regex is faster than parsing full DOM for simple meta tags
        // Look for og:image first, then twitter:image
        const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
            html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i) ||
            html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i); // Handling attribute order variance

        return match ? match[1] : null;
    } catch {
        // Silently fail, fallback to original thumbnail is acceptable behavior
        return null;
    } finally {
        clearTimeout(timeout);
    }
}
