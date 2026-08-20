"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function CreateListingPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const imageFiles = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    if (imageFiles.length > 8) {
      setMessage("Please choose no more than 8 photos.");
      setIsSubmitting(false);
      return;
    }

    if (imageFiles.some((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) {
      setMessage("Each photo must be an image smaller than 5 MB.");
      setIsSubmitting(false);
      return;
    }

    const { data: listing, error: listingError } = await supabase.from("listings").insert({
      seller_id: user.id,
      make: String(form.get("make")),
      model: String(form.get("model")),
      variant: String(form.get("variant")),
      year: Number(form.get("year")),
      price_tzs: Number(form.get("price")),
      mileage_km: Number(form.get("mileage")),
      condition: String(form.get("condition")),
      fuel_type: String(form.get("fuel")),
      transmission: String(form.get("transmission")),
      body_type: String(form.get("bodyType")),
      region: String(form.get("region")),
      title: String(form.get("title")),
      description: String(form.get("description")),
      status: "draft",
    }).select("id").single();

    if (listingError || !listing) {
      setMessage(listingError?.message ?? "Could not save this listing.");
      setIsSubmitting(false);
      return;
    }

    for (const [index, file] of imageFiles.entries()) {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const path = `${user.id}/${listing.id}/${index + 1}-${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("listing-images.").upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        setMessage(`Draft saved, but photo ${index + 1} could not upload: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }

      const { error: imageError } = await supabase.from("listing_images").insert({
        listing_id: listing.id,
        storage_path: path,
        sort_order: index,
      });

      if (imageError) {
        setMessage(`Draft saved, but photo ${index + 1} could not be attached: ${imageError.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    setMessage("Draft listing and photos saved successfully. You can publish it after review.");
    event.currentTarget.reset();
    setIsSubmitting(false);
  }

  return (
    <main className="container toolPage">
      <p className="eyebrow">SELL ON GARILINK TZ</p>
      <h1>Create listing</h1>

      <form className="valueForm" onSubmit={createListing}>
        <label>Listing title<input name="title" required /></label>
        <label>Make<input name="make" placeholder="Toyota" required /></label>
        <label>Model<input name="model" placeholder="Harrier" required /></label>
        <label>Variant<input name="variant" /></label>
        <label>Year<input name="year" type="number" required /></label>
        <label>Price (TZS)<input name="price" type="number" required /></label>
        <label>Mileage (km)<input name="mileage" type="number" /></label>

        <label>
          Condition
          <select name="condition">
            <option>Foreign Used</option>
            <option>Local Used</option>
            <option>Brand New</option>
            <option>Reconditioned</option>
          </select>
        </label>

        <label>
          Fuel
          <select name="fuel">
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Hybrid</option>
            <option>Electric</option>
          </select>
        </label>

        <label>
          Transmission
          <select name="transmission">
            <option>Automatic</option>
            <option>Manual</option>
          </select>
        </label>

        <label>
          Body type
          <select name="bodyType">
            <option>SUV</option>
            <option>Sedan</option>
            <option>Hatchback</option>
            <option>Pickup</option>
            <option>Van</option>
            <option>Minibus</option>
            <option>Truck</option>
            <option>Bus</option>
            <option>Motorcycle</option>
          </select>
        </label>

        <label>
          Region
          <select name="region">
            <option>Dar es Salaam</option>
            <option>Arusha</option>
            <option>Dodoma</option>
            <option>Mwanza</option>
            <option>Mbeya</option>
          </select>
        </label>

        <label>
          Description
          <textarea name="description" />
        </label>

        <label>
          Vehicle photos
          <input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple />
          <small>Up to 8 JPG, PNG, or WebP photos. Maximum 5 MB each.</small>
        </label>

        <button className="primary" disabled={isSubmitting}>{isSubmitting ? "Saving draft…" : "Save draft"}</button>
      </form>

      <p>{message}</p>
    </main>
  );
}
