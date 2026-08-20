import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import HomePage from "../app/page";
import ResultsPage from "../app/cars-for-sale/page";
import DetailPage from "../app/car-for-sale/[make]/[model]/[variant]/[id]/page";
import SellerPage from "../app/sell-my-car/page";

const listing = {
  id: "test-listing-id", make: "Toyota", model: "Land Cruiser Prado", variant: "TX-L 2.8D 4WD",
  year: 2021, price: 118000000, mileage: 48200, region: "Dar es Salaam", condition: "Foreign Used",
  fuel: "Diesel", transmission: "Automatic", bodyType: "SUV", engineCc: 2755, drivetrain: "4x4",
  seats: 7, color: "White", dutyPaid: true, registrationIncluded: true, serviceHistory: true,
  title: null, description: "Carefully maintained demo vehicle.", image: "/vehicles/toyota-prado-2021.webp",
  images: ["/vehicles/toyota-prado-2021.webp"], badge: "Great Price", dealer: "Safari Motors",
  verified: true, sellerType: "Dealer" as const, createdAt: "2026-01-01T00:00:00Z",
};

vi.mock("../lib/listings", () => ({
  getPublishedListings: vi.fn(async () => [listing]),
  getPublishedListingById: vi.fn(async () => listing),
}));

Object.defineProperty(window, "scrollTo", { value: () => undefined, writable: true });

describe("GariLink Tz smoke tests", () => {
  it("Homepage renders without crashing", async () => {
    render(await HomePage());
    expect(screen.getByRole("heading", { name: /find your next journey/i })).toBeInTheDocument();
  });

  it("Search form renders", async () => {
    render(await HomePage());
    expect(screen.getByPlaceholderText(/e\.g\. toyota harrier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/make, model or keyword/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search \d+ cars/i })).toBeInTheDocument();
  });

  it("Vehicle detail page renders", async () => {
    render(await DetailPage({ params: Promise.resolve({ make: "toyota", model: "land-cruiser-prado", variant: "tx-l-2-8d-4wd", id: "test-listing-id" }) }));
    expect(screen.getByRole("heading", { name: /land cruiser prado/i })).toBeInTheDocument();
  });

  it("Seller page renders", () => {
    render(<SellerPage />);
    expect(screen.getByRole("heading", { name: /list your car/i })).toBeInTheDocument();
  });

  it("Results page renders", async () => {
    render(await ResultsPage());
    expect(screen.getByRole("heading", { name: /cars for sale in tanzania/i })).toBeInTheDocument();
  });
});
