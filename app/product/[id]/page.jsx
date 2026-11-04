"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { getAvailableSizes, needsSize } from "@/lib/sizing.mjs";
import { MORVEN_CONTACT } from "@/lib/morvenContact";

// The existing app/layout.js already renders BOTH Morven navbars.
// All photos, names, prices and descriptions below come from the current catalog.
const money = (value, currency) => Number.isFinite(Number(value))
    ? currency + Number(value).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "Price on request";

const Arrow = ({ left = false }) => (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        className={"h-4 w-4 " + (left ? "rotate-180" : "")}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
    </svg>
);

const OtherProductCard = ({ product, currency }) => (
    <Link href={"/product/" + product._id}
        className="group min-w-0 border border-[#ece9e4] bg-white p-2.5 transition hover:border-[#b4aca1]">
        <div className="aspect-[4/5] overflow-hidden bg-[#f6f5f2]">
            {product.image?.[0] ? (
                <Image unoptimized src={product.image[0]} width={380} height={475} alt={product.name || "Morven product"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.045]" />
            ) : (
                <span className="flex h-full items-center justify-center text-xs text-gray-400">Image unavailable</span>
            )}
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-9 text-[12px] font-medium leading-[1.45] text-[#252320] group-hover:underline">
            {product.name}
        </h3>
        <p className="mt-1.5 text-[13px] font-semibold text-[#252320]">{money(product.offerPrice, currency)}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#8b857d]">{product.category}</p>
    </Link>
);

export default function Product() {
    const { id } = useParams();
    const { products, productsLoading, addToCart, router, currency } = useAppContext();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [size, setSize] = useState("");
    const [adding, setAdding] = useState(false);
    const [tab, setTab] = useState("attributes");
    const [showMore, setShowMore] = useState(false);
    const [zoom, setZoom] = useState(false);
    const [reviewData, setReviewData] = useState({ reviews: [], count: 0, average: 0, canReview: false, hasReviewed: false });
    const [reviewLoading, setReviewLoading] = useState(true);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function loadProduct() {
            setLoading(true);
            setProduct(null);
            setSize("");
            setPhotoIndex(0);
            setTab("attributes");
            setShowMore(false);
            try {
                const response = await fetch("/api/product/" + encodeURIComponent(id), { cache: "no-store" });
                const data = await response.json();
                if (mounted) setProduct(data.success ? data.product : null);
            } catch (error) {
                console.error("Product detail request failed:", error);
                if (mounted) setProduct(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        if (id) loadProduct();
        return () => { mounted = false; };
    }, [id]);

    useEffect(() => {
        if (!zoom) return;
        const closeOnEscape = (event) => { if (event.key === "Escape") setZoom(false); };
        document.addEventListener("keydown", closeOnEscape);
        return () => document.removeEventListener("keydown", closeOnEscape);
    }, [zoom]);

    useEffect(() => {
        if (!id) return;
        let active = true;
        async function fetchReviews() {
            setReviewLoading(true);
            try {
                const response = await fetch("/api/reviews/" + encodeURIComponent(id), { cache: "no-store" });
                const data = await response.json();
                if (active && data.success) setReviewData(data);
            } catch (error) {
                console.error("Reviews request failed:", error);
            } finally {
                if (active) setReviewLoading(false);
            }
        }
        fetchReviews();
        return () => { active = false; };
    }, [id]);

    const submitReview = async (event) => {
        event.preventDefault();
        if (reviewSubmitting) return;
        setReviewSubmitting(true);
        try {
            const response = await fetch("/api/reviews/" + encodeURIComponent(id), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.message || "Unable to submit review.");
            const fresh = await fetch("/api/reviews/" + encodeURIComponent(id), { cache: "no-store" });
            const latest = await fresh.json();
            if (latest.success) setReviewData(latest);
            setReviewComment("");
            setTab("reviews");
            toast.success("Thank you for reviewing your purchase!");
        } catch (error) {
            toast.error(error.message || "Unable to submit review.");
        } finally {
            setReviewSubmitting(false);
        }
    };

    const otherProducts = useMemo(() => {
        if (!product) return [];
        const others = (Array.isArray(products) ? products : []).filter(
            (item) => item?._id && item._id !== product._id
        );
        const match = others.filter(
            (item) => String(item.category).toLowerCase() === String(product.category).toLowerCase()
        );
        const rest = others.filter(
            (item) => String(item.category).toLowerCase() !== String(product.category).toLowerCase()
        );
        return [...match, ...rest];
    }, [products, product]);

    if (loading) return <Loading />;

    if (!product) return (
        <>
            <div className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-5 text-center">
                <h1 className="text-2xl font-medium text-[#26231e]">Product not available</h1>
                <p className="mt-3 text-sm text-[#77736e]">This item may have been removed or is temporarily unavailable.</p>
                <Link href="/all-products" className="mt-7 bg-[#f26717] px-7 py-3 text-sm font-medium text-white">
                    Browse other products
                </Link>
            </div>
            <Footer />
        </>
    );

    const photos = Array.isArray(product.image) ? product.image.filter(
        (item) => typeof item === "string" && item.trim()
    ) : [];
    const currentPhoto = photos[Math.min(photoIndex, Math.max(0, photos.length - 1))];
    const sizes = getAvailableSizes(product);
    const sizeRequired = needsSize(product);
    const category = String(product.category || "Collection");
    const discounted = Number(product.price) > Number(product.offerPrice);
    const dataRows = [
        ["Brand", "Morven"],
        ["Category", category],
        ["Material", product.material],
        ["Fabric type", product.fabricType],
        ["Fit", product.fit],
        ["Style", product.style],
        ["Colour", product.color],
        ["Pattern", product.pattern],
        ["Occasion", product.occasion],
        ["Available sizes", sizeRequired ? sizes.join(", ") : null],
    ].filter(([, value]) => value != null && String(value).trim());

    const nextPhoto = (step) => setPhotoIndex(
        (previous) => photos.length ? (previous + step + photos.length) % photos.length : 0
    );

    const cartAction = async (buyNow) => {
        if (adding) return;
        if (sizeRequired && !size) {
            toast.error("Select your size first.");
            return;
        }
        setAdding(true);
        try {
            const added = await addToCart(product._id, size);
            if (buyNow && added) router.push("/cart");
        } catch (error) {
            console.error("Add to bag failed:", error);
            toast.error("Could not add this item to the cart.");
        } finally {
            setAdding(false);
        }
    };

    const share = async () => {
        try {
            if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
            else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Product link copied");
            }
        } catch (error) {
            if (error.name !== "AbortError") toast.error("Could not share this product.");
        }
    };

    return (
        <>
            <div className="mx-auto w-full max-w-[1480px] px-4 pb-20 pt-5 text-[#272521] sm:px-6 lg:px-8 xl:px-10">
                <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[11px] text-[#807870]">
                    <Link href="/" className="hover:text-[#e86720]">Home</Link>
                    <span>/</span>
                    <Link href="/all-products" className="hover:text-[#e86720]">All Products</Link>
                    <span>/</span>
                    <Link href={"/all-products?category=" + encodeURIComponent(category)} className="hover:text-[#e86720]">
                        {category}
                    </Link>
                    <span>/</span>
                    <span className="max-w-72 truncate text-[#302d29]" aria-current="page">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 xl:gap-8">
                    {/* Current Morven gallery and thumbnails, no added promotional images. */}
                    <section aria-label="Product photos" className="lg:col-span-5 xl:col-span-4">
                        <div className="flex gap-3">
                            {photos.length > 1 && (
                                <div className="hidden w-[65px] shrink-0 flex-col gap-2 sm:flex">
                                    {photos.map((source, index) => (
                                        <button type="button" key={source + index}
                                            aria-label={"View photo " + (index + 1)}
                                            aria-pressed={photoIndex === index}
                                            onClick={() => setPhotoIndex(index)}
                                            className={"aspect-[3/4] overflow-hidden border-2 bg-[#f8f7f4] " +
                                                (photoIndex === index ? "border-[#f26717]" : "border-transparent hover:border-[#afa69d]")}>
                                            <Image unoptimized src={source} width={100} height={130} alt=""
                                                className="h-full w-full object-contain" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="relative min-w-0 flex-1 overflow-hidden rounded-sm border border-[#eae7e2] bg-[#f7f6f3]">
                                <div className="flex aspect-[4/5] items-center justify-center">
                                    {currentPhoto ? (
                                        <button type="button" onClick={() => setZoom(true)}
                                            aria-label="Enlarge photo" className="h-full w-full cursor-zoom-in">
                                            <Image unoptimized key={currentPhoto} src={currentPhoto} width={900} height={1125}
                                                alt={product.name} priority className="h-full w-full object-contain" />
                                        </button>
                                    ) : <p className="text-sm text-gray-400">Image unavailable</p>}
                                </div>
                                <button type="button" onClick={share} aria-label="Share product"
                                    className="absolute right-3 top-3 rounded-full border border-[#eee9e3] bg-white/95 px-3 py-2 text-xs shadow-sm">
                                    Share
                                </button>
                                {photos.length > 1 && (
                                    <>
                                        <button type="button" aria-label="Previous photo" onClick={() => nextPhoto(-1)}
                                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm"><Arrow left /></button>
                                        <button type="button" aria-label="Next photo" onClick={() => nextPhoto(1)}
                                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm"><Arrow /></button>
                                    </>
                                )}
                            </div>
                        </div>
                        {photos.length > 1 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
                                {photos.map((source, index) => (
                                    <button type="button" key={source + index} onClick={() => setPhotoIndex(index)}
                                        aria-label={"View photo " + (index + 1)}
                                        className={"h-20 w-16 shrink-0 overflow-hidden border-2 bg-[#f7f6f3] " +
                                            (photoIndex === index ? "border-[#f26717]" : "border-transparent")}>
                                        <Image unoptimized src={source} width={80} height={100} alt="" className="h-full w-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="mt-3 rounded-md border border-[#e6e3df] bg-white p-3.5 shadow-[0_3px_15px_rgba(0,0,0,0.03)]">
                            <div className="flex items-center gap-2.5 border-b border-[#ece9e5] pb-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[#ece9e5] bg-[#faf9f7] text-[24px] font-semibold">M</div>
                                <div className="min-w-0">
                                    <h2 className="truncate text-[12px] font-semibold underline decoration-[#b4aca3] underline-offset-2">Morven Ghana</h2>
                                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#877e75]">
                                        <span aria-label="Ghana flag" role="img">🇬🇭</span> {MORVEN_CONTACT.location}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-[#ece9e5] py-3">
                                <div>
                                    <p className="text-[12px] font-semibold">Product enquiries</p>
                                    <p className="mt-1 text-[10px] text-[#8d857d]">Contact our team</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-semibold">Shop other styles</p>
                                    <p className="mt-1 text-[10px] text-[#8d857d]">Browse Morven</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-[11px]">
                                <a href={"https://wa.me/" + MORVEN_CONTACT.whatsappNumber} target="_blank" rel="noopener noreferrer"
                                    className="font-semibold text-[#7c2b3d] hover:underline">WhatsApp Morven →</a>
                                <a href={"tel:" + MORVEN_CONTACT.phoneE164} className="text-[#766e65] hover:underline">{MORVEN_CONTACT.phoneDisplay}</a>
                                <Link href="/all-products" className="text-[#766e65] hover:underline">Other products →</Link>
                            </div>
                        </div>
                    </section>

                    {/* The product title, product data and size picker remain dynamic. */}
                    <section className="lg:col-span-7 xl:col-span-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a56c4d]">
                            Morven Collection / {category}
                        </p>
                        <h1 className="mt-3 text-[23px] font-semibold leading-[1.35] tracking-[-0.025em] sm:text-[27px]">
                            {product.name}
                        </h1>
                        {reviewData.count > 0 && (
                            <button type="button"
                                onClick={() => { setTab("reviews"); document.getElementById("morven-reviews")?.scrollIntoView({ behavior: "smooth" }); }}
                                className="mt-3 flex items-center gap-2 text-[12px] hover:text-[#d8661e]">
                                <span className="text-[#f08427]">{"★".repeat(Math.round(reviewData.average))}</span>
                                <span>{Number(reviewData.average).toFixed(1)} / 5</span>
                                <span className="text-[#8d8379]">({reviewData.count} verified reviews)</span>
                            </button>
                        )}
                        <div className="mt-5 border-b border-[#ece9e3] pb-5">
                            <p className="text-[30px] font-bold tracking-[-0.03em]">{money(product.offerPrice, currency)}</p>
                            {discounted && (
                                <p className="mt-2 text-[13px] text-[#928a81]">
                                    Regular price <span className="line-through">{money(product.price, currency)}</span>
                                </p>
                            )}
                        </div>
                        {product.color && (
                            <div className="border-b border-[#ece9e3] py-5">
                                <p className="mb-2 text-[12px] font-semibold">Colour</p>
                                <span className="inline-block border border-[#dad5cd] bg-[#f9f8f5] px-3 py-2 text-[12px]">
                                    {product.color}
                                </span>
                            </div>
                        )}
                        {sizeRequired && (
                            <div className="border-b border-[#ece9e3] py-5">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="text-[12px] font-semibold">Select Size *</h2>
                                    <p className="text-[11px] text-[#8a837c]">
                                        {size ? "Selected: " + size : "Choose the right fit"}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((option) => (
                                        <button type="button" key={option} aria-pressed={size === option}
                                            onClick={() => setSize(option)}
                                            className={"min-w-[46px] border px-3 py-2.5 text-[12px] font-medium transition " +
                                                (size === option
                                                    ? "border-[#292521] bg-[#292521] text-white"
                                                    : "border-[#e2dfd9] bg-[#faf9f7] hover:border-[#292521]")}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-3 text-[11px] leading-[1.6] text-[#898179]">
                                    Need help with sizing? Contact Morven before placing your order.
                                </p>
                            </div>
                        )}
                        <h2 className="mb-3 mt-6 text-[13px] font-semibold">Key attributes</h2>
                        <dl className="grid grid-cols-2 overflow-hidden border border-[#eae7e2]">
                            {dataRows.slice(0, 6).map(([label, value]) => (
                                <div key={label} className="border-b border-r border-[#eae7e2] p-3 even:border-r-0">
                                    <dt className="mb-1 text-[11px] text-[#9a9288]">{label}</dt>
                                    <dd className="text-[12px] font-medium leading-snug">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <h2 className="mb-2 mt-7 text-[13px] font-semibold">About this item</h2>
                        <p className="whitespace-pre-line text-[13px] leading-[1.85] text-[#716a63]">
                            {product.description}
                        </p>
                    </section>

                    {/* No supplier pages, fabricated ratings, or phone numbers. */}
                    <aside className="lg:col-span-12 xl:sticky xl:top-40 xl:col-span-3">
                        <div className="rounded-sm border border-[#e7e3dc] bg-white p-5 shadow-[0_3px_18px_rgba(0,0,0,0.025)]">
                            <h2 className="text-[16px] font-semibold">Order this item</h2>
                            <p className="mt-2 text-[12px] leading-[1.7] text-[#807970]">
                                Select your item and complete checkout with Morven.
                            </p>
                            <p className="mt-5 text-[24px] font-bold tracking-[-0.025em]">
                                {money(product.offerPrice, currency)}
                            </p>
                            {sizeRequired && (
                                <p className="mt-2 text-[11px] text-[#938a81]">
                                    {size ? "Selected size: " + size : "Select a size to continue"}
                                </p>
                            )}
                            <button type="button" disabled={adding || (sizeRequired && !size)}
                                onClick={() => cartAction(true)}
                                className="mt-5 w-full rounded-full bg-[#f26717] px-5 py-3 text-[12px] font-semibold text-white hover:bg-[#d95611] disabled:cursor-not-allowed disabled:opacity-45">
                                {adding ? "Adding to bag..." : "Buy now"}
                            </button>
                            <button type="button" disabled={adding || (sizeRequired && !size)}
                                onClick={() => cartAction(false)}
                                className="mt-2.5 w-full rounded-full border border-[#aaa399] px-5 py-3 text-[12px] font-semibold hover:bg-[#faf9f7] disabled:cursor-not-allowed disabled:opacity-45">
                                Add to cart
                            </button>
                            <Link href="/contact" className="mt-2.5 block w-full rounded-full border border-[#e2ded8] px-5 py-3 text-center text-[12px] font-medium hover:bg-[#faf9f7]">
                                Contact Morven
                            </Link>
                            <div className="mt-6 space-y-5 border-t border-[#ece9e3] pt-5">
                                <div>
                                    <h3 className="text-[12px] font-semibold">Delivery information</h3>
                                    <p className="mt-1 text-[11px] leading-[1.7] text-[#898279]">
                                        Delivery arrangements and any applicable charges are confirmed at checkout.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-[12px] font-semibold">Secure checkout</h3>
                                    <p className="mt-1 text-[11px] leading-[1.7] text-[#898279]">
                                        Continue to the existing Paystack payment flow.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* All recommendations come from the existing product collection. */}
                <section className="mt-16 border-t border-[#ece9e3] pt-10" aria-labelledby="other-products">
                    <div className="mb-6 flex items-end justify-between gap-3">
                        <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ac7557]">Explore Morven</p>
                            <h2 id="other-products" className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">Other Products</h2>
                        </div>
                        <Link href="/all-products" className="inline-flex items-center gap-1 text-[12px] font-medium hover:text-[#e86720]">
                            View all <Arrow />
                        </Link>
                    </div>
                    {otherProducts.length ? (
                        <>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                                {(showMore ? otherProducts.slice(0, 24) : otherProducts.slice(0, 12)).map((item) => (
                                    <OtherProductCard key={item._id} product={item} currency={currency} />
                                ))}
                            </div>
                            {otherProducts.length > 12 && (
                                <button type="button" onClick={() => setShowMore((previous) => !previous)}
                                    className="mx-auto mt-7 block border border-[#292521] px-8 py-3 text-[12px] font-medium hover:bg-[#292521] hover:text-white">
                                    {showMore ? "Show fewer" : "See more products"}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="bg-[#faf9f7] p-8 text-center text-[13px] text-[#8b837a]">
                            {productsLoading ? "Loading Morven products..." : "More products will appear here when added to the collection."}
                        </div>
                    )}
                </section>

                <section id="morven-reviews" className="scroll-mt-44 mt-14 border-t border-[#ece9e3] pt-6">
                    <div className="flex gap-8 border-b border-[#eae7e2]">
                        {[
                            { id: "attributes", label: "Attributes & details" },
                            { id: "reviews", label: "Reviews (" + reviewData.count + ")" },
                        ].map((entry) => (
                            <button key={entry.id} type="button" onClick={() => setTab(entry.id)}
                                className={"border-b-2 pb-4 text-[13px] font-semibold " +
                                    (tab === entry.id ? "border-[#f26717] text-[#292521]" : "border-transparent text-[#918980]")}>
                                {entry.label}
                            </button>
                        ))}
                    </div>
                    {tab === "attributes" ? (
                        <div className="max-w-[950px] pt-8">
                            <h3 className="mb-4 text-[15px] font-semibold">Key attributes</h3>
                            <dl className="overflow-hidden border border-[#eae7e2] text-[12px]">
                                {dataRows.map(([label, value], index) => (
                                    <div key={label} className={"grid grid-cols-[130px_1fr] border-b border-[#eae7e2] last:border-b-0 sm:grid-cols-[240px_1fr] " +
                                        (index % 2 === 0 ? "bg-[#faf9f7]" : "bg-white")}>
                                        <dt className="border-r border-[#eae7e2] px-4 py-3 font-medium text-[#756e66]">{label}</dt>
                                        <dd className="px-4 py-3">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                            <h3 className="mb-3 mt-9 text-[15px] font-semibold">Product description</h3>
                            <p className="whitespace-pre-line text-[13px] leading-[1.85] text-[#716a63]">
                                {product.description}
                            </p>
                            <h3 className="mb-3 mt-9 text-[15px] font-semibold">Delivery & enquiries</h3>
                            <p className="text-[13px] leading-[1.85] text-[#716a63]">
                                Contact Morven for help with fit, availability and delivery options.
                            </p>
                            <Link href="/contact" className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-[#e86720]">
                                Contact Morven <Arrow />
                            </Link>
                        </div>
                    ) : (
                        <div className="max-w-[950px] py-8">
                            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#ece9e3] pb-6">
                                <div>
                                    <h3 className="text-[16px] font-semibold">Customer reviews</h3>
                                    {reviewData.count > 0 ? (
                                        <p className="mt-2 text-[13px]">
                                            <span className="font-bold text-[#e86d20]">{"★".repeat(Math.round(reviewData.average))}</span>
                                            <span className="ml-2 font-semibold">{Number(reviewData.average).toFixed(1)} / 5</span>
                                            <span className="ml-2 text-[#8c8278]">({reviewData.count} verified {reviewData.count === 1 ? "review" : "reviews"})</span>
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-[12px] text-[#8c8278]">No verified reviews submitted yet.</p>
                                    )}
                                </div>
                                <p className="text-[11px] text-[#8c8278]">Only customers with confirmed purchases can post reviews.</p>
                            </div>
                            {reviewLoading ? (
                                <p className="py-7 text-[13px] text-[#8d8279]">Loading reviews...</p>
                            ) : reviewData.reviews.length ? (
                                <div className="divide-y divide-[#ece9e3]">
                                    {reviewData.reviews.map((review) => (
                                        <article key={review._id} className="py-5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[13px] font-semibold text-[#ec721e]">{"★".repeat(review.rating)}</span>
                                                <span className="text-[12px] font-semibold text-[#3b352e]">{review.displayName || "Verified customer"}</span>
                                                <span className="rounded-sm bg-[#f1f8ef] px-2 py-1 text-[10px] text-[#42763b]">Verified purchase</span>
                                            </div>
                                            <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-6 text-[#635c54]">{review.comment}</p>
                                            <p className="mt-2 text-[10px] text-[#a39b91]">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric" }) : ""}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            ) : null}
                            {reviewData.canReview && (
                                <form onSubmit={submitReview} className="mt-7 space-y-3 rounded-sm border border-[#eae7e2] bg-[#faf9f7] p-5">
                                    <h4 className="text-[14px] font-semibold">Review your purchase</h4>
                                    <label htmlFor="review-stars" className="block text-[12px] font-medium">Rating</label>
                                    <select id="review-stars" value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}
                                        className="w-full max-w-48 border border-[#d8d3cb] bg-white px-3 py-2 text-[13px]">
                                        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} {n === 1 ? "star" : "stars"}</option>)}
                                    </select>
                                    <label htmlFor="review-message" className="block text-[12px] font-medium">Your experience</label>
                                    <textarea id="review-message" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)}
                                        minLength={15} maxLength={800} required rows={4}
                                        placeholder="How was the quality, fit and overall experience?"
                                        className="w-full border border-[#d8d3cb] bg-white p-3 text-[13px] outline-none focus:border-[#ef742b]" />
                                    <button type="submit" disabled={reviewSubmitting}
                                        className="rounded-full bg-[#f26717] px-6 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50">
                                        {reviewSubmitting ? "Submitting..." : "Post verified review"}
                                    </button>
                                </form>
                            )}
                            {reviewData.hasReviewed && (
                                <p className="mt-6 text-[12px] text-[#6a7564]">Thank you. Your review for this product has been submitted.</p>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {zoom && currentPhoto && (
                <div role="dialog" aria-modal="true" aria-label="Enlarged product photo"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-5"
                    onClick={() => setZoom(false)}>
                    <button type="button" aria-label="Close photo" onClick={() => setZoom(false)}
                        className="absolute right-6 top-6 rounded-full border border-white/40 bg-black/40 px-4 py-2 text-sm text-white">
                        Close ×
                    </button>
                    <div className="flex h-full max-h-[90vh] w-full max-w-[900px] items-center justify-center"
                        onClick={(event) => event.stopPropagation()}>
                        <Image unoptimized src={currentPhoto} width={1100} height={1375} alt={product.name}
                            className="max-h-full w-auto max-w-full object-contain" />
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}
