"use client";
import React, { FormEvent, useEffect, useMemo, useState, ReactNode } from "react";
import { vehiclePath, vehicles as mockCars, type Vehicle } from "../../lib/vehicles";
import { getImageFallbackUrl, getImageUrl } from "../../lib/supabase/client";
import { createClient } from "../../lib/supabase/client";
import type { Listing } from "../../lib/listings";

const money = (n: number) => new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 }).format(n).replace("TZS", "TSh");
const LinkLogo = (): ReactNode => <a className="logo" href="/"><span className="mark">↗</span><span>GariLink <b>Tz</b></span></a>;

type AccountState = { role: string } | null;

export default function Marketplace({ initialVehicles = [], initialView = "home", initialCarId = 1, initialQuery = "", initialRegion = "" }: { initialVehicles?: Listing[]; initialView?: "home" | "results" | "detail" | "finance" | "value" | "sell" | "dealer"; initialCarId?: string | number; initialQuery?: string; initialRegion?: string }): ReactNode {
  const cars = (initialVehicles.length ? initialVehicles.map((listing) => ({ ...listing, promoted: false })) : mockCars) as unknown as Vehicle[];
  const [view, setView] = useState(initialView);
  const [activeCarId, setActiveCarId] = useState(initialCarId);
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState(initialRegion);
  const [drawer, setDrawer] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [fav, setFav] = useState<(string | number)[]>([]);
  const [notice, setNotice] = useState("");
  const [account, setAccount] = useState<AccountState>(null);
  const [lang, setLang] = useState<"EN" | "SW">("EN");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", maxMileage: "", fuel: "", transmission: "", bodyType: "", condition: "", sellerType: "" });
  
  const filtered = useMemo(() => cars.filter(c => (!query || `${c.make} ${c.model} ${c.variant}`.toLowerCase().includes(query.toLowerCase())) && (!region || c.region === region) && (!filters.minPrice || c.price >= Number(filters.minPrice)) && (!filters.maxPrice || c.price <= Number(filters.maxPrice)) && (!filters.maxMileage || c.mileage <= Number(filters.maxMileage)) && (!filters.fuel || c.fuel === filters.fuel) && (!filters.transmission || c.transmission === filters.transmission) && (!filters.bodyType || c.bodyType === filters.bodyType) && (!filters.condition || c.condition === filters.condition) && (!filters.sellerType || c.sellerType === filters.sellerType)).sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "new" ? b.year - a.year : sort === "mileage" ? a.mileage - b.mileage : 0), [query, region, sort, filters]);
  
  useEffect(() => { setPage(1) }, [query, region, filters, sort]);
  useEffect(() => {
    const loadAccount = async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      setAccount({ role: profile?.role ?? "buyer" });
    };
    void loadAccount();
  }, []);
  useEffect(() => {
    if (view !== "results") return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (region) params.set("region", region);
    if (sort !== "relevance") params.set("sort", sort);
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value) });
    window.history.replaceState({}, "", `/cars-for-sale/${params.size ? `?${params.toString()}` : ""}`)
  }, [view, query, region, sort, filters]);
  
  const search = (e: FormEvent) => { e.preventDefault(); setView("results"); };
  const favourite = (id: string | number) => setFav(x => x.includes(id) ? x.filter(v => v !== id) : [...x, id]);
  const nav = (v: typeof view) => { setView(v); window.scrollTo({ top: 0, behavior: "smooth" }); };
  
  const handleViewCar = (id: string | number) => {
    setActiveCarId(id);
    nav("detail");
  };

  const currentCar = cars.find((car) => car.id === activeCarId) ?? cars[0];

  return <>
    <header><div className="header"><LinkLogo /><nav><button onClick={() => nav("results")}>Buy a car</button><button onClick={() => nav("sell")}>Sell my car</button><button onClick={() => nav("value")}>Value my car</button><button>News & reviews⌄</button><button onClick={() => nav("finance")}>Tools & services</button></nav><div className="headerRight"><button className="lang" onClick={() => setLang(lang === "EN" ? "SW" : "EN")}>{lang} / {lang === "EN" ? "SW" : "EN"}</button><button className="dealerLogin" onClick={() => window.location.assign(account?.role === "seller" || account?.role === "dealer" ? "/seller/create-listing" : "/seller/onboarding")}>{account?.role === "seller" || account?.role === "dealer" ? "Seller dashboard" : "For dealers"}</button><button className="account" onClick={() => window.location.assign(account ? "/account" : "/auth")}>◯ {account ? "My account" : "Sign in"}</button></div></div></header>
    {notice && <div className="toast" role="status">{notice}</div>}
    {view === "home" && <Home cars={cars} search={search} query={query} setQuery={setQuery} region={region} setRegion={setRegion} count={filtered.length} nav={nav} setDrawer={setDrawer} lang={lang} onViewCar={handleViewCar} />}
    {view === "results" && <Results availableCars={cars} cars={filtered} query={query} setQuery={setQuery} region={region} setRegion={setRegion} search={search} sort={sort} setSort={setSort} drawer={drawer} setDrawer={setDrawer} favourite={favourite} fav={fav} nav={nav} filters={filters} setFilters={setFilters} page={page} setPage={setPage} onViewCar={handleViewCar} />}
    {view === "detail" && <Detail car={currentCar} favourite={favourite} fav={fav} onBack={() => nav("results")} setNotice={setNotice} nav={nav} />}
    {view === "finance" && <Finance />}{view === "value" && <Value nav={nav} />} {view === "sell" && <Sell setNotice={setNotice} />} {view === "dealer" && <DealerDashboard setNotice={setNotice} />}<Footer /><MobileNav nav={nav} setDrawer={setDrawer} fav={fav.length} lang={lang} /></>;
}

function Search({ search, query, setQuery, region, setRegion, availableCars, count, setDrawer }: { search: (e: FormEvent) => void; query: string; setQuery: (s: string) => void; region: string; setRegion: (s: string) => void; availableCars: Vehicle[]; count: number; setDrawer?: (x: boolean) => void }): ReactNode { 
  return <form className="search" onSubmit={search}>
    <label><span>Make, model or keyword</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. Toyota Harrier" /></label>
    <label><span>Location</span><select value={region} onChange={e => setRegion(e.target.value)}><option value="">All Tanzania</option>{[...new Set(availableCars.map(c => c.region))].map(x => <option key={x}>{x}</option>)}</select></label>
    <button className="filter" type="button" onClick={() => setDrawer?.(true)}> Filters</button>
    <button className="primary">Search {count} cars</button>
  </form> 
}

function Home(p: any): ReactNode { 
  return <main>
    <section className="hero">
      <div className="heroCopy"><p className="eyebrow">TANZANIA'S CAR MARKETPLACE</p><h1>Find your next journey.</h1><p>Buy and sell new, foreign used and local used cars with trusted dealers and private sellers across Tanzania.</p></div>
      <div className="searchWrap"><div className="tabs"><b>Cars</b><span>Commercial</span><span>Motorcycles</span></div><Search {...p} availableCars={p.cars} /></div>
    </section>
    <section className="container budget"><div><p className="eyebrow">PLAN WITH CONFIDENCE</p><h2>Buy within your budget</h2><p>See what your monthly payment could get you.</p></div><BudgetMini nav={p.nav} /></section>
    <section className="container splitPromo">
      <div><p className="eyebrow">SELL WITH GARILINK TZ</p><h2>Ready to sell your car?</h2><p>Reach serious buyers throughout Dar es Salaam, Arusha, Dodoma, Mwanza and Tanzania. Create your advert in minutes.</p><button className="primary" onClick={() => p.nav("sell")}>Sell my car</button></div>
      <div className="valueCard"><span>✦</span><h3>Know what it's worth</h3><p>Get a free estimated car valuation using comparable Tanzania listings.</p><button onClick={() => p.nav("value")}>Value my car →</button></div>
    </section>
    <section className="container">
      <div className="sectionTitle"><div><p className="eyebrow">HANDPICKED FOR YOU</p><h2>Featured vehicles</h2></div><button onClick={() => p.nav("results")}>View all cars →</button></div>
      <div className="grid">{p.cars.slice(0, 3).map((c: Vehicle) => <Card key={c.id} car={c} favourite={() => { }} onView={p.onViewCar} />)}</div>
    </section>
    <Trust setNotice={() => { }} />
    <section className="container editorial"><p className="eyebrow">ON THE ROAD</p><h2>Advice for every journey</h2><div className="articles"><article><b>Buying guide</b><h3>What to check before you buy a used car in Tanzania</h3><a>Read guide →</a></article><article><b>Finance</b><h3>Understanding your vehicle finance options</h3><a>Explore finance →</a></article><article><b>Safety</b><h3>How to buy and sell cars safely online</h3><a>Stay protected →</a></article></div></section>
  </main> 
}

function BudgetMini({ nav }: { nav: any }): ReactNode { 
  const [budget, setBudget] = useState(900000); 
  const buying = Math.round(budget * 52); 
  return <div className="budgetCalc">
    <label>Monthly budget<input type="number" value={budget} onChange={e => setBudget(+e.target.value)} /></label>
    <p>Estimated buying power <strong>{money(buying)}</strong></p>
    <button onClick={() => nav("finance")}>Calculate finance →</button>
  </div> 
}

function Card({ car, favourite, fav, onView }: { car: Vehicle; favourite: () => void; open?: () => void; fav?: boolean; onView: (id: string | number) => void }): ReactNode { 
  const open = () => onView(car.id);
  return <article className="carCard">
    <div className="carImage" onClick={open} role="button" tabIndex={0}>
      <img src={getImageUrl(car.image)} alt={`${car.year} ${car.make} ${car.model} for sale`} loading="lazy" decoding="async" onError={(event) => { const image = event.currentTarget; if (!image.dataset.fallbackTried) { image.dataset.fallbackTried = "true"; image.src = getImageFallbackUrl(image.src); } }} />
      <span className="photos">▧ 12</span>
      <button aria-label="Save vehicle" onClick={e => { e.stopPropagation(); favourite() }} className={fav ? "heart active" : "heart"}>♥</button>
    </div>
    <div className="cardBody">
      <div className="badgeRow"><div className="badge">{car.badge}</div>{car.verified && <div className="verified">✓ Verified</div>}</div>
      <h3 onClick={open}>{car.year} {car.make} {car.model} {car.variant} – {car.region}</h3>
      <p>{car.sellerType} · {car.bodyType}</p>
      <strong>{money(car.price)}</strong>
      <small>{car.mileage.toLocaleString()} km · {car.transmission} · {car.fuel}</small>
      <footer>{car.dealer} <span> {car.region}</span></footer>
    </div>
  </article> 
}

function Results({ cars: shown, availableCars, query, setQuery, region, setRegion, search, sort, setSort, drawer, setDrawer, favourite, fav, nav, filters, setFilters, page, setPage, onViewCar }: any): ReactNode { 
  const perPage = 4; 
  const totalPages = Math.max(1, Math.ceil(shown.length / perPage)); 
  const visible = shown.slice((page - 1) * perPage, page * perPage); 
  return <main className="container results">
    <p className="crumb">Home / Cars for sale</p>
    <h1>Cars for sale in Tanzania</h1>
    <div className="resultsSearch"><Search search={search} query={query} setQuery={setQuery} region={region} setRegion={setRegion} availableCars={availableCars} count={shown.length} setDrawer={setDrawer} /><button className="mobileFilter" onClick={() => setDrawer(true)}>☷ Filters</button></div>
    <div className="chips">{query && <button onClick={() => setQuery("")}>Keyword: {query} ×</button>}{region && <button onClick={() => setRegion("")}>Region: {region} ×</button>}{Object.entries(filters).filter(([, value]) => value).map(([key, value]) => <button key={key} onClick={() => setFilters({ ...filters, [key]: "" })}>{key.replace(/([A-Z])/g, " $1")}: {String(value)} ×</button>)}</div>
    <div className="resultHeading"><b>{shown.length} vehicles found</b><label>Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option value="relevance">Relevance</option><option value="new">Newest model year</option><option value="low">Price low-high</option><option value="high">Price high-low</option><option value="mileage">Mileage low-high</option></select></label></div>
    <div className="resultsLayout">
      <aside className="side"><h3>Refine your search</h3><button onClick={() => setDrawer(true)}>Open filters</button><p>Search alerts</p><p>Dealer discovery</p><div className="safe"><b>Stay safe</b><br />Never pay a deposit before seeing the vehicle and seller.</div></aside>
      <section>
        <div className="sponsored">Sponsored listings</div>
        {visible.map((c: Vehicle, i: number) => <div key={c.id}>{i === 2 && <div className="insert"><b>Thinking of selling?</b><span>Get your free car valuation today.</span><button onClick={() => nav("value")}>Value my car</button></div>}<Card car={c} favourite={() => favourite(c.id)} fav={fav.includes(c.id)} onView={onViewCar} /></div>)}
        {!shown.length && <div className="empty"><h2>No cars matched that search</h2><p>Try removing a filter or searching a different make.</p><button onClick={() => { setQuery(""); setRegion(""); setFilters({ minPrice: "", maxPrice: "", maxMileage: "", fuel: "", transmission: "", bodyType: "", condition: "", sellerType: "" }) }}>Clear filters</button></div>}
        {shown.length > perPage && <div className="pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>← Previous</button><span>Page {page} of {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next →</button></div>}
      </section>
    </div>
      {drawer && <Filter availableCars={availableCars} setDrawer={setDrawer} region={region} setRegion={setRegion} filters={filters} setFilters={setFilters} />}
  </main> 
}

function Filter({ availableCars, setDrawer, region, setRegion, filters, setFilters }: any): ReactNode { 
  const reset = () => { setRegion(""); setFilters({ minPrice: "", maxPrice: "", maxMileage: "", fuel: "", transmission: "", bodyType: "", condition: "", sellerType: "" }) }; 
  const field = (name: string, label: string, type = "text") => <label>{label}<input type={type} value={filters[name]} onChange={e => setFilters({ ...filters, [name]: e.target.value })} /></label>; 
  const select = (name: string, label: string, options: string[]) => <label>{label}<select value={filters[name]} onChange={e => setFilters({ ...filters, [name]: e.target.value })}><option value="">Any {label.toLowerCase()}</option>{options.map(option => <option key={option}>{option}</option>)}</select></label>; 
  return <div className="overlay">
    <aside className="drawer">
      <button className="close" onClick={() => setDrawer(false)}>×</button>
      <h2>Filters</h2>
      <label>Region<select value={region} onChange={e => setRegion(e.target.value)}><option value="">Any region</option>{[...new Set((availableCars as Vehicle[]).map(c => c.region))].map(x => <option key={x}>{x}</option>)}</select></label>
      <div className="filterGrid">{field("minPrice", "Price from (TZS)", "number")}{field("maxPrice", "Price to (TZS)", "number")}{field("maxMileage", "Maximum mileage", "number")}{select("fuel", "Fuel", ["Petrol", "Diesel", "Hybrid", "Electric"])}{select("transmission", "Transmission", ["Automatic", "Manual"])}{select("bodyType", "Body type", ["Sedan", "SUV", "Hatchback", "Pickup", "Van", "Minibus"])}{select("condition", "Condition", ["Foreign Used", "Local Used", "Brand New", "Reconditioned"])}{select("sellerType", "Seller type", ["Dealer", "Private"])}</div>
      <div className="drawerActions"><button onClick={reset}>Reset</button><button className="primary" onClick={() => setDrawer(false)}>Show results</button></div>
    </aside>
  </div> 
}

function Detail({ car, favourite, fav, onBack, setNotice, nav }: any): ReactNode { 
  const [expanded, setExpanded] = useState(false);
  const [contact, setContact] = useState(false);
  const [viewing, setViewing] = useState(false);
  
  const whatsappText = "Hello, I am interested in the " + car.year + " " + car.make + " " + car.model + " listed on GariLink TZ. Is it still available?";
  const wa = "https://wa.me/255712555010?text=" + encodeURIComponent(whatsappText);
  
  return (
    <main className="container detail">
      <button className="back" onClick={onBack}>← Back to results</button>
      <p className="crumb">Cars for sale / {car.make} / {car.model}</p>
      <div className="detailTop">
        <div>
          <p className="eyebrow">{car.condition} · {car.verified ? "VERIFIED" : "PRIVATE SELLER"}</p>
          <h1>{car.year} {car.make} {car.model} {car.variant} – {car.region}</h1>
          <h2>{car.badge} · {car.sellerType}</h2>
        </div>
        <div>
          <button onClick={() => favourite(car.id)} className={fav.includes(car.id) ? "saved" : ""}>♥ Save</button>
          <button onClick={() => setContact(true)} className="primary">Contact seller</button>
        </div>
      </div>
      
      <section className="gallery" aria-label="Swipeable vehicle gallery" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ backgroundImage: `url(${getImageUrl(car.image)})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '300px', borderRadius: '8px' }} />
        <div style={{ backgroundImage: `url(${getImageUrl(car.image)})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '300px', borderRadius: '8px' }} />
        <div style={{ backgroundImage: `url(${getImageUrl(car.image)})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '300px', borderRadius: '8px' }} />
        <div style={{ backgroundImage: `url(${getImageUrl(car.image)})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '300px', borderRadius: '8px' }} />
      </section>
      
      <div className="detailLayout">
        <div>
          <section className="specs">
            {[["Condition", car.condition], ["Mileage", car.mileage.toLocaleString() + " km"], ["Transmission", car.transmission], ["Fuel", car.fuel], ["Engine", "2,755 cc"], ["Drive", "4x4"], ["Seats", "7"]].map(x => (
              <div key={x[0]}><small>{x[0]}</small><b>{x[1]}</b></div>
            ))}
          </section>
          <section>
            <h2>Full specifications</h2>
            <table className="specTable">
              <tbody>
                {[["Body type", car.bodyType], ["Engine", "2,755 cc diesel"], ["Drive", "4x4"], ["Doors", "5"], ["Seats", "7"], ["Registration", "Included"], ["Duty paid", "Yes"]].map(x => (
                  <tr key={x[0]}><th>{x[0]}</th><td>{x[1]}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
          <section>
            <h2>GariLink Insights</h2>
            <div className="insights">
              <span>✓ Strong resale demand</span>
              <span>✓ Popular family SUV</span>
              <span>✓ Fair fuel economy</span>
            </div>
          </section>
          <section>
            <h2>Seller's comments</h2>
            <p>
              {expanded 
                ? "Clean, carefully maintained Toyota Prado with a full service history. Duty paid and registration included. It has a comfortable leather interior, reverse camera and factory 4x4 capability. Viewing is available at our Dar es Salaam showroom." 
                : "Clean, carefully maintained Toyota Prado with a full service history. Duty paid and registration included…"
              }
            </p>
            <button onClick={() => setExpanded(!expanded)}>{expanded ? "Read less" : "Read more"}</button>
          </section>
        </div>
        
        <aside className="pricePanel">
          <small>Price · {car.badge}</small>
          <h2>{money(car.price)}</h2>
          <p>Price before transfer fees.</p>
          <a className="whatsapp" href={wa} target="_blank" rel="noopener noreferrer">◉ Chat on WhatsApp</a>
          <button className="primary" onClick={() => setViewing(true)}>Request Viewing</button>
          <button onClick={() => nav("finance")}>Calculate Finance</button>
          <button onClick={() => favourite(car.id)}>♥ Save</button>
          <hr />
          <b>{car.dealer}</b>
          <span>★ 4.7 (38 reviews)</span>
          <small>{car.region} · {car.verified ? "Verified dealer" : "Private seller"}</small>
        </aside>
      </div>
      
      {contact && <Contact car={car} close={() => setContact(false)} setNotice={setNotice} />} 
      {viewing && <ViewingFlow car={car} close={() => setViewing(false)} setNotice={setNotice} />}
    </main>
  );
}

function Contact({ car, close, setNotice }: any): ReactNode { 
  const submit = (e: FormEvent) => { e.preventDefault(); close(); setNotice("Your enquiry has been saved and sent to the seller.") }; 
  return <div className="overlay">
    <form className="modal" onSubmit={submit}>
      <button type="button" className="close" onClick={close}>×</button>
      <p className="eyebrow">CONTACT SELLER</p>
      <h2>Ask about this {car.make}</h2>
      <label>Name<input required placeholder="Your name" /></label>
      <label>Email<input required type="email" placeholder="you@example.com" /></label>
      <label>Tanzanian mobile number<input required pattern="^\+255[0-9]{9}$" placeholder="+255 7XX XXX XXX" /></label>
      <label>Preferred contact<select><option>Phone call</option><option>WhatsApp</option><option>Email</option></select></label>
      <label>Message<textarea defaultValue={`Hello, I would like to check the availability of this ${car.year} ${car.make} ${car.model}.`} /></label>
      <small>We never share your details without your permission.</small>
      <button className="primary">Send message</button>
    </form>
  </div> 
}

function Finance(): ReactNode { 
  const [price, setPrice] = useState(65000000), [deposit, setDeposit] = useState(20), [years, setYears] = useState(5), [rate, setRate] = useState(16), [applied, setApplied] = useState(false); 
  const principal = price * (1 - deposit / 100), mrate = rate / 1200, months = years * 12, monthly = Math.round(principal * mrate * Math.pow(1 + mrate, months) / (Math.pow(1 + mrate, months) - 1)); 
  return <main className="container toolPage">
    <p className="eyebrow">GARILINK TZ TOOLS</p>
    <h1>Car finance calculator</h1>
    <p>Plan your budget with an illustrative repayment estimate. This is not a loan offer.</p>
    <div className="calculator">
      <div><label>Vehicle price<input type="number" value={price} onChange={e => setPrice(+e.target.value)} /></label><label>Deposit ({deposit}%)<input type="range" min="0" max="60" value={deposit} onChange={e => setDeposit(+e.target.value)} /></label><label>Loan period ({years} years)<input type="range" min="1" max="7" value={years} onChange={e => setYears(+e.target.value)} /></label><label>Interest rate ({rate}% p.a.)<input type="range" min="8" max="30" value={rate} onChange={e => setRate(+e.target.value)} /></label></div>
      <aside><small>ESTIMATED MONTHLY REPAYMENT</small><h2>{money(monthly)}</h2><p>Amount financed: {money(principal)}</p><p>Based on {years * 12} monthly payments at {rate}% p.a.</p></aside>
    </div>
    <section className="leadForms">
      <form onSubmit={e => { e.preventDefault(); setApplied(true) }}>
        <h2>Apply for Vehicle Finance</h2>
        <p>Send your details to participating bank partners: CRDB, NMB and NBC.</p>
        <input required placeholder="Your name" /><input required placeholder="+255 phone number" /><input required placeholder="Car of interest" /><input required type="number" placeholder="Monthly income (TZS)" />
        <button className="primary">Apply for finance</button>
        {applied && <small>Application received. A partner will contact you.</small>}
      </form>
      <div><h2>Get Insurance Quote</h2><p>Compare cover options from our insurance partners.</p><button className="primary">Get Insurance Quote</button></div>
    </section>
  </main> 
}

function Value({ nav }: any): ReactNode { 
  const [done, setDone] = useState(false); 
  return <main className="container toolPage">
    <p className="eyebrow">FREE CAR VALUATION</p>
    <h1>What is your car worth?</h1>
    <p>Get an estimate using comparable listings in Tanzania. It is an indication, not a guaranteed selling price.</p>
    {done ? <div className="valuation"><p>YOUR ESTIMATED RANGE</p><h2>{money(58000000)} – {money(68000000)}</h2><p>Based on recent Toyota Harrier listings in Dar es Salaam.</p><button className="primary" onClick={() => nav("sell")}>Create a private listing</button><button onClick={() => nav("results")}>Browse replacement cars</button></div> : <form className="valueForm" onSubmit={e => { e.preventDefault(); setDone(true) }}><label>Make and model<input required placeholder="e.g. Toyota Harrier" /></label><label>Registration year<input required type="number" placeholder="2020" /></label><label>Mileage<input required type="number" placeholder="60,000" /></label><label>Region<select><option>Dar es Salaam</option><option>Arusha</option><option>Dodoma</option></select></label><button className="primary">Get my estimate</button></form>}
  </main> 
}

function Sell({ setNotice }: any): ReactNode { 
  const [step, setStep] = useState(1); 
  const titles = ["Vehicle identity", "Condition & specifications", "Ownership and history", "Features", "Price", "Location", "Contact preferences", "Photos", "Preview", "Package & payment", "Submit for review"]; 
  return <main className="container toolPage">
    <p className="eyebrow">SELL ON GARILINK TZ</p>
    <h1>List your car</h1>
    <div className="wizard">
      <aside>{titles.map((t, i) => <button className={step === i + 1 ? "current" : ""} onClick={() => setStep(i + 1)} key={t}>{i + 1}. {t}</button>)}</aside>
      <section>
        <p>STEP {step} OF 11</p>
        <h2>{titles[step - 1]}</h2>
        <label>Make and model<input placeholder="Toyota Prado" /></label>
        <label>Registration year<input type="number" placeholder="2021" /></label>
        <label>Vehicle details<textarea placeholder="Tell buyers about the car" /></label>
        <div className="wizardNav"><button disabled={step === 1} onClick={() => setStep(step - 1)}>Back</button>{step === 11 ? <button className="primary" onClick={() => setNotice("Your listing was submitted for moderation.")}>Submit listing</button> : <button className="primary" onClick={() => setStep(step + 1)}>Save & continue</button>}</div>
        <small>Draft saved locally. Payment and moderation are demo flows.</small>
      </section>
    </div>
  </main> 
}

function ViewingFlow({ car, close, setNotice }: any): ReactNode { 
  const [step, setStep] = useState(1); 
  const code = `${car.model.toUpperCase().replaceAll(" ", "")}-4832`; 
  const done = (e: FormEvent) => { e.preventDefault(); if (step < 3) setStep(step + 1); else { close(); setNotice(`Viewing code ${code} created. Demo delivery via SMS/WhatsApp.`) } }; 
  return <div className="overlay">
    <form className="modal viewing" onSubmit={done}>
      <button type="button" className="close" onClick={close}>×</button>
      <p className="eyebrow">VERIFIED VIEWING</p>
      <div className="steps"><b className={step >= 1 ? "on" : ""}>1 Request</b><b className={step >= 2 ? "on" : ""}>2 Pay</b><b className={step >= 3 ? "on" : ""}>3 Get Code</b><b>4 View</b><b>5 Confirm</b></div>
      {step === 1 && <><h2>Request a viewing</h2><p>For {car.year} {car.make} {car.model} in {car.region}.</p><label>Name<input required placeholder="Your name" /></label><label>Phone<input required pattern="^\+255[0-9]{9}$" placeholder="+255 7XX XXX XXX" /></label><label>Date & time<input required type="datetime-local" /></label></>}
      {step === 2 && <><h2>Pay verification fee</h2><p>Pay <b>TSh 5,000</b> to receive your one-time viewing code.</p><label>Choose payment<select><option>M-Pesa</option><option>Tigo Pesa</option><option>Airtel Money</option></select></label><small>Gateway placeholder ready for Selcom or Flutterwave connection.</small></>}
      {step === 3 && <><h2>Your viewing code</h2><p className="code">{code}</p><p>Show this code to the dealer when you arrive. It is tied to your phone and this vehicle.</p><small>After the viewing, we will ask whether you bought the car and invite you to confirm with proof for a reward.</small></>}
      <button className="primary">{step === 3 ? "Finish" : "Continue"}</button>
    </form>
  </div> 
}

function Trust({ setNotice }: { setNotice: (s: string) => void }): ReactNode { 
  return <section className="container trust">
    <div><p className="eyebrow">BUY WITH CONFIDENCE</p><h2>Verified by GariLink</h2><p>We check logbook and TRA documents, match the chassis number, and offer optional mechanical inspection before you commit.</p><div className="history"><input placeholder="Enter chassis number to check vehicle history" /><button onClick={() => setNotice("Vehicle-history checks will be available when verification services are connected.")}>Check history</button></div></div>
    <aside><b>Safe Car Purchase Package</b><h3>TSh 100,000–250,000</h3><p>Document check, sale agreement, and TRA transfer assistance.</p><button>Request a package →</button></aside>
  </section> 
}

function DealerDashboard({ setNotice }: any): ReactNode { 
  return <main className="container toolPage">
    <p className="eyebrow">DEALER PORTAL</p>
    <h1>Manage your yard</h1>
    <div className="dealerStats"><span><b>124</b> listing views</span><span><b>38</b> WhatsApp clicks</span><span><b>12</b> viewing codes used</span></div>
    <div className="dealerPanel">
      <div><h2>Inventory</h2><p>Upload and manage listings, mark sold vehicles, and buy Featured placement.</p><button className="primary" onClick={() => setNotice("Listing upload is ready for the dealer onboarding flow.")}>Upload listing</button><button onClick={() => setNotice("Featured placement checkout is a local mobile-money demo.")}>Buy Featured placement</button></div>
      <div><h2>Confirm viewing code</h2><input placeholder="e.g. PRADO-4832" /><button className="primary" onClick={() => setNotice("Viewing code confirmed for this demo.")}>Confirm arrival</button></div>
    </div>
  </main> 
}

function MobileNav({ nav, setDrawer, fav, lang }: any): ReactNode { 
  return <nav className="bottomNav">
    <button onClick={() => nav("home")}>⌂<span>Home</span></button>
    <button onClick={() => { nav("results"); setDrawer(true) }}><span>{lang === "SW" ? "Tafuta Gari" : "Search"}</span></button>
    <button className="sellPlus" onClick={() => nav("sell")}>＋<span>{lang === "SW" ? "Uza Gari" : "Sell"}</span></button>
    <button onClick={() => nav("results")}>♥<span>Saved {fav ? `(${fav})` : ""}</span></button>
    <button onClick={() => nav("dealer")}>◯<span>Account</span></button>
  </nav> 
}

function Footer(): ReactNode { 
  return <footer className="footer">
    <div className="container footerGrid">
      <div><LinkLogo /><p>Connecting Tanzania to its next journey.</p><p>Dar es Salaam, Tanzania<br />+255 712 555 010 · hello@garilink.tz<br />WhatsApp support available</p></div>
      <div><b>Buyers</b><a>Cars for sale</a><a>Find a dealer</a><a>Finance calculator</a><a>Safety centre</a></div>
      <div><b>Sellers</b><a>Sell my car</a><a>Value my car</a><a>Dealer services</a><a>Become a Dealer</a><a>Help centre</a></div>
      <div><b>Stay in the loop</b><p>Helpful advice and great cars, occasionally.</p><div className="newsletter"><input placeholder="Your email" /><button>Subscribe</button></div></div>
    </div>
    <div className="container copyright">© 2026 GariLink Tz · Terms · Privacy · Cookie policy · EN / SW</div>
  </footer> 
}
