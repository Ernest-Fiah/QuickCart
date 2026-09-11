import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Banner = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between md:pl-20 py-14 md:py-0 bg-[#F5F5F3] my-16 rounded-xl overflow-hidden">

      {/* Left Image */}
      <Image
        className="max-w-56 object-contain"
        src={assets.jbl_soundbox_image}
        alt="Morven and Grosvenor collection"
      />

      {/* Content */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 px-4 md:px-0">

        <p className="text-xs md:text-sm tracking-[0.25em] uppercase text-gray-500">
          Morven & Grosvenor
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold max-w-[320px]">
          Elevate Your Style
        </h2>

        <p className="max-w-[343px] font-medium text-gray-800/60">
          Discover premium suits and refined menswear designed for confidence,
          elegance, and distinction.
        </p>

        <button className="group flex items-center justify-center gap-2 px-10 py-2.5 bg-orange-600 rounded text-white">
          Shop Collection
          <Image
            className="group-hover:translate-x-1 transition"
            src={assets.arrow_icon_white}
            alt="arrow"
          />
        </button>
      </div>

      {/* Right Image */}
      <Image
        className="hidden md:block max-w-80 object-contain"
        src={assets.md_controller_image}
        alt="Grosvenor menswear"
      />

      {/* Mobile Image */}
      <Image
        className="md:hidden max-w-72 object-contain mt-6"
        src={assets.sm_controller_image}
        alt="Grosvenor menswear"
      />
    </div>
  );
};

export default Banner;