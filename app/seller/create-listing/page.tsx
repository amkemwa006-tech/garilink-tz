"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function CreateListingPage() {
  const [message, setMessage] = useState("");

  async function createListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { error } = await supabase.from("listings").insert({
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
    });

    setMessage(error ? error.message : "Draft listing saved successfully.");
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
          <input name="images" type="file" accept="image/*" multiple />
        </label>

        <button className="primary">Save draft</button>
      </form>

      <p>{message}</p>
    </main>
  );
}
