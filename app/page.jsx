"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

// The two existing Morven navbars are rendered in app/layout.js.
// This page recreates the compact marketplace layout UNDER those navbars.

const DISPLAY_CATEGORIES = [
  "SUIT", "SHIRT", "TROUSERS", "JACKET", "T-SHIRT",
  "SHOE", "ACCESSORY", "KNITWEAR", "TUXEDO", "OUTERWEAR",
];

const formatPrice = (price, symbol) => {
  const value = Number(price);
  if (!Number.isFinite(value)) return "Enquire for price";
  return symbol + value.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const SearchIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" className="h-4 w-4 shrink-0">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </svg>
);

const Chevron = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" className="h-3 w-3 shrink-0">
    <path d="m9 5 7 7-7 7" />
  </svg>
);

const CategorySymbol = ({ value }) => {
  const icons = {
    SUIT: "♧", SHIRT: "▤", TROUSERS: "▥", JACKET: "◇",
    "T-SHIRT": "▧", SHOE: "◉", ACCESSORY: "✧",
    KNITWEAR: "▦", TUXEDO: "◆", OUTERWEAR: "◈",
  };
  return <span aria-hidden="true" className="w-4 shrink-0 text-center text-[13px] text-[#7d7771]">
    {icons[value] || "·"}
  </span>;
};

const CatalogCard = ({ product, currency }) => (
  <Link href={"/product/" + product._id}
    className="group block min-w-0 overflow-hidden rounded-[4px] border border-[#ececec] bg-white p-[5px] transition-colors hover:border-[#ffad7d] hover:shadow-[0_3px_12px_rgba(0,0,0,0.07)]">
    <div className="relative aspect-square w-full overflow-hidden rounded-[3px] bg-[#f4f4f4]">
      {product.image?.[0] ? (
        <Image
          unoptimized
          src={product.image[0]}
          width={330}
          height={330}
          alt={product.name || "Morven clothing"}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.045]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-[#aaa]">
          Image unavailable
        </div>
      )}
      <span className="absolute bottom-1.5 left-1.5 rounded-full border border-white/80 bg-white/90 px-[5px] py-[2px] text-[8px] font-semibold tracking-[0.04em] text-[#50483f]">
        Morven
      </span>
    </div>
    <div className="px-[2px] pb-[4px] pt-[5px]">
      <p className="line-clamp-2 min-h-[29px] text-[10px] font-normal leading-[14px] text-[#333333] sm:text-[11px]">
        {product.name}
      </p>
      <p className="mt-1 truncate text-[12px] font-bold leading-[16px] tracking-[-0.015em] text-[#1c1c1c] sm:text-[13px]">
        {formatPrice(product.offerPrice, currency)}
      </p>
      {Number(product.price) > Number(product.offerPrice) && (
        <p className="mt-0.5 truncate text-[9px] leading-3 text-[#999] line-through">
          {formatPrice(product.price, currency)}
        </p>
      )}
      <p className="mt-[3px] truncate text-[9px] leading-3 text-[#777]">
        {product.category || "Morven Collection"}
      </p>
    </div>
  </Link>
);

const QuickTile = ({ title, subtitle, product, category, onSelect, orange = false }) => (
  <button
    type="button"
    onClick={() => onSelect(category)}
    className={
      "group relative flex h-[174px] min-w-0 flex-col overflow-hidden rounded-[5px] border p-[9px] text-left transition-colors " +
      (orange
        ? "border-[#ffd2b8] bg-gradient-to-br from-[#ffeadc] via-[#ffaf71] to-[#ff6a00]"
        : "border-[#ececec] bg-[#fafafa] hover:border-[#ffad7d]")
    }
  >
    <span className={"relative z-10 line-clamp-1 text-[11px] font-bold leading-4 " +
      (orange ? "text-[#ee5700]" : "text-[#333]")}>
      {title}
    </span>
    <span className={"relative z-10 mt-[2px] line-clamp-1 text-[9px] " +
      (orange ? "text-[#a85124]" : "text-[#999]")}>
      {subtitle}
    </span>
    {product?.image?.[0] ? (
      <Image
        unoptimized
        src={product.image[0]}
        alt={product.name || title}
        width={220}
        height={220}
        loading="lazy"
        className="mx-auto mt-2 h-[95px] w-[100%] max-w-[175px] object-contain transition-transform group-hover:scale-[1.045]"
      />
    ) : (
      <span className="mt-6 text-[11px] text-[#b5afa9]">Browse Morven</span>
    )}
    {orange && (
      <span className="absolute bottom-2 right-2 rounded-full bg-[#f56907] px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm">
        View more
      </span>
    )}
  </button>
);

export default function Home() {
  const { products, productsLoading, currency } = useAppContext();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [view, setView] = useState("products");
  const [visible, setVisible] = useState(120);

  const catalog = useMemo(() => (
    Array.isArray(products) ? products.filter((item) => item?._id) : []
  ), [products]);

  const categories = useMemo(() => {
    const available = [...new Set(catalog.map((item) => String(item.category || "").trim()))]
      .filter(Boolean);
    return [
      ...DISPLAY_CATEGORIES.filter((item) => available.some(
        (name) => name.toLowerCase() === item.toLowerCase()
      )),
      ...available.filter((item) => !DISPLAY_CATEGORIES.includes(item.toUpperCase())),
    ];
  }, [catalog]);

  const findCategoryItem = (name) => (
    catalog.find((item) =>
      String(item.category || "").toUpperCase() === name &&
      item.image?.[0]
    ) || catalog.find((item) => item.image?.[0])
  );

  const tiles = [
    { title: "Browse Morven", subtitle: "Explore new additions", category: "", product: catalog[0] },
    { title: "Keep looking for", subtitle: "Premium suits & sets", category: "SUIT", product: findCategoryItem("SUIT") },
    { title: "Explore styles", subtitle: "Shirts & accessories", category: "SHIRT", product: findCategoryItem("SHIRT") },
    { title: "Featured products", subtitle: "Discover our selection", category: "", product: findCategoryItem("JACKET"), orange: true },
  ];

  const filtered = useMemo(() => {
    const phrase = search.trim().toLowerCase();
    let items = catalog.filter((item) => {
      const matchesCategory = !category ||
        String(item.category || "").toLowerCase() === category.toLowerCase();
      const matchesSearch = !phrase ||
        [item.name, item.description, item.category].some((field) =>
          String(field || "").toLowerCase().includes(phrase)
        );
      return matchesCategory && matchesSearch;
    });
    if (view === "new") {
      items = [...items].sort((a, b) => Number(b.date || 0) - Number(a.date || 0));
    }
    return items;
  }, [catalog, category, search, view]);

  const setFilter = (nextCategory) => {
    setCategory(nextCategory);
    setSearch("");
    setInput("");
    setVisible(120);
    document.getElementById("morven-product-grid")?.scrollIntoView({
      behavior: "smooth", block: "start",
    });
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(input);
    setCategory("");
    setVisible(120);
    document.getElementById("morven-product-grid")?.scrollIntoView({
      behavior: "smooth", block: "start",
    });
  };

  const selectTab = (nextView) => {
    setView(nextView);
    setCategory("");
    setSearch("");
    setInput("");
    setVisible(120);
    if (nextView === "collections") {
      document.getElementById("morven-category-row")?.scrollIntoView({
        behavior: "smooth", block: "center",
      });
    }
    if (nextView === "new") {
      document.getElementById("morven-product-grid")?.scrollIntoView({
        behavior: "smooth", block: "start",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f7f7f7] text-[#252525]">
        {/* The site-wide Navbar and FashionNavbar are intentionally NOT repeated here. */}
        <div className="mx-auto max-w-[1510px] px-[10px] pb-16 pt-[5px] sm:px-4 lg:px-6">
          {/* Compact centered marketplace tabs, like the reference screenshot. */}
          <div className="flex h-[37px] items-center justify-center gap-4 text-[12px] font-bold sm:gap-7 sm:text-[14px]">
            <button type="button" onClick={() => selectTab("discover")}
              className={view === "discover" ? "text-[#f66a00]" : "text-[#333] hover:text-[#f66a00]"}>
              Discover
            </button>
            <span className="text-[#e5e5e5]">|</span>
            <button type="button" onClick={() => selectTab("products")}
              className={view === "products" ? "text-[#ff6a00]" : "text-[#333] hover:text-[#ff6a00]"}>
              Products
            </button>
            <span className="text-[#e5e5e5]">|</span>
            <button type="button" onClick={() => selectTab("collections")}
              className={view === "collections" ? "text-[#ff6a00]" : "text-[#333] hover:text-[#ff6a00]"}>
              Collections
            </button>
            <span className="text-[#e5e5e5]">|</span>
            <button type="button" onClick={() => selectTab("new")}
              className={view === "new" ? "text-[#ff6a00]" : "text-[#333] hover:text-[#ff6a00]"}>
              New Arrivals
            </button>
          </div>

          {/* The small orange-outlined search card is a key part of the reference. */}
          <form onSubmit={submitSearch} role="search"
            className="mx-auto mt-2 w-full max-w-[830px] rounded-[7px] border-2 border-[#ff812a] bg-white p-[7px] shadow-[0_2px_9px_rgba(255,106,0,0.10)]">
            <div className="flex h-[35px] items-center gap-[8px]">
              <span className="ml-[5px] text-[#858585]"><SearchIcon /></span>
              <input
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="What are you looking for?"
                aria-label="Search Morven products"
                className="h-full w-full min-w-0 flex-1 border-none bg-transparent text-[12px] text-[#333] outline-none placeholder:text-[#999]"
              />
              <button type="submit"
                className="h-[30px] shrink-0 rounded-full bg-[#ff6a00] px-[21px] text-[11px] font-bold text-white hover:bg-[#e65e00]">
                Search
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#f3f3f3] pt-[6px] text-[9px] text-[#777]">
              <span className="font-semibold text-[#999]">Popular searches</span>
              {["SUIT", "SHIRT", "TROUSERS", "SHOE"].map((name) => (
                <button type="button" key={name}
                  onClick={() => setFilter(name)}
                  className="text-[#555] hover:text-[#ff6a00]">
                  {name.toLowerCase()}
                </button>
              ))}
            </div>
          </form>

          {/* Three narrow feature strips; do not invent supplier ratings or sales statistics. */}
          <div className="mt-9 grid grid-cols-1 divide-y border-y border-[#eeeeee] bg-white py-[5px] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              ["🇬🇭", "Morven Ghana", "Menswear collections in Ghana"],
              ["✦", "Paystack checkout", "Pay with the existing secure payment flow"],
              ["▣", "Suits, shirts and more", "Explore products from the Morven catalog"],
            ].map(([symbol, title, description]) => (
              <div key={title} className="flex min-w-0 items-center gap-3 px-3 py-[6px] sm:px-5">
                <span className="text-[19px] leading-none text-[#ff6a00]">{symbol}</span>
                <div className="min-w-0">
                  <h2 className="truncate text-[11px] font-semibold text-[#333]">{title}</h2>
                  <p className="mt-[2px] truncate text-[9px] text-[#8b8b8b]">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Screenshot-style row: 1 compact categories panel + 4 product tiles. */}
          <section id="morven-category-row"
            aria-label="Browse product categories"
            className="mt-[13px] grid grid-cols-2 gap-[8px] sm:grid-cols-5">
            <div className="col-span-2 h-[174px] overflow-hidden rounded-[5px] border border-[#ececec] bg-white p-[8px] sm:col-span-1">
              <button type="button" onClick={() => setFilter("")}
                className="mb-[5px] flex w-full items-center justify-between border-b border-[#eeeeee] pb-[7px] text-left text-[11px] font-semibold text-[#333] hover:text-[#ff6a00]">
                <span>All Categories</span><Chevron />
              </button>
              <div className="max-h-[130px] space-y-[1px] overflow-y-auto">
                {(categories.length ? categories : DISPLAY_CATEGORIES).slice(0, 8).map((name) => (
                  <button type="button" key={name} onClick={() => setFilter(name)}
                    className={"flex w-full items-center gap-[5px] rounded-[3px] px-[3px] py-[3px] text-left text-[10px] leading-[15px] hover:bg-[#fff3e9] " +
                      (category === name ? "bg-[#fff1e8] text-[#ff6a00]" : "text-[#5e5e5e]")}>
                    <CategorySymbol value={name} />
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    <Chevron />
                  </button>
                ))}
              </div>
            </div>
            {tiles.map((tile) => (
              <QuickTile key={tile.title} {...tile} onSelect={setFilter} />
            ))}
          </section>

          {/* Dense, six-column feed starts directly under the category cards. */}
          <section id="morven-product-grid" aria-label="Morven products"
            className="scroll-mt-40 pt-[9px]">
            {(category || search || view === "new") && (
              <div className="mb-[8px] flex flex-wrap items-center justify-between gap-2 rounded-[4px] bg-white px-3 py-2 text-[11px]">
                <p className="font-semibold">
                  {search ? "Search results for “" + search + "”"
                    : category || (view === "new" ? "New Arrivals" : "All Products")}
                  <span className="ml-2 font-normal text-[#777]">({filtered.length} products)</span>
                </p>
                <button type="button"
                  onClick={() => { setSearch(""); setInput(""); setCategory(""); setView("products"); }}
                  className="text-[#ff6a00] hover:underline">
                  Clear filters
                </button>
              </div>
            )}

            {filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-[7px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {filtered.slice(0, visible).map((product) => (
                    <CatalogCard key={product._id} product={product} currency={currency} />
                  ))}
                </div>
                {visible < filtered.length && (
                  <div className="mt-5 text-center">
                    <button type="button" onClick={() => setVisible((n) => n + 120)}
                      className="rounded-full border border-[#ddd] bg-white px-9 py-3 text-[12px] font-semibold hover:border-[#ff6a00] hover:text-[#ff6a00]">
                      Show more products
                    </button>
                  </div>
                )}
              </>
            ) : productsLoading ? (
              <div className="grid grid-cols-2 gap-[7px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-[4px] bg-[#ededed] p-[5px]">
                    <div className="aspect-square bg-[#e2e2e2]" />
                    <div className="my-2 h-3 rounded bg-[#e2e2e2]" />
                    <div className="h-3 w-2/3 rounded bg-[#e2e2e2]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[5px] bg-white px-6 py-16 text-center text-[13px] text-[#777]">
                No Morven products match your search or category.
                <button type="button" onClick={() => { setSearch(""); setCategory(""); setInput(""); }}
                  className="ml-2 font-semibold text-[#ff6a00] hover:underline">
                  View all products
                </button>
              </div>
            )}
          </section>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[#ebebeb] pt-4 text-[10px] text-[#777]">
            <span className="font-semibold text-[#555]">Related searches:</span>
            {["Men's suits", "Formal shirts", "Business trousers", "Wedding suits", "Leather shoes", "Accessories"].map((term) => (
              <button type="button" key={term}
                onClick={() => { setSearch(term.split(" ").slice(-1)[0]); setInput(term.split(" ").slice(-1)[0]); setCategory(""); }}
                className="rounded-full border border-[#e5e5e5] bg-white px-3 py-[5px] hover:border-[#ff6a00]">
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
