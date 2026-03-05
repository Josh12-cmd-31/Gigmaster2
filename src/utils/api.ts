export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    
    if (res.ok) {
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }
      return null;
    } else {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || `Request failed with status ${res.status}`);
      } else {
        const text = await res.text();
        console.error(`Non-JSON error response from ${url}:`, text.substring(0, 200));
        throw new Error(`Server error: ${res.status}. Check console for details.`);
      }
    }
  } catch (err: any) {
    console.error(`Fetch error for ${url}:`, err);
    throw err;
  }
}
