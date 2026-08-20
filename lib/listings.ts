import { createClient } from "./supabase/server";

type ListingImageRow = { storage_path: string; sort_order: number | null };
type ProfileRow = { full_name: string | null; role: string | null } | { full_name: string | null; role: string | null }[] | null;
type ListingRow = {
  id: string; make: string; model: string; variant: string | null; year: number;
  price_tzs: number; mileage_km: number; region: string; condition: string;
  fuel_type: string; transmission: string; body_type: string; engine_cc: number | null;
  drivetrain: string | null; seats: number | null; color: string | null;
  duty_paid: boolean | null; registration_included: boolean | null;
  service_history: boolean | null; title: string | null; description: string | null;
  price_rating: string | null; is_verified: boolean | null; created_at: string;
  listing_images: ListingImageRow[] | null; profiles: ProfileRow;
};

export type Listing = {
  id: string; make: string; model: string; variant: string; year: number; price: number;
  mileage: number; region: string; condition: string; fuel: string; transmission: string;
  bodyType: string; engineCc: number | null; drivetrain: string | null; seats: number | null;
  color: string | null; dutyPaid: boolean | null; registrationIncluded: boolean | null;
  serviceHistory: boolean | null; title: string | null; description: string | null;
  image: string; images: string[]; badge: string; dealer: string; verified: boolean;
  sellerType: "Dealer" | "Private"; createdAt: string;
};

const listingSelect = `
  id, make, model, variant, year, price_tzs, mileage_km, region, condition,
  fuel_type, transmission, body_type, engine_cc, drivetrain, seats, color,
  duty_paid, registration_included, service_history, title, description,
  price_rating, is_verified, created_at,
  listing_images (storage_path, sort_order),
  profiles!listings_seller_id_fkey (full_name, role)
`;

function publicImageUrl(storagePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return baseUrl && storagePath
    ? `${baseUrl}/storage/v1/object/public/listing-images./${storagePath}`
    : "/vehicles/toyota-prado-2021.webp";
}

function mapListing(row: ListingRow): Listing {
  const images = [...(row.listing_images ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((image) => publicImageUrl(image.storage_path));
  const profile = Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles;
  const isDealer = profile?.role === "dealer" || profile?.role === "seller";
  return {
    id: row.id, make: row.make, model: row.model, variant: row.variant ?? "", year: row.year,
    price: row.price_tzs, mileage: row.mileage_km, region: row.region, condition: row.condition,
    fuel: row.fuel_type, transmission: row.transmission, bodyType: row.body_type,
    engineCc: row.engine_cc, drivetrain: row.drivetrain, seats: row.seats, color: row.color,
    dutyPaid: row.duty_paid, registrationIncluded: row.registration_included,
    serviceHistory: row.service_history, title: row.title, description: row.description,
    image: images[0] ?? "/vehicles/toyota-prado-2021.webp", images,
    badge: row.price_rating ?? "Listed price",
    dealer: profile?.full_name ?? (isDealer ? "GariLink dealer" : "Private seller"),
    verified: row.is_verified ?? false, sellerType: isDealer ? "Dealer" : "Private",
    createdAt: row.created_at,
  };
}

export async function getPublishedListings(): Promise<Listing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("listings").select(listingSelect)
      .eq("status", "published").order("created_at", { ascending: false });
    if (error) { console.error("Error fetching listings:", error.message); return []; }
    return ((data ?? []) as unknown as ListingRow[]).map(mapListing);
  } catch (error) {
    console.error("Could not create the Supabase listings client:", error);
    return [];
  }
}

export async function getPublishedListingById(id: string): Promise<Listing | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("listings").select(listingSelect)
      .eq("id", id).eq("status", "published").maybeSingle();
    return error || !data ? null : mapListing(data as unknown as ListingRow);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return null;
  }
}
