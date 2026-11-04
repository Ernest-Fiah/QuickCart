"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

// Both existing Morven navbars come from app/layout.js, not from this page.
const formatMoney = (value, symbol) =>
  Number.isFinite(Number(value))
    ? symbol + Number(value).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "Enquire for price";

const popularCategories = [
  "SUIT", "SHIRT", "JACKET", "TROUSERS", "T-SHIRT", "KNITWEAR",
  "SWEATSHIRT", "OUTERWEAR", "SHOE", "ACCESSORY", "TUXEDO",
];

const CategoryIcon = ({ name }) => (
  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#fff4eb] text-[#ed681f]">
    {({ SUIT: "◆", SHIRT: "▣", JACKET: "◈", TROUSERS: "▥",
      SHOE: "◉", ACCESSORY: "✦", TUXEDO: "◇" })[name] || "▦"}
  </span>
);

const StoreProductCard = ({ product, currency }) => (
  <Link href={"/product/" + product._id}
    className="group min-w-0 overflow-hidden rounded-[5px] border border-[#eceae7] bg-white p-2 transition duration-200 hover:border-[#f8aa7f] hover:shadow-[0_7px_22px_rgba(0,0,0,0.08)]">
    <div className="relative aspect-[4/4.6] overflow-hidden rounded-[3px] bg-[#f3f2f0]">
      {product.image?.[0] ? (
        <Image unoptimized src={product.image[0]} width={350} height={405}
          alt={product.name || "Morven menswear"} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.045]" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-[#9f9a93]">Image unavailable</div>
      )}
      <span className="absolute bottom-2 left-2 rounded-[3px] bg-white/95 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#4c443e]">
        Morven
      </span>
    </div>
    <p className="mt-2.5 line-clamp-2 min-h-[37px] text-[11px] font-medium leading-[1.5] text-[#24221f] sm:text-[12px]">
      {product.name}
    </p>
    <p className="mt-1.5 text-[14px] font-bold leading-none tracking-tight text-[#26221e] sm:text-[15px]">
      {formatMoney(product.offerPrice, currency)}
    </p>
    {Number(product.price) > Number(product.offerPrice) && (
      <p className="mt-1 text-[10px] text-[#88817a] line-through">{formatMoney(product.price, currency)}</p>
    )}
    <p className="mt-2 truncate text-[9px] uppercase tracking-[0.09em] text-[#9a9189]">{product.category}</p>
  </Link>
);

export default function Home() {
  const { products, productsLoading, currency } = useAppContext();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All products");
  const [limit, setLimit] = useState(48);

  const catalog = useMemo(() => Array.isArray(products) ? products.filter((item) => item?._id) : [], [products]);
  const categories = useMemo(() => {
    const fromCatalog = [...new Set(catalog.map((item) => String(item.category || "").trim()).filter(Boolean))];
    return [...new Set([...popularCategories, ...fromCatalog])];
  }, [catalog]);
  const filtered = useMemo(() => {
    const categoryFilter = category.toLowerCase();
    const word = query.trim().toLowerCase();
    return catalog.filter((item) =>
      (category === "All products" || String(item.category || "").toLowerCase() === categoryFilter) &&
      (!word || [item.name, item.category, item.description].some((text) => String(text || "").toLowerCase().includes(word)))
    );
  }, [catalog, query, category]);
  const categoryPreview = categories
    .map((name) => ({
      name, first: catalog.find((item) => String(item.category).toLowerCase() === name.toLowerCase())
    }))
    .filter((entry) => entry.first)
    .slice(0, 4);

  const submitSearch = (event) => {
    event.preventDefault();
    setQuery(search);
    setLimit(48);
    document.getElementById("morven-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const selectCategory = (value) => {
    setCategory(value);
    setLimit(48);
  };

  return (
    <>
      <div className="min-h-screen bg-[#fbfaf9] text-[#2a2724]">
        <div className="mx-auto max-w-[1510px] px-3 pb-20 pt-4 sm:px-5 lg:px-8">
          {/* Alibaba-inspired search area, below the TWO existing navbars. */}
          <section className="mx-auto max-w-[960px] pt-2 text-center">
            <div className="flex items-center justify-center gap-3 text-[12px] font-semibold sm:text-[13px]">
              <span className="border-b-2 border-[#ef6c22] pb-3 text-[#eb671e]">Products</span>
              <span className="pb-3 text-[#a8a19a]">/</span>
              <span className="pb-3">Morven Ghana Collection</span>
            </div>
            <form role="search" onSubmit={submitSearch}
              className="mx-auto mt-2 flex h-[49px] w-full items-center gap-1 rounded-full border-2 border-[#f26717] bg-white p-1 shadow-[0_4px_20px_rgba(242,103,23,0.07)]">
              <svg aria-hidden="true" className="ml-3 h-5 w-5 shrink-0 text-[#9b928a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
              </svg>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                placeholder="Find suits, shirts, trousers, shoes and accessories"
                aria-label="Search Morven products"
                className="h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-[12px] outline-none placeholder:text-[#9a938c] sm:text-[13px]" />
              <button type="submit"
                className="h-full shrink-0 rounded-full bg-[#f26717] px-6 text-[12px] font-semibold text-white hover:bg-[#d95812] sm:px-9">
                Search
              </button>
            </form>
            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-[#8c837a]">
              <span>Popular searches:</span>
              {["SUIT", "SHIRT", "TROUSERS", "SHOE"].map((name) => (
                <button key={name} type="button" onClick={() => { selectCategory(name); setQuery(""); setSearch(""); }}
                  className="hover:text-[#f26717]">{name.toLowerCase()}</button>
              ))}
            </div>
          </section>

          <div className="my-7 grid grid-cols-1 divide-y border-y border-[#e9e5e0] bg-white py-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              ["🇬🇭", "Morven Ghana", "Discover our menswear collection"],
              ["✓", "Paystack checkout", "Pay securely with the existing payment flow"],
              ["▣", "Shop by category", "Browse suits, shirts, footwear and more"],
            ].map(([symbol, title, description]) => (
              <div key={title} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span className="text-xl text-[#f26717]">{symbol}</span>
                <div>
                  <h2 className="text-[12px] font-semibold">{title}</h2>
                  <p className="mt-1 text-[10px] leading-5 text-[#918980]">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="grid gap-3 lg:grid-cols-[215px_minmax(0,1fr)]">
            <aside className="rounded-md border border-[#ece8e2] bg-white p-3 lg:row-span-2">
              <h2 className="mb-2 border-b border-[#eeeae5] px-2 pb-3 text-[13px] font-semibold">All categories</h2>
              <div className="flex max-h-[210px] flex-wrap gap-1 overflow-y-auto lg:max-h-none lg:flex-col lg:flex-nowrap">
                <button type="button" onClick={() => selectCategory("All products")}
                  className={"rounded-md px-3 py-2 text-left text-[11px] transition " +
                    (category === "All products" ? "bg-[#fff1e8] font-semibold text-[#ec6518]" : "hover:bg-[#f9f8f6]")}>
                  All products
                </button>
                {categories.map((name) => (
                  <button key={name} type="button" onClick={() => selectCategory(name)}
                    className={"flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition " +
                      (category === name ? "bg-[#fff1e8] font-semibold text-[#ec6518]" : "hover:bg-[#f9f8f6]")}>
                    <CategoryIcon name={name} />
                    <span className="flex-1">{name}</span>
                    <span className="hidden text-[#afa59c] lg:inline">›</span>
                  </button>
                ))}
              </div>
              <Link href="/all-products" className="mt-4 block border-t border-[#eeeae5] px-2 pt-3 text-[11px] font-medium text-[#f26717]">
                Explore full collection →
              </Link>
            </aside>

            <div className="min-w-0 space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {categoryPreview.map(({ name, first }) => (
                  <button key={name} type="button" onClick={() => selectCategory(name)}
                    className="group min-w-0 rounded-md border border-[#ebe7e1] bg-white p-2 text-left transition hover:border-[#efaa7e]">
                    <p className="mb-2 truncate text-[11px] font-semibold">{name}</p>
                    <div className="aspect-[4/3] overflow-hidden bg-[#f7f5f3]">
                      <Image unoptimized src={first.image?.[0]} width={260} height={190} alt={name}
                        className="h-full w-full object-cover transition group-hover:scale-105" />
                    </div>
                    <span className="mt-2 inline-block text-[10px] text-[#ee681e]">Shop category →</span>
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-md border border-[#ece8e2] bg-white p-4">
                  <p className="text-[13px] font-semibold">New in Morven</p>
                  <p className="mt-1 text-[10px] text-[#8e867e]">Browse recently added pieces</p>
                  <div className="mt-3 flex gap-2">
                    {catalog.slice(0, 3).filter((item) => item.image?.[0]).map((item) => (
                      <Link key={item._id} href={"/product/" + item._id} className="w-1/3 overflow-hidden bg-[#f6f5f3]">
                        <Image unoptimized src={item.image[0]} width={120} height={140} alt={item.name}
                          className="aspect-square h-auto w-full object-cover" />
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-[#ece8e2] bg-white p-4">
                  <p className="text-[13px] font-semibold">Build your wardrobe</p>
                  <p className="mt-1 text-[10px] text-[#8e867e]">Find outfits for work and occasions</p>
                  <div className="mt-3 flex gap-2">
                    {catalog.filter((item) => ["SUIT", "SHIRT", "SHOE", "TROUSERS"].includes(String(item.category).toUpperCase()))
                      .slice(0, 3).filter((item) => item.image?.[0]).map((item) => (
                        <Link key={item._id} href={"/product/" + item._id} className="w-1/3 overflow-hidden bg-[#f6f5f3]">
                          <Image unoptimized src={item.image[0]} width={120} height={140} alt={item.name}
                            className="aspect-square h-auto w-full object-cover" />
                        </Link>
                      ))}
                  </div>
                </div>
                <div className="rounded-md border border-[#f9c49e] bg-[#fff0e3] p-5 sm:col-span-2 xl:col-span-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#d9611b]">Morven Ghana</p>
                  <h3 className="mt-3 max-w-[220px] text-xl font-bold leading-tight">Discover your next signature look.</h3>
                  <p className="mt-2 text-[11px] leading-5 text-[#8a6d5c]">Tailored pieces and everyday essentials in one place.</p>
                  <Link href="/all-products" className="mt-5 inline-block rounded-full bg-[#f26717] px-5 py-2 text-[11px] font-semibold text-white">
                    Browse collection
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section id="morven-products" className="scroll-mt-40 pt-8" aria-labelledby="morven-products-title">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 id="morven-products-title" className="text-[18px] font-bold leading-snug sm:text-[22px]">
                  {query ? "Search results" : category === "All products" ? "Explore Morven Products" : category}
                </h1>
                <p className="mt-1 text-[11px] text-[#8d847b]">
                  {filtered.length} {filtered.length === 1 ? "product" : "products"} {query && "matching “" + query + "”"}
                </p>
              </div>
              {(query || category !== "All products") && (
                <button type="button" onClick={() => { setQuery(""); setSearch(""); selectCategory("All products"); }}
                  className="rounded-full border border-[#dfd8d1] px-4 py-2 text-[11px] hover:border-[#f26717]">
                  Clear filters
                </button>
              )}
            </div>
            {filtered.length ? (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {filtered.slice(0, limit).map((item) => (
                    <StoreProductCard key={item._id} product={item} currency={currency} />
                  ))}
                </div>
                {limit < filtered.length && (
                  <div className="mt-9 text-center">
                    <button type="button" onClick={() => setLimit((previous) => previous + 48)}
                      className="rounded-full border border-[#292521] bg-white px-9 py-3 text-[12px] font-semibold transition hover:bg-[#292521] hover:text-white">
                      Load more products
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-md border border-[#eae5df] bg-white px-6 py-14 text-center text-sm text-[#817870]">
                {productsLoading ? "Loading Morven products..." : "No products match your selection. Try another category or search."}
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
