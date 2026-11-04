"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

// Alibaba-style compact product marketplace, adapted to Morven's existing catalog.
// The first two website navbars are already supplied by app/layout.js.

const DEFAULT_CATEGORIES = [
  ["SUIT", "Suits & Blazers"],
  ["SHIRT", "Shirts"],
  ["JACKET", "Jackets"],
  ["TROUSERS", "Trousers"],
  ["T-SHIRT", "T-Shirts & Polos"],
  ["KNITWEAR", "Knitwear"],
  ["SWEATSHIRT", "Sweatshirts"],
  ["OUTERWEAR", "Outerwear"],
  ["SHOE", "Shoes"],
  ["ACCESSORY", "Accessories"],
  ["TUXEDO", "Tuxedos"],
  ["COMBINATIONS", "Combinations"],
  ["NEW ARRIVALS", "New Arrivals"],
  ["OUTLET", "Outlet"],
];
const money = (amount, currency) => {
  const value = Number(amount);
  return Number.isFinite(value)
    ? currency + value.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "Ask for price";
};

const ArrowRight = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3 shrink-0">
    <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SearchIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0">
    <circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.7 15.7 4.6 4.6"/>
  </svg>
);
const TileImage = ({ product, alt }) => (
  product?.image?.[0] ? (
    <Image
      unoptimized
      src={product.image[0]}
      width={400}
      height={560}
      loading="lazy"
      alt={alt || product.name || "Morven product"}
      className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.045]"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-[10px] text-[#999]">
      Morven
    </div>
  )
);

function MarketplaceProduct({ product, currency }) {
  const offer = Number(product.offerPrice);
  const regular = Number(product.price);
  const discount = Number.isFinite(offer) && Number.isFinite(regular) && regular > offer && regular > 0
    ? Math.round(100 * (regular - offer) / regular)
    : 0;
  return (
    <Link
      href={"/product/" + product._id}
      className="group block min-w-0 overflow-hidden rounded-[4px] border border-[#eaeaea] bg-white p-[5px] transition hover:border-[#ff9b59] hover:shadow-[0_3px_12px_rgba(0,0,0,0.07)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-[#f6f5f3]">
        {product.image?.[0] ? (
          <Image
            unoptimized
            src={product.image[0]}
            width={380} height={395}
            alt={product.name || "Morven clothing"}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-[#aaa]">Image unavailable</div>
        )}
        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/95 px-1.5 py-[2px] text-[8px] font-semibold text-[#444]">
          Morven
        </span>
      </div>
      <div className="px-[2px] pb-1 pt-[6px]">
        <h3 className="line-clamp-2 min-h-[30px] text-[10px] font-normal leading-[15px] text-[#303030] sm:text-[11px]">
          {product.name}
        </h3>
        <p className="mt-[5px] truncate text-[12px] font-bold leading-4 text-[#202020] sm:text-[13px]">
          {money(product.offerPrice, currency)}
        </p>
        {discount > 0 ? (
          <div className="mt-[2px] flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[9px] text-[#969696] line-through">
              {money(product.price, currency)}
            </span>
            <span className="rounded-[2px] bg-[#fff0e6] px-1 text-[9px] font-semibold text-[#ed650e]">
              -{discount}%
            </span>
          </div>
        ) : null}
        <p className="mt-[4px] truncate text-[9px] text-[#8a8a8a]">{product.category || "Morven Collection"}</p>
      </div>
    </Link>
  );
}

function DiscoveryTile({ title, sub, product, accent, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group relative flex h-[224px] min-w-0 flex-col overflow-hidden rounded-[10px] border px-2.5 pb-2.5 pt-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(38,31,24,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff790f] sm:h-[211px] sm:px-3 " +
        (accent
          ? "border-[#e98b41] bg-gradient-to-br from-[#e86c21] via-[#f58a35] to-[#ffb16c]"
          : "border-[#e9e8e6] bg-white hover:border-[#edb68a]")
      }
    >
      <span className={"relative z-10 line-clamp-1 text-[11px] font-semibold leading-4 sm:text-[12px] " + (accent ? "text-white" : "text-[#252525]")}>
        {title}
      </span>
      <span className={"relative z-10 mt-0.5 line-clamp-1 text-[9px] sm:text-[10px] " + (accent ? "text-white/90" : "text-[#858585]")}>
        {sub}
      </span>
      <div
        className={"relative mt-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[7px] " +
          (accent
            ? "bg-[#fff2e5]/80 ring-1 ring-white/40"
            : "bg-[#f6f5f3]")}
      >
        {product?.image?.[0] && (
          <Image
            unoptimized
            aria-hidden="true"
            src={product.image[0]}
            width={400}
            height={560}
            loading="lazy"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.12] blur-xl"
          />
        )}
        <div className="relative z-[1] h-full max-h-[172px] max-w-full overflow-hidden rounded-[5px] shadow-[0_2px_9px_rgba(40,26,15,0.09)] aspect-[3/4]">
          <TileImage product={product} alt={title}/>
        </div>
        {accent && (
          <span className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-full bg-[#26201c] px-2.5 py-1.5 text-[9px] font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors group-hover:bg-black sm:px-3">
            Explore <ArrowRight/>
          </span>
        )}
      </div>
    </button>
  );
}

export default function Home() {
  const { products, productsLoading, fetchProductData, currency } = useAppContext();
  const [searchInput, setSearchInput] = useState("");
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("Products");
  const [visible, setVisible] = useState(60);
  const sentinelRef = useRef(null);

  const catalog = useMemo(() =>
    (Array.isArray(products) ? products : []).filter((product) => product?._id),
    [products]);

  useEffect(() => {
    // Refresh on homepage visits so newly uploaded seller products appear.
    fetchProductData();
  }, []);

  const categoryOptions = useMemo(() => {
    const actual = [...new Set(catalog.map(product => String(product.category || "").trim()).filter(Boolean))];
    const standard = DEFAULT_CATEGORIES.filter(([id]) => actual.some(name => name.toUpperCase() === id));
    const custom = actual
      .filter(name => !standard.some(([id]) => id === name.toUpperCase()))
      .map(name => [name, name]);
    return [...standard, ...custom];
  }, [catalog]);

  const newest = useMemo(() => [...catalog].sort(
    (a, b) => Number(b.date || 0) - Number(a.date || 0)
  ), [catalog]);

  const filtered = useMemo(() => {
    const query = term.toLowerCase().trim();
    return newest.filter(product => {
      const fitsCategory = !category || String(product.category || "").toUpperCase() === category.toUpperCase();
      const fitsTerm = !query || [product.name, product.category, product.description].some(
        value => String(value || "").toLowerCase().includes(query)
      );
      return fitsCategory && fitsTerm;
    });
  }, [newest, category, term]);

  useEffect(() => setVisible(60), [term, category]);

  useEffect(() => {
    if (visible >= filtered.length || !sentinelRef.current) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) setVisible(count => Math.min(count + 60, filtered.length));
    }, { rootMargin: "500px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visible, filtered.length]);

  const findCategory = id => newest.find(product =>
    String(product.category || "").toUpperCase() === id && product.image?.[0]);

  const featured = [
    { title: "Browsing history", sub: "Explore recent Morven styles", product: newest.find(p => p.image?.[0]), category: "" },
    { title: "Keep looking for", sub: "Suits and formalwear", product: findCategory("SUIT") || newest[1], category: "SUIT" },
    { title: "Frequently searched", sub: "Shirts & accessories", product: findCategory("SHIRT") || findCategory("ACCESSORY") || newest[2], category: "SHIRT" },
    { title: "Fast-selling styles", sub: "Explore the Morven collection", product: findCategory("JACKET") || newest[3] || newest[0], category: "", accent: true },
  ];

  const scrollToCatalog = () => document.getElementById("morven-marketplace-products")?.scrollIntoView(
    { behavior: "smooth", block: "start" }
  );

  const selectCategory = next => {
    setCategory(next);
    setTerm("");
    setSearchInput("");
    setVisible(60);
    scrollToCatalog();
  };

  const submitSearch = event => {
    event.preventDefault();
    setTerm(searchInput);
    setCategory("");
    scrollToCatalog();
  };

  const switchMode = next => {
    setMode(next);
    if (next === "Products") {
      setCategory(""); setTerm(""); setSearchInput("");
    } else if (next === "Collections") {
      document.getElementById("morven-marketplace-discover")?.scrollIntoView({ behavior: "smooth" });
    } else if (next === "New Arrivals") {
      setCategory(""); setTerm(""); setSearchInput(""); scrollToCatalog();
    } else if (next === "Discover") {
      document.getElementById("morven-marketplace-discover")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f9f9f9] text-[#272727]">
        {/* app/layout.js supplies the original Morven Navbar and FashionNavbar. */}
        <div className="mx-auto max-w-[1460px] px-[10px] pb-16 pt-2 sm:px-4 lg:px-6">
          {/* Compact marketplace tabs on desktop; mobile keeps the existing shop navigation. */}
          <div className="hidden items-center justify-center gap-4 whitespace-nowrap text-[12px] font-semibold sm:flex sm:gap-7">
            {["Discover", "Products", "Collections", "New Arrivals"].map((item, index) => (
              <div key={item} className="flex items-center gap-4 sm:gap-7">
                {index > 0 && <span className="text-[#d7d7d7]">|</span>}
                <button
                  type="button"
                  onClick={() => switchMode(item)}
                  aria-current={mode === item ? "page" : undefined}
                  className={"border-b-2 px-1 pb-2 pt-1 transition-colors " + (mode === item
                    ? "border-[#ff6a00] text-[#f4660d]"
                    : "border-transparent text-[#292929] hover:text-[#f4660d]")}
                >
                  {item}
                </button>
              </div>
            ))}
          </div>
          <form
            onSubmit={submitSearch}
            role="search"
            className="mx-auto mt-1.5 max-w-[810px] rounded-[10px] border border-[#f58938] bg-white px-2.5 py-2 shadow-[0_5px_18px_rgba(151,80,24,0.08)] transition-shadow focus-within:shadow-[0_5px_22px_rgba(241,115,23,0.16)] sm:mt-2 sm:px-3 sm:py-2.5"
          >
            <div className="flex h-[36px] items-center gap-2 sm:h-[38px]">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff3ea] text-[#ea6b15]">
                <SearchIcon/>
              </span>
              <input
                type="search"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                aria-label="Search Morven products"
                placeholder="What are you looking for?"
                className="h-full min-w-0 flex-1 border-0 bg-transparent text-[11px] text-[#252525] outline-none placeholder:text-[#9c9c9c] sm:text-[12px]"
              />
              <button
                type="submit"
                className="h-[32px] shrink-0 rounded-full bg-[#ff6a00] px-4 text-[11px] font-semibold text-white shadow-[0_2px_5px_rgba(252,103,0,0.15)] transition-colors hover:bg-[#e95f00] sm:h-[34px] sm:px-7"
              >
                Search
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#f3f0ee] pt-1.5 text-[9px] text-[#777] sm:gap-x-3 sm:text-[10px]">
              <span className="font-medium text-[#999]">Popular:</span>
              {["SUIT", "SHIRT", "TROUSERS", "SHOE"].map(item => (
                <button
                  type="button"
                  key={item}
                  onClick={() => selectCategory(item)}
                  className="rounded-full bg-[#faf6f2] px-2 py-0.5 text-[#76675b] transition-colors hover:bg-[#fff0e3] hover:text-[#e96508]"
                >
                  {item.toLowerCase()}
                </button>
              ))}
            </div>
          </form>

          <div className="mt-4 grid grid-cols-1 divide-y divide-[#f1f1f1] overflow-hidden rounded-[9px] border border-[#ececec] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.025)] sm:mt-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              ["🇬🇭", "Morven Ghana", "Original Morven menswear collections"],
              ["◈", "Secure checkout", "Payments through Paystack"],
              ["✧", "Menswear collections", "Browse suits, shirts and accessories"],
            ].map(([symbol, label, sub]) => (
              <div key={label} className="flex min-w-0 items-center gap-2.5 px-3 py-[7px] sm:px-4 sm:py-[10px]">
                <span aria-hidden="true" className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#fff4e9] text-[16px] text-[#f17620]">
                  {symbol}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-[10px] font-semibold text-[#282828] sm:text-[11px]">{label}</h2>
                  <p className="mt-0.5 truncate text-[9px] text-[#898989] sm:text-[10px]">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Preserve the five-column desktop marketplace and two-column mobile cards. */}
          <section
            id="morven-marketplace-discover"
            aria-label="Morven departments"
            className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3"
          >
            <div className="col-span-2 h-[224px] overflow-hidden rounded-[10px] border border-[#ebebeb] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] sm:col-span-1 sm:h-[211px]">
              <button
                type="button"
                onClick={() => selectCategory("")}
                className="mb-1.5 flex w-full items-center justify-between border-b border-[#eee] pb-2 text-[12px] font-semibold hover:text-[#ee6506]"
              >
                <span>All Categories</span><ArrowRight/>
              </button>
              <div className="max-h-[174px] space-y-0.5 overflow-y-auto pr-1 sm:max-h-[159px]">
                {(categoryOptions.length ? categoryOptions : DEFAULT_CATEGORIES).map(([id, name]) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => selectCategory(id)}
                    className={"flex w-full items-center justify-between gap-1 rounded-[4px] px-1.5 py-1 text-left text-[10px] leading-4 transition-colors " +
                      (id === category ? "bg-[#fff0e5] font-semibold text-[#ee6506]" : "text-[#626262] hover:bg-[#faf4ef]")}
                  >
                    <span className="truncate">{name}</span><ArrowRight/>
                  </button>
                ))}
              </div>
            </div>
            {featured.map(tile => (
              <DiscoveryTile
                key={tile.title}
                title={tile.title}
                sub={tile.sub}
                product={tile.product}
                accent={tile.accent}
                onClick={() => selectCategory(tile.category)}
              />
            ))}
          </section>

          {/* Main content is the continuous six-column merchandise feed, not a boutique hero. */}
          <section id="morven-marketplace-products" className="scroll-mt-40 pt-[9px]" aria-label="All Morven products">
            {(category || term) && (
              <div className="mb-[7px] flex items-center justify-between rounded-[3px] border border-[#f0f0f0] bg-white px-2.5 py-1.5 text-[11px]">
                <p>
                  <span className="font-semibold">{term ? "Results: " + term : category}</span>
                  <span className="ml-2 text-[#888]">({filtered.length} products)</span>
                </p>
                <button type="button" onClick={() => { setCategory(""); setTerm(""); setSearchInput(""); }}
                  className="text-[#f2680b] hover:underline">Clear filters</button>
              </div>
            )}
            {filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-[6px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {filtered.slice(0, visible).map(product => (
                    <MarketplaceProduct key={product._id} product={product} currency={currency}/>
                  ))}
                </div>
                {visible < filtered.length && (
                  <div ref={sentinelRef} className="py-6 text-center text-[11px] text-[#999]">
                    Loading more products…
                  </div>
                )}
              </>
            ) : productsLoading ? (
              <div className="grid grid-cols-2 gap-[6px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 18 }, (_, i) => (
                  <div key={i} className="animate-pulse rounded-[4px] bg-white p-[5px]">
                    <div className="aspect-square bg-[#f0f0f0]"/>
                    <div className="mt-2 h-3 w-4/5 bg-[#eee]"/>
                    <div className="mt-2 h-3 w-1/2 bg-[#eee]"/>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[4px] bg-white px-6 py-14 text-center text-[12px] text-[#888]">
                {term || category ? "No products match this selection." : "New products will appear here once they are uploaded."}
              </div>
            )}
          </section>

          <div className="mt-8 flex flex-wrap gap-2 border-t border-[#e7e7e7] pt-4 text-[10px]">
            <span className="mr-1 py-1 text-[#777]">Related searches</span>
            {["SUIT", "SHIRT", "TROUSERS", "SHOE", "ACCESSORY"].map(id => (
              <button type="button" key={id} onClick={() => selectCategory(id)}
                className="rounded-full border border-[#e6e6e6] bg-white px-3 py-1 text-[#777] hover:border-[#ff6a00]">
                {id.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}
