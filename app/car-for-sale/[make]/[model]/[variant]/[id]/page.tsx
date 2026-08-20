import React from "react";
import Marketplace from "../../../../../ui/marketplace";
import { slugify } from "../../../../../../lib/vehicles";
import { getPublishedListingById } from "../../../../../../lib/listings";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DetailPage({ params }: { params: Promise<{ make: string; model: string; variant: string; id: string }> }) {
  const route = await params;
  const vehicle = await getPublishedListingById(route.id);
  if (!vehicle || slugify(vehicle.make) !== route.make || slugify(vehicle.model) !== route.model || slugify(vehicle.variant) !== route.variant) notFound();
return <Marketplace initialVehicles={[vehicle]} initialView="detail" initialCarId={Number(vehicle.id)} />;