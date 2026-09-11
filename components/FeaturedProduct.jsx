import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const products = [
  {
    id: 1,
    image: assets.girl_with_headphone_image,
    title: "Premium Suits",
    description:
      "Discover refined suits crafted for confidence, elegance, and distinction.",
  },
  {
    id: 2,
    image: assets.girl_with_earphone_image,
    title: "Modern Menswear",
    description:
      "Elevate your wardrobe with sophisticated pieces designed for every occasion.",
  },
  {
    id: 3,
    image: assets.boy_with_laptop_image,
    title: "Complete Your Look",
    description:
      "Find premium fashion pieces that bring style, comfort, and confidence together.",
  },
];

const FeaturedProduct = () => {
  return (
    <div className="mt-14">
      {/* Heading */}
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">
          Featured Collection
        </p>

        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>

        <p className="text-gray-500 text-sm mt-3 text-center px-4">
          Discover the latest from Morven & Grosvenor
        </p>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {products.map(({ id, image, title, description }) => (
          <div
            key={id}
            className="relative group overflow-hidden rounded-xl"
          >
            <Image
              src={image}
              alt={title}
              className="group-hover:brightness-75 transition duration-500 w-full h-auto object-cover"
            />

            <div className="group-hover:-translate-y-4 transition duration-500 absolute bottom-8 left-8 text-white space-y-2">
              <p className="text-xs tracking-[0.2em] uppercase">
                Morven & Grosvenor
              </p>

              <p className="font-medium text-xl lg:text-2xl">
                {title}
              </p>

              <p className="text-sm lg:text-base leading-5 max-w-60">
                {description}
              </p>

              <button className="flex items-center gap-1.5 bg-orange-600 px-4 py-2 rounded">
                Shop Now

                <Image
                  className="h-3 w-3"
                  src={assets.redirect_icon}
                  alt="Redirect Icon"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;