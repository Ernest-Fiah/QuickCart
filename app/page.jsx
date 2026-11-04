"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const collections = [
  { label: "Suits", category: "SUIT", caption: "Make your entrance", tint: "bg-[#f0eeeb]" },
  { label: "Shirts", category: "SHIRT", caption: "Your everyday signature", tint: "bg-[#edf1f3]" },
  { label: "Shoes", category: "SHOE", caption: "Finish the look", tint: "bg-[#f3eee7]" },
];
const categories = [
  ["SUIT", "Suits"], ["SHIRT", "Shirts"], ["T-SHIRT", "T-shirts & polos"],
  ["TROUSERS", "Trousers"], ["JACKET", "Jackets"], ["KNITWEAR", "Knitwear"],
  ["SHOE", "Shoes"], ["ACCESSORY", "Accessories"], ["TUXEDO", "Tuxedos"],
  ["OUTERWEAR", "Outerwear"], ["SWEATSHIRT", "Sweatshirts"], ["COMBINATIONS", "Combinations"],
];
const categoryOf = product => String(product.category || "").trim().toUpperCase();
const priceOf = product => Number(product.offerPrice ?? product.price);
const money = value => Number.isFinite(Number(value))
  ? new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 2 }).format(Number(value))
  : "Contact for price";

function Icon({ kind, className = "h-6 w-6" }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "search" ? <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>
      : kind === "shield" ? <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>
      : kind === "bag" ? <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>
      : kind === "arrow" ? <path d="M4 12h16m-6-6 6 6-6 6" />
      : <><path d="m8 3-5 4 3 5 2-1v10h8V11l2 1 3-5-5-4-4 3-4-3Z" /></>}
  </svg>;
}

function ProductPhoto({ product, sizes, className = "" }) {
  const [failed, setFailed] = useState(false);
  const src = product?.image?.[0];
  return <div className={`relative overflow-hidden ${className}`}>
    {src && !failed
      ? <Image src={src} alt={product.name || "Morven menswear"} fill sizes={sizes} onError={() => setFailed(true)} className="object-cover transition-transform duration-500 group-hover:scale-105" />
      : <div className="flex h-full min-h-32 items-center justify-center text-stone-300"><Icon kind="shirt" className="h-16 w-16" /></div>}
  </div>;
}

export default function Home() {
  const { products, productsLoading, fetchProductData } = useAppContext();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [visible, setVisible] = useState(36);
  const catalogue = useMemo(() => Array.isArray(products) ? products.filter(p => p && p._id) : [], [products]);
  const filtered = useMemo(() => {
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    const result = catalogue.filter(product => {
      const text = `${product.name || ""} ${product.description || ""} ${product.category || ""}`.toLowerCase();
      return (!category || categoryOf(product) === category) && terms.every(term => text.includes(term));
    });
    return result.sort((a, b) => sort === "low" ? priceOf(a) - priceOf(b)
      : sort === "high" ? priceOf(b) - priceOf(a) : (Number(b.date) || 0) - (Number(a.date) || 0));
  }, [catalogue, search, category, sort]);
  const selectCategory = value => {
    setCategory(value); setVisible(36);
    document.getElementById("morven-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const reset = () => { setQuery(""); setSearch(""); setCategory(""); setVisible(36); };
  const categoryLabel = categories.find(([value]) => value === category)?.[1] || "The Morven collection";

  return <>
    <div className="bg-[#f5f5f5] pt-[3.25rem] text-[#222] lg:pt-0">
      <section aria-label="Find your style" className="border-b border-stone-100 bg-gradient-to-r from-[#fff4ec] via-[#fffaf7] to-[#f2f7fa] px-4 py-8 md:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-500">Morven Ghana · Menswear</p>
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">Your style. Every occasion.</h1>
          <div className="mb-5 mt-4 flex justify-center gap-6 text-sm md:gap-10">
            <span className="border-b-2 border-orange-600 pb-2 font-medium text-orange-600">Products</span>
            <a href="#morven-collections" className="pb-2 hover:text-orange-600">Collections</a>
            <Link href="/size-guide" className="pb-2 hover:text-orange-600">Find your fit</Link>
          </div>
          <form role="search" onSubmit={event => { event.preventDefault(); setSearch(query.trim()); setVisible(36); document.getElementById("morven-products")?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-xl border border-orange-400 bg-white p-2 shadow-[0_4px_20px_rgba(190,100,40,0.08)]">
            <div className="flex items-center gap-2">
              <span className="ml-2 hidden text-stone-400 sm:block"><Icon kind="search" className="h-5 w-5" /></span>
              <label htmlFor="morven-search" className="sr-only">Search Morven products</label>
              <input id="morven-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search suits, shirts, shoes and more" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200" />
              <button type="submit" className="flex shrink-0 items-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-medium text-white hover:bg-orange-700 sm:px-6"><Icon kind="search" className="h-4 w-4" /><span>Search</span></button>
            </div>
          </form>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-stone-500">
            <span>Explore:</span>{collections.map(item => <button key={item.category} onClick={() => selectCategory(item.category)} className="underline-offset-4 hover:text-black hover:underline">{item.label}</button>)}
            <button onClick={() => selectCategory("ACCESSORY")} className="hover:text-black hover:underline">Accessories</button>
          </div>
        </div>
      </section>

      <div className="bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-4 px-4 py-5 sm:grid-cols-3 sm:gap-6 lg:px-8">
          {[
            ["shirt", "A complete wardrobe", "Suits, shirts, shoes & accessories", "/all-products"],
            ["shield", "Pay with Paystack", "Choose your fit, then check out", "/cart"],
            ["bag", "Help finding your fit", "Size guidance from the Morven team", "/size-guide"],
          ].map(([icon, title, subtitle, href]) => <Link key={title} href={href} className="flex items-center gap-3 sm:border-r sm:border-stone-100 sm:last:border-0">
            <span className="text-orange-600"><Icon kind={icon} /></span><span><span className="block text-sm font-medium">{title}</span><span className="mt-0.5 block text-xs text-stone-500">{subtitle}</span></span>
          </Link>)}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-3 pb-12 pt-5 md:px-5 lg:px-8">
        <section id="morven-collections" aria-label="Shop collections" className="mb-7 grid scroll-mt-40 gap-3 lg:grid-cols-[210px_1fr]">
          <aside className="rounded-lg border border-stone-200/70 bg-white p-4">
            <h2 className="mb-3 text-sm font-medium">Shop by category</h2>
            <div className="flex gap-1 overflow-x-auto lg:max-h-[220px] lg:flex-col lg:overflow-y-auto">
              {[["", "All collections"], ...categories].map(([value, label]) => <button key={value} type="button" aria-pressed={category === value} onClick={() => selectCategory(value)} className={`flex shrink-0 items-center justify-between gap-3 rounded px-2 py-2 text-left text-xs transition-colors ${category === value ? "bg-orange-50 font-medium text-orange-700" : "hover:bg-stone-50"}`}><span>{label}</span><span aria-hidden="true">›</span></button>)}
            </div>
          </aside>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {collections.map(item => {
              const product = catalogue.find(p => categoryOf(p) === item.category && p.image?.[0]);
              return <button key={item.category} onClick={() => selectCategory(item.category)} className={`group overflow-hidden rounded-lg p-3 text-left ${item.tint}`}>
                <h2 className="text-sm font-medium">{item.label}</h2><p className="mb-3 mt-1 text-[11px] text-stone-500">{item.caption}</p>
                <ProductPhoto key={product?._id || item.category} product={product} sizes="(max-width: 767px) 45vw, 20vw" className="h-36 rounded-md md:h-40" />
                <span className="mt-3 flex items-center justify-between text-xs">Explore collection <Icon kind="arrow" className="h-4 w-4" /></span>
              </button>;
            })}
            <Link href="/all-products" className="group flex flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br from-[#ffe4cf] via-[#ffc394] to-[#f79950] p-4">
              <div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-orange-900">The complete look</p><h2 className="mt-3 text-2xl font-medium leading-tight text-[#542b18]">Made for<br />your moment.</h2><p className="mt-3 text-xs leading-relaxed text-[#74452c]">From the working week<br />to your next celebration.</p></div>
              <span className="mt-5 flex items-center justify-between rounded-full bg-white px-4 py-2 text-xs font-medium text-[#542b18]">Shop Morven <Icon kind="arrow" className="h-4 w-4" /></span>
            </Link>
          </div>
        </section>

        <section id="morven-products" aria-labelledby="product-heading" className="scroll-mt-36 lg:scroll-mt-40">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div><h2 id="product-heading" className="text-xl font-medium">{search ? `Results for “${search}”` : categoryLabel}</h2><p aria-live="polite" className="mt-1 text-xs text-stone-500">{productsLoading ? "Loading the collection…" : `${filtered.length} products to explore`}</p></div>
            <label className="flex items-center gap-2 text-xs text-stone-600">Sort by <select value={sort} onChange={e => { setSort(e.target.value); setVisible(36); }} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-black"><option value="latest">Newest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
          </div>
          {(search || category) && <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">{category && <span className="rounded-full bg-white px-3 py-2">{categoryLabel}</span>}{search && <span className="rounded-full bg-white px-3 py-2">{search}</span>}<button onClick={reset} className="px-2 py-2 underline">Clear filters</button></div>}
          <div aria-busy={productsLoading} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {productsLoading ? Array.from({ length: 12 }, (_, i) => <div key={i} aria-hidden="true" className="animate-pulse rounded-lg bg-white p-2"><div className="aspect-[4/5] rounded bg-stone-200" /><div className="mt-3 h-3 w-4/5 rounded bg-stone-200" /><div className="mb-3 mt-2 h-4 w-1/2 rounded bg-stone-100" /></div>)
              : filtered.slice(0, visible).map(product => <Link key={product._id} href={`/product/${product._id}`} className="group min-w-0 overflow-hidden rounded-lg border border-transparent bg-white p-2 transition duration-200 hover:-translate-y-1 hover:border-stone-200 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600">
                <ProductPhoto product={product} sizes="(max-width: 639px) 48vw, (max-width: 1023px) 32vw, (max-width: 1279px) 19vw, 220px" className="aspect-[4/5] rounded-md bg-[#f0efed]" />
                <div className="px-1 pb-2 pt-3"><p className="truncate text-[9px] font-medium uppercase tracking-widest text-stone-500">{product.category}</p><h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm leading-5">{product.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-black">{money(priceOf(product))}</p>
                  {Number(product.price) > priceOf(product) && <p className="mt-0.5 text-[11px] text-stone-400 line-through">{money(product.price)}</p>}
                  <p className="mt-2 truncate text-[10px] text-stone-500">{product.sizes?.length ? `Sizes: ${product.sizes.join(" · ")}` : categoryOf(product) === "ACCESSORY" ? "Explore the details" : "Enquire about sizes"}</p>
                  <span className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] font-medium">View product <Icon kind="arrow" className="h-3.5 w-3.5" /></span>
                </div>
              </Link>)}
          </div>
          {!productsLoading && !filtered.length && <div className="rounded-xl border border-stone-200 bg-white px-6 py-14 text-center"><h3 className="text-lg font-medium">{catalogue.length ? "No products match your selection" : "The collection is unavailable right now"}</h3><p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{catalogue.length ? "Try a different search or browse all collections." : "Please try loading the products again, or contact our team for help."}</p><button onClick={catalogue.length ? reset : fetchProductData} className="mt-5 rounded-full bg-black px-6 py-3 text-sm text-white">{catalogue.length ? "Show all products" : "Reload products"}</button></div>}
          {!productsLoading && filtered.length > visible && <div className="mt-8 text-center"><button onClick={() => setVisible(n => n + 36)} className="rounded-full border border-stone-300 bg-white px-10 py-3 text-sm font-medium hover:border-black">Show more products</button><p className="mt-3 text-xs text-stone-500">Showing {Math.min(visible, filtered.length)} of {filtered.length}</p></div>}
        </section>
        <div className="mt-10 flex flex-col justify-between gap-4 rounded-xl bg-[#eae7e1] px-6 py-6 sm:flex-row sm:items-center"><div><h2 className="text-lg font-medium">A little help choosing?</h2><p className="mt-1 text-sm text-stone-600">Find the right size and finish your look with Morven Ghana.</p></div><Link href="/contact" className="flex items-center gap-5 self-start rounded-full bg-white px-5 py-3 text-sm sm:self-auto">Talk to our team <Icon kind="arrow" className="h-4 w-4" /></Link></div>
      </div>
    </div>
    <Footer />
  </>;
}
