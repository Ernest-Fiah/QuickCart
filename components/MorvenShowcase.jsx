"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Optional local product-photo preview.
 *
 * This component is intentionally invisible until the prepared user images are
 * installed at public/morven-showcase/{manifest.json,*.webp}. It never invents
 * prices or allows checkout for photographs that are not published as MongoDB
 * products in the Seller Dashboard.
 */
export default function MorvenShowcase({ category = "", query = "" }) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    let active = true;
    fetch("/morven-showcase/manifest.json", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active || !Array.isArray(data?.photos)) return;
        const safe = data.photos
          .filter((photo) =>
            typeof photo.path === "string" &&
            /^\/morven-showcase\/[\w.-]+\.webp$/.test(photo.path) &&
            typeof photo.title === "string" &&
            typeof photo.category === "string"
          )
          .slice(0, 100);
        setPhotos(safe);
      })
      .catch(() => {
        // No installed local preview images. Show the real product catalog only.
      });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => photos.filter((photo) => {
    const matchesCategory = !category || photo.category.toUpperCase() === category.toUpperCase();
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || [photo.title, photo.category].some(
      (part) => part.toLowerCase().includes(search)
    );
    return matchesCategory && matchesQuery;
  }), [photos, category, query]);

  if (!visible.length) return null;

  return (
    <section aria-labelledby="morven-showcase-title" className="mt-7">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="morven-showcase-title" className="text-[16px] font-semibold text-[#302c29]">
            New Morven Collection — Photo Preview
          </h2>
          <p className="mt-1 text-[11px] text-[#837b72]">
            {visible.length} prepared product photos · Enquire for availability and pricing
          </p>
        </div>
        <Link href="/contact" className="text-[11px] font-semibold text-[#ce5e18] hover:underline">
          Contact Morven
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-[6px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {visible.map((photo) => (
          <Link key={photo.path} href="/contact"
            className="group min-w-0 overflow-hidden rounded border border-[#eae7e1] bg-white p-[5px] transition hover:border-[#eea375]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#f6f5f3]">
              <Image unoptimized src={photo.path} width={450} height={563} alt={photo.title}
                loading="lazy" className="h-full w-full object-contain" />
              <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-1 text-[9px] text-[#554c45]">
                Collection preview
              </span>
            </div>
            <div className="px-0.5 pb-1 pt-2">
              <h3 className="line-clamp-2 min-h-8 text-[11px] leading-4 text-[#292929]">{photo.title}</h3>
              <p className="mt-1 text-[12px] font-semibold text-[#855647]">Enquire for price</p>
              <p className="mt-1 truncate text-[10px] text-[#9a9087]">{photo.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
