import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="flex flex-col md:flex-row items-start justify-between px-6 md:px-16 lg:px-32 gap-12 py-14 border-b border-gray-200 text-gray-500">

        {/* BRAND */}
        <div className="w-full md:w-2/5">
          <Image
            className="w-32 md:w-36"
            src={assets.logo}
            alt="Grosvenor logo"
          />

          <p className="mt-6 text-sm leading-6 max-w-md">
            Discover refined menswear crafted for the modern gentleman.
            Grosvenor brings together exceptional craftsmanship, timeless
            style and premium quality to help you dress with confidence
            for every occasion.
          </p>

          <p className="mt-4 text-sm font-medium text-gray-700">
            Style. Confidence. Distinction.
          </p>
        </div>

        {/* COMPANY */}
        <div className="w-full md:w-1/5">
          <h2 className="font-semibold text-gray-900 mb-5">
            Company
          </h2>

          <ul className="text-sm space-y-3">
            <li>
              <a
                className="hover:text-black transition"
                href="/"
              >
                Home
              </a>
            </li>

            <li>
              <a
                className="hover:text-black transition"
                href="/all-products"
              >
                Shop
              </a>
            </li>

            <li>
              <a
                className="hover:text-black transition"
                href="#"
              >
                About Us
              </a>
            </li>

            <li>
              <a
                className="hover:text-black transition"
                href="#"
              >
                Contact Us
              </a>
            </li>

            <li>
              <a
                className="hover:text-black transition"
                href="#"
              >
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* CUSTOMER SERVICE */}
        <div className="w-full md:w-1/5">
          <h2 className="font-semibold text-gray-900 mb-5">
            Customer Service
          </h2>

          <ul className="text-sm space-y-3">
            <li>
              <a
                className="hover:text-black transition"
                href="#"
              >
                Delivery Information
              </a>
            </li>

            <li>
              <a
                className="hover:text-black transition"
                href="#"
              >
                Returns & Exchanges
              </a>
            </li>

            <li>
              <a
                className="hover:text-black transition"
                href="#"
              >
                Size Guide
              </a>
            </li>

            <li>
              <a
                className="hover:text-black transition"
                href="#"
              >
                FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="w-full md:w-1/5">
          <h2 className="font-semibold text-gray-900 mb-5">
            Get in Touch
          </h2>

          <div className="text-sm space-y-3">
            <p>Grosvenor TK Ghana LTD</p>

            <p>
              Accra, Ghana
            </p>

            <p>
              +233 XX XXX XXXX
            </p>

            <p>
              info@grosvenor.com
            </p>
          </div>

          {/* SOCIAL MEDIA */}
          <div className="flex items-center gap-4 mt-6">
            <a href="#" aria-label="Instagram">
              <Image
                src={assets.instagram_icon}
                alt="Instagram"
                width={20}
                height={20}
                className="opacity-70 hover:opacity-100 transition"
              />
            </a>

            <a href="#" aria-label="Facebook">
              <Image
                src={assets.facebook_icon}
                alt="Facebook"
                width={20}
                height={20}
                className="opacity-70 hover:opacity-100 transition"
              />
            </a>

            <a href="#" aria-label="Twitter">
              <Image
                src={assets.twitter_icon}
                alt="Twitter"
                width={20}
                height={20}
                className="opacity-70 hover:opacity-100 transition"
              />
            </a>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <p className="py-5 text-center text-xs md:text-sm text-gray-500">
        © {new Date().getFullYear()} Grosvenor TK Ghana LTD. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;