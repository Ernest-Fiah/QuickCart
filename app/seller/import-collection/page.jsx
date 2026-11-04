"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { MORVEN_NEW_COLLECTION } from "@/lib/morvenNewCollection.mjs";
import { getCategorySizeOptions } from "@/lib/sizing.mjs";

const initial = MORVEN_NEW_COLLECTION.map(item => ({
  ...item, price: "", offerPrice: "", availableSizes: [], suggested: false,
}));

function validItem(item) {
  const p = Number(item.price), o = Number(item.offerPrice);
  return !!item.name.trim() && item.name.trim().length >= 3 &&
    item.description.trim().length >= 20 &&
    String(item.price).trim() !== "" && String(item.offerPrice).trim() !== "" &&
    Number.isFinite(p) && Number.isFinite(o) && p > 0 && p <= 100000 && o > 0 && o <= p &&
    Math.abs(Math.round(p * 100) - p * 100) < 0.00001 &&
    Math.abs(Math.round(o * 100) - o * 100) < 0.00001 &&
    Array.isArray(item.availableSizes) && item.availableSizes.length > 0;
}

export default function ImportMorvenCollection() {
  const { getToken, fetchProductData } = useAppContext();
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [message, setMessage] = useState("");
  const [existingCount, setExistingCount] = useState(0);
  const [published, setPublished] = useState(false);
  const ready = useMemo(() => items.every(validItem), [items]);
  const incomplete = useMemo(() => items.filter(item => !validItem(item)).length, [items]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: "Bearer " + token };
        const [productsResponse, savedResponse] = await Promise.all([
          fetch("/api/product/seller-list", { headers, cache: "no-store" }),
          fetch("/api/product/import-collection", { headers, cache: "no-store" }),
        ]);
        const productData = await productsResponse.json();
        const savedData = await savedResponse.json();
        if (!active) return;
        const old = productData.success ? productData.products || [] : [];
        const prepared = savedData.success ? savedData.uploaded || [] : [];
        setExistingCount(prepared.length);
        setPublished(prepared.length === initial.length && prepared.every(item => item.active));
        const priceExamples = {};
        for (const item of old) {
          const key = String(item.category || "").toUpperCase();
          if (!priceExamples[key] && Number(item.price) > 0 && Number(item.offerPrice) > 0)
            priceExamples[key] = item;
        }
        setItems(initial.map(item => {
          const stored = prepared.find(row => row.sourceKey === item.sourceKey);
          const sample = priceExamples[item.category];
          return {
            ...item,
            name: stored?.name || item.name,
            price: stored ? String(stored.price) : sample ? String(sample.price) : "",
            offerPrice: stored ? String(stored.offerPrice) : sample ? String(sample.offerPrice) : "",
            availableSizes: Array.isArray(stored?.availableSizes) ? stored.availableSizes : [],
            suggested: !stored && !!sample,
          };
        }));
      } catch (error) {
        if (active) setMessage("Could not retrieve previous catalog pricing. Enter prices manually.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [getToken]);

  const update = (id, field, value) => setItems(previous => previous.map(item =>
    item.sourceKey === id ? { ...item, [field]: value } : item
  ));

  const copySizes = (category, selected) => setItems(previous => previous.map(item =>
    item.category === category ? { ...item, availableSizes: [...selected] } : item
  ));

  async function publish() {
    if (uploading) return;
    if (!ready) {
      setMessage("Every item needs a confirmed price and at least one actually stocked size.");
      return;
    }
    const confirmed = window.confirm(
      "Publish the 20 new Morven products and archive your OLD shop listings? The old products will be kept for past orders. You have confirmed all prices and sizes."
    );
    if (!confirmed) return;

    setUploading(true);
    setUploadedCount(0);
    setMessage("Uploading photos and prices to your store…");
    try {
      const token = await getToken();
      const headers = { Authorization: "Bearer " + token };

      for (let index = 0; index < items.length; index += 2) {
        const batch = items.slice(index, index + 2);
        await Promise.all(batch.map(async item => {
          const photo = await fetch(item.image, { cache: "no-store" });
          if (!photo.ok) throw new Error("Missing " + item.filename + ". Extract the ZIP into QuickCart first.");
          const file = new File([await photo.blob()], item.filename, { type: "image/webp" });
          const form = new FormData();
          form.append("sourceKey", item.sourceKey);
          form.append("name", item.name.trim());
          form.append("description", item.description.trim());
          form.append("price", item.price);
          form.append("offerPrice", item.offerPrice);
          form.append("availableSizes", JSON.stringify(item.availableSizes));
          form.append("image", file);

          const response = await fetch("/api/product/import-collection", {
            method: "POST", headers, body: form,
          });
          const data = await response.json();
          if (!data.success) throw new Error(item.name + ": " + (data.message || "Upload failed"));
          setUploadedCount(value => value + 1);
        }));
      }

      setMessage("All photos uploaded. Switching to the new Morven catalog…");
      const response = await fetch("/api/product/import-collection", {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "REPLACE OLD CATALOG" }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Could not publish the catalog");
      setPublished(true);
      setExistingCount(20);
      setMessage("Success: all 20 products are live with individual details, sizes, prices and checkout. Old products are archived.");
      await fetchProductData();
    } catch (error) {
      setMessage((error?.message || "Import failed") + " The old catalog remains visible until the full switch succeeds. Fix and retry; uploaded images are reused.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-w-0 flex-1 bg-[#faf9f7] px-3 py-6 md:px-7">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Publish 20 New Morven Products</h1>
            <p className="mt-2 max-w-[760px] text-[13px] leading-6 text-[#716c66]">
              Approve regular price, selling price, descriptions and sizes for every garment.
              The price suggestions come from your existing product categories, not confirmed prices for these new items.
              After approval, the system replaces the old active shop listings without deleting past order records.
            </p>
          </div>
          <Link href="/seller/product-list" className="rounded border border-gray-300 bg-white px-4 py-2 text-[12px]">Current products</Link>
        </div>

        <div className="mb-5 rounded border border-[#e7ddd4] bg-white p-4 text-[12px] leading-6">
          <strong>{existingCount} of 20 images already prepared</strong>
          <p className="text-[#7f756c]">
            All 20 WebP files must be inside your QuickCart public/morven-showcase folder.
            Imported products will use Cloudinary image URLs and appear in the normal shop with genuine database IDs.
          </p>
          <p className="text-[#ad5f37]">Select actual stocked sizes, not every possible size, and verify prices before publication.</p>
        </div>

        {loading ? <p>Loading prices and saved product details…</p> : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item, index) => {
                const sizes = getCategorySizeOptions(item.category);
                return (
                  <section key={item.sourceKey} className="overflow-hidden rounded-md border border-[#e7e1da] bg-white">
                    <div className="flex gap-3 border-b border-[#eee] p-3">
                      <div className="h-[150px] w-[110px] shrink-0 overflow-hidden rounded bg-[#f8f6f3]">
                        <Image unoptimized src={item.image} alt={item.name} width={110} height={150}
                          className="h-full w-full object-contain"/>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-[#a06e51]">PRODUCT {index + 1}/20</p>
                        <h2 className="mt-2 text-[13px] font-semibold">{item.name}</h2>
                        <p className="mt-2 text-[11px] text-[#80776e]">{item.category}</p>
                        <p className="mt-3 text-[10px] text-[#a06e51]">
                          {validItem(item) ? "Ready for publication" : "Confirm price and sizes"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 p-3">
                      <label className="block text-[11px] font-semibold">Product name
                        <input value={item.name} maxLength={140} onChange={event => update(item.sourceKey, "name", event.target.value)}
                          className="mt-1 w-full rounded border border-[#ddd7d0] px-2.5 py-2 text-[12px] font-normal"/>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-[11px] font-semibold">Regular (GH₵)
                          <input type="number" step="0.01" min="1" value={item.price}
                            onChange={event => update(item.sourceKey, "price", event.target.value)}
                            className="mt-1 w-full rounded border border-[#ddd7d0] px-2 py-2 text-[12px]"/>
                        </label>
                        <label className="text-[11px] font-semibold">Selling (GH₵)
                          <input type="number" step="0.01" min="1" value={item.offerPrice}
                            onChange={event => update(item.sourceKey, "offerPrice", event.target.value)}
                            className="mt-1 w-full rounded border border-[#ddd7d0] px-2 py-2 text-[12px]"/>
                        </label>
                      </div>
                      {item.suggested && <p className="text-[10px] text-[#a46d48]">
                        Suggested using an older {item.category.toLowerCase()} listing. Confirm the correct selling price.
                      </p>}
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold">Available sizes *</span>
                          <button type="button" className="text-[10px] text-[#a16a4e] underline"
                            onClick={() => copySizes(item.category, item.availableSizes)}>
                            Copy to all {item.category}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {sizes.map(size => (
                            <button key={size} type="button"
                              aria-pressed={item.availableSizes.includes(size)}
                              onClick={() => update(item.sourceKey, "availableSizes",
                                item.availableSizes.includes(size)
                                  ? item.availableSizes.filter(value => value !== size)
                                  : [...item.availableSizes, size])}
                              className={"min-w-9 rounded border px-2 py-1.5 text-[10px] " +
                                (item.availableSizes.includes(size) ? "border-[#312c2a] bg-[#312c2a] text-white" : "border-[#ddd] bg-white")}>
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="block text-[11px] font-semibold">Description
                        <textarea value={item.description} maxLength={2000} rows={3}
                          onChange={event => update(item.sourceKey, "description", event.target.value)}
                          className="mt-1 w-full rounded border border-[#ddd7d0] px-2 py-2 text-[11px] font-normal leading-5"/>
                      </label>
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="sticky bottom-0 z-20 mt-5 flex flex-wrap items-center justify-between gap-4 rounded border border-[#e1d6cc] bg-white/95 p-4 shadow-lg backdrop-blur">
              <div>
                <p className="text-[13px] font-semibold">
                  {ready ? "Prices and sizes provided for all 20 items" : String(incomplete) + " items still need prices or sizes"}
                </p>
                {uploading && <p className="mt-1 text-[11px]">Uploaded {uploadedCount} / 20 images</p>}
                {message && <p className="mt-1 max-w-[800px] text-[11px] text-[#866551]">{message}</p>}
              </div>
              <button type="button" disabled={!ready || uploading} onClick={publish}
                className="rounded bg-[#ee6a1c] px-5 py-3 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#c9c7c3]">
                {uploading ? "Uploading " + uploadedCount + "/20…" :
                  published ? "Update published collection" : "Publish 20 & Archive Old Products"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
