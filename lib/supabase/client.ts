import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function getImageUrl(filename: string): string {
  // If already a full URL, return as-is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Build the full Supabase Storage URL.
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const objectPath = filename.replace(/^listing-images\.?\//, "");
  return `${baseUrl}/storage/v1/object/public/listing-images./${objectPath}`;
}

export function getImageFallbackUrl(url: string): string {
  if (url.includes("/listing-images/")) {
    return url.replace("/listing-images/", "/listing-images./");
  }

  if (url.includes("/listing-images./")) {
    return url.replace("/listing-images./", "/listing-images/");
  }

  return url;
}
