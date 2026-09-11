import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      title: "Make a Powerful First Impression with Grosvenor",
      offer: "Premium Menswear Collection",
      buttonText1: "Shop Now",
      buttonText2: "Explore Collection",
      imgSrc: assets.header_headphone_image,
    },
    {
      id: 2,
      title: "Elevate Your Style with Exceptional Craftsmanship",
      offer: "Exclusive Collection",
      buttonText1: "Discover More",
      buttonText2: "View Collection",
      imgSrc: assets.header_playstation_image,
    },
    {
      id: 3,
      title: "Dress with Confidence. Define Your Presence.",
      offer: "Grosvenor Premium Suits",
      buttonText1: "Shop Now",
      buttonText2: "Explore More",
      imgSrc: assets.header_macbook_image,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full"
          >
            {/* TEXT */}
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 pb-1 font-medium">
                {slide.offer}
              </p>

              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold">
                {slide.title}
              </h1>

              <div className="flex items-center mt-4 md:mt-6">
                <button className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium">
                  {slide.buttonText1}
                </button>

                <button className="group flex items-center gap-2 px-6 py-2.5 font-medium">
                  {slide.buttonText2}

                  <Image
                    className="group-hover:translate-x-1 transition"
                    src={assets.arrow_icon}
                    alt="arrow"
                  />
                </button>
              </div>
            </div>

            {/* IMAGE */}
            <div className="flex items-center flex-1 justify-center">
              <Image
                className="md:w-72 w-48 object-contain"
                src={slide.imgSrc}
                alt={slide.title}
                priority={index === 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* SLIDER DOTS */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              currentSlide === index
                ? "bg-orange-600"
                : "bg-gray-500/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;