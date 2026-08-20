# GariLink Tz — Refinement Baseline

**Project:** garilink-tz `0.1.0`  
**Document type:** Development baseline for marketplace refinement  
**Source of truth:** Current repository (Next.js App Router)

This document records the as-built architecture, screens, demo inventory, and known gaps so later stages can land without rediscovering the prototype.

---

## 1. Current Architecture

| Layer | As built |
|---|---|
| Framework | **Next.js 15.1.0** (App Router) + **React 19.0.0** + **TypeScript 5.7.2** |
| Rendering | Client-heavy UI (`"use client"` in `app/ui/marketplace.tsx`). Routes exist as App Router pages that pass an `initialView`. |
| Deploy model | Static export (`output: "export"` in `next.config.ts`), trailing slashes, unoptimized images. Intended for Netlify via `out/`. |
| Styling | **No CSS framework in `package.json`.** Global CSS in `app/globals.css` with CSS custom properties, Rubik (Google Fonts), and media queries. No Tailwind, CSS Modules, or styled-components. |
| State management | **No Redux, Zustand, or Context store.** Local React state in `Marketplace`: `useState` for view, search query, region, filter drawer, sort, favourites, notices, and language; `useMemo` for filtered/sorted cars. |
| Data source | **Hard-coded mock data** — a `cars` array inside `app/ui/marketplace.tsx`. No API, database, or shared data module. |
| Testing | Node built-in runner (`npm test` → `tests/*.test.mjs`). ESLint is scripted (`next lint`) but **not installed** and there is **no ESLint config**. |

### High-level shape

```
app/
  layout.tsx          Root HTML, SEO metadata, Organization JSON-LD
  page.tsx            Home → Marketplace initialView="home"
  globals.css         All visual styling
  ui/marketplace.tsx  Inventory + all screens in one client component
  sitemap.ts / robots.ts
tests/calculations.test.mjs
```

Most “pages” are thin wrappers. Navigation between home, results, detail, finance, value, sell, and dealer is **in-component view switching**, not full server-driven page composition.

---

## 2. Existing Pages & Screens

There is **no `app/pages` or `pages/` directory**. Routes live under `app/`.

| Route | File | Screen (`initialView`) |
|---|---|---|
| `/` | `app/page.tsx` | Home |
| `/cars-for-sale/` | `app/cars-for-sale/page.tsx` | Search results |
| `/car-for-sale/[make]/[model]/[variant]/[id]/` | `app/car-for-sale/[make]/[model]/[variant]/[id]/page.tsx` | Listing detail |
| `/finance-calculator/` | `app/finance-calculator/page.tsx` | Finance calculator |
| `/value-my-car/` | `app/value-my-car/page.tsx` | Valuation |
| `/sell-my-car/` | `app/sell-my-car/page.tsx` | Sell wizard |
| `/dealer-dashboard/` | `app/dealer-dashboard/page.tsx` | Dealer portal |

**Static generation note:** `generateStaticParams()` currently exports **one** detail URL only:

- `/car-for-sale/toyota/land-cruiser-prado/tx-l/1/`

The other five demo vehicles do not have generated detail paths.

**UI modules inside `app/ui/marketplace.tsx` (not separate route files):** `Search`, `Home`, `BudgetMini`, `Card`, `Results`, `Filter`, `Detail`, `Contact`, `Finance`, `Value`, `Sell`, `ViewingFlow`, `Trust`, `DealerDashboard`, `MobileNav`.

---

## 3. Current Vehicle Data Structure

Inventory is typed as `Car` and stored as a six-item array in `app/ui/marketplace.tsx`.

### `Car` type

| Field | Type | Notes |
|---|---|---|
| `id` | `number` | Primary key in the mock set |
| `make` | `string` | e.g. Toyota |
| `model` | `string` | e.g. Land Cruiser Prado |
| `variant` | `string` | Trim / powertrain string |
| `year` | `number` | Model year |
| `price` | `number` | TZS integer |
| `mileage` | `number` | Kilometres |
| `region` | `string` | Tanzanian city/region |
| `condition` | `string` | Brand New, Foreign Used, Local Used, Reconditioned |
| `fuel` | `string` | Diesel, Petrol, Hybrid |
| `transmission` | `string` | Currently all Automatic |
| `image` | `string` | Path under `/vehicles/` |
| `badge` | `string` | Great / Good / Fair Price |
| `dealer` | `string` | Yard name or `"Private seller"` |
| `promoted` | `boolean?` | Optional featured flag |
| `verified` | `boolean?` | Optional verification flag |
| `sellerType` | `"Dealer" \| "Private"` | |
| `bodyType` | `string` | SUV or Hatchback |

### Six demo vehicles

| id | Year | Make / model / variant | Price (TZS) | km | Region | Condition | Fuel | Seller | Image |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2021 | Toyota Land Cruiser Prado TX-L 2.8D 4WD | 118,000,000 | 48,200 | Dar es Salaam | Foreign Used | Diesel | Safari Motors (Dealer, promoted, verified) | `/vehicles/toyota-prado-2021.webp` |
| 2 | 2020 | Toyota Harrier Premium Hybrid | 67,000,000 | 63,800 | Arusha | Foreign Used | Hybrid | Kili Auto House (Dealer, verified) | `/vehicles/toyota-harrier-2020.webp` |
| 3 | 2022 | Mazda CX-5 2.5 AWD | 76,000,000 | 21,800 | Dodoma | Local Used | Petrol | Private | `/vehicles/mazda-cx5-2022.webp` |
| 4 | 2019 | Nissan X-Trail Autech 4WD | 49,500,000 | 81,700 | Mwanza | Foreign Used | Petrol | Lake Zone Motors (Dealer, verified) | `/vehicles/nissan-xtrail-2019.webp` |
| 5 | 2023 | Suzuki Jimny GLX 4WD | 83,500,000 | 6,900 | Dar es Salaam | Brand New | Petrol | Safari Motors (Dealer, verified) | `/vehicles/suzuki-jimny-2023.webp` |
| 6 | 2021 | Honda Fit e:HEV Home | 33,500,000 | 42,800 | Mbeya | Reconditioned | Hybrid | Private | `/vehicles/honda-fit-2021.webp` |

**Working filters today:** keyword (`make` + `model` + `variant`) and `region`. Sort: relevance, newest year, lowest price, lowest mileage. Drawer fields (price range, year range, mileage cap, fuel, etc.) are **UI-only** and do not change the result set.

---

## 4. Important Risks

1. **Hard-coded data** — Inventory, WhatsApp numbers, valuation ranges, dealer stats, and many notices are literals in the UI. They cannot be updated without editing the component.
2. **No centralized repository** — There is no `lib/` or data module. Pages, search, cards, and detail all depend on the same private `cars` array.
3. **View-state vs URL mismatch** — Direct URLs exist, but in-app `nav("results")` / `nav("detail")` mostly changes React `view` instead of `router.push`. Browser back, shareable listing URLs, and SEO for all six cars are incomplete.
4. **Static export only generates one listing** — Five of six vehicles are missing `generateStaticParams` entries; those detail URLs will 404 in production export.
5. **Monolithic client component** — Home, search, detail, finance, sell wizard, and dealer dashboard share one file. High change-collision risk and hard-to-test UI.
6. **Incomplete filter behaviour** — Users can open a filter drawer that does not apply. That is a product-trust risk.
7. **Lint / quality gate gap** — `npm run lint` is defined, but ESLint is not a project dependency and no config file exists.
8. **No persistence or auth** — Favourites, enquiries, listings, and dealer actions are session-only toasts. Fine for a demo; unsafe as a production assumption.
9. **Placeholder photography / third-party hero image** — Vehicle webps plus an Unsplash hero; licensing must be confirmed before launch.
10. **No Git repository detected** at last inspection — no versioned baseline unless Git is initialized elsewhere.

---

## 5. Missing Test Coverage

`package.json` includes `npm test`. Existing coverage:

- `tests/calculations.test.mjs` — finance monthly payment formula and TZS/`TSh` formatting.

**Not covered (treat as missing for refinement):**

- Vehicle repository / selectors (by id, make, model, slug)
- Search and region filtering
- Hierarchical make → model → variant selection
- Filter combinations (price, year, mileage, fuel, body type, seller type)
- Route/`generateStaticParams` alignment with inventory
- Page-level or component tests
- Typecheck/lint as CI gates (`npm run typecheck` exists; lint is not wired)

---

## 6. Recommended Implementation Order

### Stage 1 — Real routes and centralized vehicle data

- Extract `Car` and the six (then N) vehicles into a single module (e.g. `lib/vehicles.ts`).
- Add query helpers: `getAllVehicles`, `getVehicleById`, `getVehicleBySlug`.
- Drive listing URLs from data; expand `generateStaticParams` to every vehicle.
- Prefer Next.js navigation (`Link` / `useRouter`) over `setView` for public screens.

### Stage 2 — Homepage inventory

- Home featured/recent cars must read the same repository as results and detail.
- Keep sample photos and copy, but stop duplicating vehicle facts in JSX.

### Stage 3 — Hierarchical selector

- Make → model → variant (and optionally year) derived from inventory, not free-text only.
- Use the selector on home search and sell/value flows where it reduces bad queries.

### Stage 4 — Complete filters

- Wire drawer fields to the same filter pipeline as keyword + region.
- Support price, year, mileage, fuel, transmission, body type, condition, seller type, verified.
- Add tests for the filter/sort functions before expanding UI.

---

## Suggested first engineering checks

```bash
npm install
npm run typecheck
npm test
npm run build
```

Treat `npm run lint` as blocked until ESLint is added. After Stage 1, a production export should include six listing HTML files under `out/car-for-sale/`, not one.
