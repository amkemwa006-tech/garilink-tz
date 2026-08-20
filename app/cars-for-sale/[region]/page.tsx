import Marketplace from "../../ui/marketplace";
import { slugify } from "../../../lib/vehicles";
import { getPublishedListings } from "../../../lib/listings";

export const dynamic = "force-dynamic";

export default async function RegionalCarsPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: routeRegion } = await params;
  const listings = await getPublishedListings();
  const region = [...new Set(listings.map((listing) => listing.region))]
    .find((item) => slugify(item) === routeRegion);
  return <Marketplace initialVehicles={listings} initialView="results" initialRegion={region ?? ""} />;
}
