import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://garilink.tz"),
  title: { default: "Cars for Sale in Tanzania | Buy & Sell Cars | GariLink Tz", template: "%s | GariLink Tz" },
  description: "Buy and sell new, foreign used and local used cars in Tanzania. Search trusted dealers and private sellers in Dar es Salaam, Arusha, Dodoma, Mwanza and across Tanzania.",
  keywords: ["cars for sale Tanzania", "sell car Tanzania", "used cars Tanzania", "cars for sale Dar es Salaam", "Toyota Harrier Tanzania", "Toyota Prado Tanzania", "magari ya kuuza Tanzania", "gari Tanzania", "car dealers Tanzania"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_TZ", siteName: "GariLink Tz", title: "Cars for Sale in Tanzania | GariLink Tz", description: "Find and sell cars with trusted dealers and private sellers across Tanzania." },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  const structuredData = { "@context": "https://schema.org", "@type": "Organization", name: "GariLink Tz", url: "https://garilink.tz", description: "Tanzania automotive marketplace for buying and selling cars.", areaServed: "TZ", knowsAbout: ["Cars for sale in Tanzania", "Used cars Tanzania", "Car valuation Tanzania"] };
  return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData) }}/>{children}</body></html>;
}
