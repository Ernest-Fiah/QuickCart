"use client";

import Link from "next/link";
import { MORVEN_CONTACT } from "@/lib/morvenContact";

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="border-t border-[#e6dcd5] bg-[#f7f2ee] text-[#3c3231]">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.7fr_0.8fr_0.9fr_1.2fr] lg:gap-14 lg:px-10">
        <div>
          <Link href="/" className="font-sans text-[36px] font-light tracking-[-0.035em] text-[#171414]">
            Morven
          </Link>
          <p className="mt-4 max-w-[330px] text-[12px] leading-[1.9] text-[#756a66]">
            Refined menswear for the modern gentleman. Explore suits, shirts,
            jackets, shoes and accessories designed to elevate every wardrobe.
          </p>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7c2b3d]">
            Style. Confidence. Distinction.
          </p>
        </div>

        <div>
          <h2 className="mb-5 text-[12px] font-bold uppercase tracking-[0.1em]">Company</h2>
          <nav aria-label="Footer company links" className="flex flex-col items-start gap-3 text-[12px] text-[#6b605c]">
            <Link href="/" className="hover:text-[#7c2b3d]">Home</Link>
            <Link href="/all-products" className="hover:text-[#7c2b3d]">Shop</Link>
            <Link href="/about" className="hover:text-[#7c2b3d]">About Us</Link>
            <Link href="/contact" className="hover:text-[#7c2b3d]">Contact Us</Link>
          </nav>
        </div>

        <div>
          <h2 className="mb-5 text-[12px] font-bold uppercase tracking-[0.1em]">Customer Service</h2>
          <nav aria-label="Customer service" className="flex flex-col items-start gap-3 text-[12px] text-[#6b605c]">
            <Link href="/contact" className="hover:text-[#7c2b3d]">Delivery Enquiries</Link>
            <Link href="/contact" className="hover:text-[#7c2b3d]">Returns & Exchanges</Link>
            <Link href="/contact" className="hover:text-[#7c2b3d]">Size Assistance</Link>
            <Link href="/contact" className="hover:text-[#7c2b3d]">Order Enquiries</Link>
          </nav>
        </div>

        <div>
          <h2 className="mb-5 text-[12px] font-bold uppercase tracking-[0.1em]">Get In Touch</h2>
          <address className="flex flex-col gap-3 text-[12px] not-italic text-[#6b605c]">
            <span className="flex gap-2"><span aria-hidden="true">🇬🇭</span>{MORVEN_CONTACT.location}</span>
            <a href={"tel:" + MORVEN_CONTACT.phoneE164} className="hover:text-[#7c2b3d]">
              {MORVEN_CONTACT.phoneDisplay}
            </a>
            <a href={"tel:" + MORVEN_CONTACT.secondaryPhoneE164} className="hover:text-[#7c2b3d]">
              {MORVEN_CONTACT.secondaryPhoneDisplay}
            </a>
            <a href={"mailto:" + MORVEN_CONTACT.email}
              className="break-all hover:text-[#7c2b3d]">{MORVEN_CONTACT.email}</a>
          </address>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={"https://wa.me/" + MORVEN_CONTACT.whatsappNumber} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#bdaea5] bg-white px-3.5 py-2 text-[11px] font-semibold text-[#692a3a] hover:border-[#7c2b3d]">
              WhatsApp <Arrow />
            </a>
            <a href={MORVEN_CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#bdaea5] bg-white px-3.5 py-2 text-[11px] font-semibold text-[#692a3a] hover:border-[#7c2b3d]">
              {MORVEN_CONTACT.instagramHandle} <Arrow />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#e5d9d1]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-6 py-5 text-center text-[10px] uppercase tracking-[0.13em] text-[#938680] sm:flex-row sm:justify-between sm:text-left lg:px-10">
          <p>© {new Date().getFullYear()} Morven Ghana. All rights reserved.</p>
          <p>Premium Menswear · Accra, Ghana</p>
        </div>
      </div>
    </footer>
  );
}
