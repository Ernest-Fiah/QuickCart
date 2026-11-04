"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

// The TWO existing Morven navbars are rendered by app/layout.js.
// Keep this page underneath them. All apparel imagery and prices come from real uploaded products.
const CATEGORIES = [
  "SUIT", "SHIRT", "JACKET", "TROUSERS", "T-SHIRT",
  "KNITWEAR", "SWEATSHIRT", "OUTERWEAR", "SHOE",
  "ACCESSORY", "TUXEDO", "COMBINATIONS", "NEW ARRIVALS", "OUTLET",
];
const CATEGORY_LABELS = {
  SUIT: "Suits", SHIRT: "Shirts", JACKET: "Jackets", TROUSERS: "Trousers",
  "T-SHIRT": "T-Shirts & Polos", KNITWEAR: "Knitwear",
  SWEATSHIRT: "Sweatshirts", OUTERWEAR: "Outerwear",
  SHOE: "Shoes", ACCESSORY: "Accessories", TUXEDO: "Tuxedos",
  COMBINATIONS: "Combinations", "NEW ARRIVALS": "New Arrivals", OUTLET: "Outlet",
};
const MONEY = (value, currency) => {
  if (!Number.isFinite(Number(value))) return "Price on request";
  return currency + Number(value).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const Icon = ({ name, size = 17 }) => {
  const paths = {
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
    chevron: <path d="m9 5 7 7-7 7"/>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    shield: <><path d="m12 2 8 3v6c0 5-3 8-8 11C7 19 4 16 4 11V5l8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>,
    truck: <><path d="M2 5h12v12H2zM14 9h4l4 4v4h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    location: <><path d="M12 22s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size}
    fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    {paths[name] || paths.chevron}
  </svg>;
};

const ProductPhoto = ({ product, className = "", priority = false }) =>
  product?.image?.[0] ? (
    <Image unoptimized src={product.image[0]} width={500} height={580} priority={priority}
      loading={priority ? undefined : "lazy"} alt={product.name || "Morven product"}
      className={"h-full w-full object-contain " + className} />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-[#f3f0eb] text-[11px] text-[#a4a09b]">
      Image coming soon
    </div>
  );

const ProductCard = ({ product, currency }) => {
  const price = Number(product?.offerPrice);
  const regular = Number(product?.price);
  const discount = Number.isFinite(price) && Number.isFinite(regular) &&
    regular > price && regular > 0 ? Math.round((1 - price / regular) * 100) : 0;
  return (
    <Link href={"/product/" + product._id}
      className="group block min-w-0 overflow-hidden rounded-lg border border-[#eae4dc] bg-white p-2 transition hover:-translate-y-[2px] hover:border-[#cfa999] hover:shadow-[0_9px_25px_rgba(47,25,30,0.075)]">
      <div className="relative aspect-[4/4.7] overflow-hidden rounded-md bg-[#f5f2ee]">
        <ProductPhoto product={product}
          className="transition-transform duration-500 group-hover:scale-[1.055]"/>
        <span className="absolute bottom-2 left-2 rounded bg-white/95 px-2 py-1 text-[9px] font-medium text-[#43262e]">
          Morven
        </span>
      </div>
      <div className="min-w-0 px-1 pb-1 pt-2">
        <h3 className="line-clamp-2 min-h-[33px] text-[11px] font-medium leading-[1.5] text-[#2c2927]">
          {product.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <strong className="text-[12px] font-semibold tracking-tight text-[#6e2739] sm:text-[13px]">
            {MONEY(product.offerPrice, currency)}
          </strong>
          {discount > 0 && <span className="rounded-sm bg-[#f5e6e0] px-1.5 py-0.5 text-[9px] font-bold text-[#943c45]">-{discount}%</span>}
        </div>
        {discount > 0 && <p className="mt-0.5 truncate text-[9px] text-[#9c958e] line-through">{MONEY(product.price, currency)}</p>}
        <p className="mt-1.5 truncate text-[10px] text-[#978a82]">{CATEGORY_LABELS[product.category] || product.category}</p>
      </div>
    </Link>
  );
};

export default function Home() {
  const { products, productsLoading, fetchProductData, currency } = useAppContext();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [tab, setTab] = useState("Products");
  const [heroIndex, setHeroIndex] = useState(0);
  const [visible, setVisible] = useState(36);
  const sentinel = useRef(null);

  // Refresh the product catalog whenever visitors return from the seller upload page.
  useEffect(() => { fetchProductData(); }, []);
  const catalog = useMemo(() => Array.isArray(products)
    ? products.filter(p => p?._id)
    : [], [products]);
  const byCategory = (wanted) => catalog.find(p =>
    String(p.category || "").toUpperCase() === wanted && p?.image?.[0]);
  const heroProducts = useMemo(() => {
    const withImages = catalog.filter(p => p?.image?.[0]);
    return [byCategory("SUIT"), byCategory("SHIRT"), byCategory("JACKET")]
      .filter((p, i, a) => p && a.findIndex(x => x._id === p._id) === i)
      .concat(withImages).filter((p, i, a) => a.findIndex(x => x._id === p._id) === i)
      .slice(0, 3);
  }, [catalog]);
  const heroProduct = heroProducts[heroIndex % (heroProducts.length || 1)];
  const shirtProduct = byCategory("SHIRT") || catalog.find(p => p?.image?.[0]);
  const categoriesWithImages = CATEGORIES
    .filter(c => catalog.some(p => String(p.category || "").toUpperCase() === c && p?.image?.[0]))
    .slice(0, 8);
  const sorted = useMemo(() => [...catalog].sort((a, b) =>
    Number(b.date || 0) - Number(a.date || 0)), [catalog]);
  const filtered = useMemo(() => sorted.filter(p => {
    const cat = String(p.category || "").toUpperCase();
    const catMatch = !category || cat === category;
    const term = query.toLowerCase().trim();
    const searchMatch = !term || [p.name, p.category, p.description].some(x =>
      String(x || "").toLowerCase().includes(term));
    return catMatch && searchMatch;
  }), [sorted, category, query]);
  const displayed = filtered.slice(0, visible);

  useEffect(() => setVisible(36), [query, category]);
  // Continuous Alibaba-style feed. Each batch loads as the visitor scrolls.
  useEffect(() => {
    if (visible >= filtered.length || !sentinel.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) setVisible(v => Math.min(v + 36, filtered.length));
    }, { rootMargin: "600px 0px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [visible, filtered.length]);
  useEffect(() => {
    if (heroProducts.length < 2) return;
    const interval = setInterval(() => setHeroIndex(i => (i + 1) % heroProducts.length), 6500);
    return () => clearInterval(interval);
  }, [heroProducts.length]);

  const scrollToFeed = () => document.getElementById("morven-feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const applyCategory = value => {
    setCategory(value);
    setQuery("");
    setInput("");
    scrollToFeed();
  };
  const search = event => {
    event.preventDefault();
    setQuery(input);
    setCategory("");
    scrollToFeed();
  };
  const selectTab = name => {
    setTab(name);
    if (name === "New Arrivals" || name === "Products") {
      setCategory("");
      setQuery("");
      scrollToFeed();
    } else if (name === "Collections") {
      document.getElementById("morven-collections")?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#faf8f5] text-[#2c2827]">
        <div className="mx-auto max-w-[1520px] px-3 pb-20 pt-3 sm:px-5 lg:px-7">
          {/* Morven marketplace search, below the existing TWO navbars */}
          <div className="mx-auto max-w-[940px]">
            <div className="flex flex-wrap justify-center gap-5 border-b border-[#eee7e1] py-2 text-[12px] font-semibold sm:gap-9">
              {["Discover", "Products", "Collections", "New Arrivals"].map(name => (
                <button type="button" key={name} onClick={() => selectTab(name)}
                  className={"border-b-2 pb-3 transition " + (tab === name
                    ? "border-[#832d43] text-[#832d43]"
                    : "border-transparent text-[#3f3836] hover:text-[#832d43]")}>
                  {name}
                </button>
              ))}
            </div>
            <form role="search" onSubmit={search}
              className="mt-3 flex items-center gap-2 rounded-full border-2 border-[#894052] bg-white p-[5px] shadow-[0_5px_16px_rgba(91,39,53,0.06)]">
              <div className="pl-3 text-[#8b817b]"><Icon name="search" /></div>
              <input type="search" value={input} onChange={e => setInput(e.target.value)}
                aria-label="Search Morven products"
                placeholder="Search suits, shirts, jackets, trousers and more..."
                className="min-w-0 flex-1 border-none bg-transparent px-1 py-2.5 text-[12px] outline-none placeholder:text-[#a39a92] sm:text-[13px]"/>
              <button type="submit" className="shrink-0 rounded-full bg-[#7c273d] px-5 py-2.5 text-[11px] font-bold text-white hover:bg-[#5f1f30] sm:px-8">
                Search
              </button>
            </form>
            <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-[#8d827b]">
              <span>Popular searches:</span>
              {["Suits", "Shirts", "Trousers", "Shoes", "Accessories"].map((name, i) => (
                <button type="button" key={name} onClick={() => applyCategory(["SUIT", "SHIRT", "TROUSERS", "SHOE", "ACCESSORY"][i])}
                  className="underline-offset-2 hover:text-[#832d43] hover:underline">{name}</button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-2 border-y border-[#ece7e0] bg-white p-3 sm:grid-cols-3 sm:divide-x sm:divide-[#ede7e0]">
            {[
              { icon: "location", title: "🇬🇭 Morven Ghana", text: "Spintex, Accra, Ghana" },
              { icon: "shield", title: "Secure checkout", text: "Complete orders with Paystack" },
              { icon: "bag", title: "Premium menswear", text: "Browse suits, shirts, shoes & accessories" },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 px-2 py-1.5 sm:px-4">
                <span className="text-[#903d50]"><Icon name={item.icon} size={23}/></span>
                <div className="min-w-0">
                  <h2 className="text-[11px] font-semibold">{item.title}</h2>
                  <p className="mt-0.5 truncate text-[10px] text-[#938a84]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Alibaba-like category rail + premium product hero + promotional tile */}
          <section className="mt-3 grid gap-3 lg:grid-cols-[205px_minmax(0,1fr)_235px]" aria-label="Featured Morven collections">
            <aside className="rounded-lg border border-[#e8e1da] bg-white p-3">
              <h2 className="mb-3 border-b border-[#eee8e2] pb-2 text-[13px] font-semibold">All Categories</h2>
              <div className="grid grid-cols-2 gap-0.5 sm:grid-cols-3 lg:grid-cols-1">
                {CATEGORIES.map(cat => (
                  <button type="button" key={cat} onClick={() => applyCategory(cat)}
                    className={"flex min-w-0 items-center justify-between gap-2 rounded px-2 py-[6px] text-left text-[11px] transition " +
                      (category === cat ? "bg-[#f6e9e6] text-[#7c273d]" : "hover:bg-[#f9f3ef] hover:text-[#7c273d]")}>
                    <span className="truncate">{CATEGORY_LABELS[cat] || cat}</span><span className="text-[#9e928a]"><Icon name="chevron" size={12}/></span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="relative min-h-[290px] overflow-hidden rounded-xl bg-gradient-to-br from-[#40202a] via-[#612a3a] to-[#9b5e58] text-white sm:min-h-[350px]">
              <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[44px] border-white/5"/>
              <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#d9a989]/10 blur-3xl"/>
              {heroProduct && (
                <div className="absolute bottom-0 right-0 top-0 w-[53%] overflow-hidden">
                  <ProductPhoto product={heroProduct} priority
                    className="object-contain object-bottom drop-shadow-[0_20px_32px_rgba(0,0,0,0.24)]"/>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#572a35]/70 via-transparent to-transparent"/>
                </div>
              )}
              <div className="relative z-10 flex h-full max-w-[67%] flex-col items-start justify-center px-6 py-10 sm:max-w-[62%] sm:px-10">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#e7c2ad]">Morven Menswear · Ghana</span>
                <h1 className="mt-4 max-w-sm font-serif text-[29px] leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
                  {heroIndex % 3 === 1 ? "Everyday Style, Elevated." : heroIndex % 3 === 2 ? "Refined For Every Occasion." : "Premium Suit Collection."}
                </h1>
                <p className="mt-3 max-w-[300px] text-[11px] leading-5 text-[#f0dcd6] sm:text-[13px]">
                  Discover the latest pieces in our collection and find your signature look.
                </p>
                <Link href={heroProduct ? "/product/" + heroProduct._id : "/all-products"}
                  className="mt-6 inline-flex items-center gap-3 rounded-md bg-[#fcf6ef] px-5 py-2.5 text-[11px] font-semibold text-[#6a2939] shadow hover:bg-white">
                  Shop Now <Icon name="arrow" size={14}/>
                </Link>
              </div>
              {heroProducts.length > 1 && (
                <>
                  <button type="button" aria-label="Previous feature"
                    onClick={() => setHeroIndex(i => (i - 1 + heroProducts.length) % heroProducts.length)}
                    className="absolute left-3 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#562733] sm:flex">
                    <span className="rotate-180"><Icon name="chevron"/></span>
                  </button>
                  <button type="button" aria-label="Next feature"
                    onClick={() => setHeroIndex(i => (i + 1) % heroProducts.length)}
                    className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#562733]">
                    <Icon name="chevron"/>
                  </button>
                  <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                    {heroProducts.map((p, i) => (
                      <button type="button" key={p._id} onClick={() => setHeroIndex(i)}
                        aria-label={"Show featured item " + (i + 1)}
                        className={"h-[6px] rounded-full " + (i === heroIndex ? "w-5 bg-[#f1c5aa]" : "w-[6px] bg-white/60")}/>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link href={shirtProduct ? "/product/" + shirtProduct._id : "/all-products"}
              className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-xl border border-[#ece3dc] bg-gradient-to-b from-[#f7eeea] to-[#e5d4cb] p-5 sm:min-h-[290px]">
              <h2 className="relative z-10 max-w-[160px] font-serif text-[25px] font-semibold leading-tight text-[#422d31]">Shirt Collection</h2>
              <p className="relative z-10 mt-2 max-w-[160px] text-[11px] leading-5 text-[#6e5a55]">Essential styles for work and everyday confidence.</p>
              {shirtProduct && <div className="absolute bottom-0 right-0 h-[70%] w-[67%]">
                <ProductPhoto product={shirtProduct} className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"/>
              </div>}
              <span className="relative z-10 mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[#852d42]">
                Shop Shirts <Icon name="arrow" size={13}/>
              </span>
            </Link>
          </section>

          {/* Product-driven image shortcuts; no outside or invented product photos. */}
          <section id="morven-collections" className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8" aria-label="Shop collections">
            {categoriesWithImages.map(cat => {
              const prod = catalog.find(p => String(p.category).toUpperCase() === cat && p?.image?.[0]);
              return <button type="button" key={cat} onClick={() => applyCategory(cat)}
                className="group flex flex-col items-center overflow-hidden rounded-lg border border-[#e9e3dc] bg-white p-1.5 transition hover:border-[#c69a8d]">
                <div className="aspect-square w-full overflow-hidden rounded-md bg-[#f5f2ee]">
                  <ProductPhoto product={prod} className="group-hover:scale-105 transition-transform"/>
                </div>
                <span className="truncate px-1 py-2 text-center text-[10px] font-semibold">
                  {CATEGORY_LABELS[cat] || cat}
                </span>
              </button>;
            })}
          </section>

          <section id="morven-feed" className="scroll-mt-40 pt-8" aria-labelledby="featured-title">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="featured-title" className="text-[19px] font-semibold tracking-tight">
                  {query ? "Search Results" : category ? CATEGORY_LABELS[category] || category : "Featured Products & More"}
                </h2>
                <p className="mt-1 text-[11px] text-[#998c85]">
                  {filtered.length} {filtered.length === 1 ? "product" : "products"} · All new Morven uploads join this collection
                </p>
              </div>
              {(query || category) && <button type="button" onClick={() => { setCategory(""); setQuery(""); setInput(""); }}
                className="rounded-full border border-[#d6c7be] px-4 py-2 text-[11px] font-semibold text-[#7a2b3d] hover:border-[#7a2b3d]">
                View All Products
              </button>}
            </div>

            {filtered.length ? (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {displayed.map(product => <ProductCard key={product._id} product={product} currency={currency}/>)}
                </div>
                {visible < filtered.length && (
                  <div ref={sentinel} className="flex justify-center py-10">
                    <span className="rounded-full border border-[#e5d9d1] bg-white px-6 py-2 text-[11px] text-[#8c7873]">
                      Loading more Morven products…
                    </span>
                  </div>
                )}
              </>
            ) : <div className="rounded-xl bg-white p-10 text-center text-[13px] text-[#958b85]">
              {productsLoading ? "Loading Morven products…" : "No items found. Try another category or search term."}
            </div>}
          </section>

          <div className="mt-12 grid gap-3 border-t border-[#ece3dd] pt-5 sm:grid-cols-2">
            <Link href="/all-products?category=SUIT" className="flex min-h-28 items-center justify-between overflow-hidden rounded-lg bg-[#f2e6df] px-6 py-4">
              <div><p className="font-serif text-[23px] font-semibold text-[#522c35]">The Suit Edit</p>
                <p className="mt-2 text-[11px] text-[#8b6c65]">Explore formal menswear by Morven</p></div>
              {byCategory("SUIT") && <div className="h-28 w-28"><ProductPhoto product={byCategory("SUIT")}/></div>}
            </Link>
            <Link href="/all-products?category=SHIRT" className="flex min-h-28 items-center justify-between overflow-hidden rounded-lg bg-[#ece8e4] px-6 py-4">
              <div><p className="font-serif text-[23px] font-semibold text-[#522c35]">Shirts & Essentials</p>
                <p className="mt-2 text-[11px] text-[#8b6c65]">Elevate the everyday</p></div>
              {byCategory("SHIRT") && <div className="h-28 w-28"><ProductPhoto product={byCategory("SHIRT")}/></div>}
            </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}
