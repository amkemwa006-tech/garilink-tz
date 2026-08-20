import React from "react";
import Marketplace from "../ui/marketplace";
import { getPublishedListings } from "../../lib/listings";

export const dynamic = "force-dynamic";

export default async function CarsPage() {
  const listings = await getPublishedListings();
  return <Marketplace initialVehicles={listings} initialView="results" />;
}
