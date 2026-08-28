"use client";

import Image from "next/image";
import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-1.5 3h12" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="18" cy="19" r="1" />
  </svg>
);

const BagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

const BoxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <path d="m21 8-9 5-9-5 9-5 9 5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

const Navbar = () => {
  const { isSeller, router } = useAppContext();

  const UserMenu = () => (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          label="Home"
          labelIcon={<HomeIcon />}
          onClick={() => router.push("/")}
        />

        <UserButton.Action
          label="Products"
          labelIcon={<BoxIcon />}
          onClick={() => router.push("/all-products")}
        />

        <UserButton.Link
          label="Cart"
          labelIcon={<CartIcon />}
          href="/cart"
        />

        <UserButton.Action
          label="My Orders"
          labelIcon={<BagIcon />}
          onClick={() => router.push("/my-orders")}
        />
      </UserButton.MenuItems>
    </UserButton>
  );

  const AccountSection = () => (
    <>
      <Show when="signed-in">
        <UserMenu />
      </Show>

      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="flex items-center gap-2 transition hover:text-gray-900">
            <Image src={assets.user_icon} alt="Account" />
            <span>Account</span>
          </button>
        </SignInButton>
      </Show>
    </>
  );

  return (
    <nav className="flex items-center justify-between border-b border-gray-300 px-6 py-3 text-gray-700 md:px-16 lg:px-32">
      <Image
        src={assets.logo}
        alt="QuickCart logo"
        className="w-28 cursor-pointer md:w-32"
        onClick={() => router.push("/")}
        priority
      />

      <div className="flex items-center gap-4 max-md:hidden lg:gap-8">
        <Link href="/" className="transition hover:text-gray-900">
          Home
        </Link>

        <Link href="/all-products" className="transition hover:text-gray-900">
          Shop
        </Link>

        <Link href="/about" className="transition hover:text-gray-900">
          About Us
        </Link>

        <Link href="/contact" className="transition hover:text-gray-900">
          Contact
        </Link>

        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="rounded-full border px-4 py-1.5 text-xs"
          >
            Seller Dashboard
          </button>
        )}
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <Image
          src={assets.search_icon}
          alt="Search"
          className="h-4 w-4 cursor-pointer"
        />

        <AccountSection />
      </div>

      <div className="flex items-center gap-3 md:hidden">
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="rounded-full border px-4 py-1.5 text-xs"
          >
            Seller Dashboard
          </button>
        )}

        <AccountSection />
      </div>
    </nav>
  );
};

export default Navbar;