# Stage 2 Complete — GariLink Tz

## What's working

- Real marketplace routes, including `/cars-for-sale` and individual vehicle-detail routes under `/car-for-sale/[make]/[model]/[variant]/[id]`.
- A centralized vehicle-data repository in `lib/vehicles.ts`.
- Vehicle filters for price, mileage, fuel, transmission, body type, condition, seller type, and region.
- Sorting by newest model year, price low-to-high, price high-to-low, and lowest mileage.
- Results pagination.
- Shareable filter URLs through query parameters.
- Removable filter chips on the results page.

## Current architecture

- Next.js App Router.
- Plain CSS; Tailwind CSS is not used.
- React `useState`, `useMemo`, and `useEffect` for client-side state and filtering.
- Mock data containing six demo vehicles.

## What's not working yet

- No real database; vehicle information is mock data.
- No user authentication.
- No seller-account creation.
- No ability for users to upload real listings.
- No image-upload capability.
- No persistent data for favourites, enquiries, listings, or viewing codes.

## Next steps needed

1. Set up a Supabase PostgreSQL database.
2. Add user authentication and roles for buyers, private sellers, dealers, and administrators.
3. Create a seller-onboarding flow.
4. Build a persistent listing-creation wizard.
5. Add secure image-upload functionality and storage.
