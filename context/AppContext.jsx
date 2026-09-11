"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { productsDummyData } from "@/assets/assets";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();

  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});

  const fetchProductData = async () => {
    try {
      const { data } = await axios.get("/api/product/list");

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch product data error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch products"
      );
    }
  };

  const fetchUserData = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/user/data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setUserData(data.user);
        setCartItems(data.user.cartItems || {});

        if (user?.publicMetadata?.role === "seller") {
          setIsSeller(true);
        } else {
          setIsSeller(false);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch user data error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch user data"
      );
    }
  };

  const addToCart = async (itemId) => {
    try {
      const cartData = structuredClone(cartItems);

      if (cartData[itemId]) {
        cartData[itemId] += 1;
      } else {
        cartData[itemId] = 1;
      }

      // Update the UI immediately
      setCartItems(cartData);

      // Get Clerk token
      const token = await getToken();

      // Save cart to MongoDB
      const { data } = await axios.post(
        "/api/cart/update",
        {
          cartItems: cartData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success("Product added to cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add product to cart"
      );
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    try {
      const cartData = structuredClone(cartItems);

      if (quantity === 0) {
        delete cartData[itemId];
      } else {
        cartData[itemId] = quantity;
      }

      // Update the UI immediately
      setCartItems(cartData);

      // Get Clerk token
      const token = await getToken();

      // Save updated cart to MongoDB
      const { data } = await axios.post(
        "/api/cart/update",
        {
          cartItems: cartData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Update cart quantity error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update cart"
      );
    }
  };

  const getCartCount = () => {
    let totalCount = 0;

    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        totalCount += cartItems[itemId];
      }
    }

    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {
      const itemInfo = products.find(
        (product) => product._id === itemId
      );

      if (itemInfo && cartItems[itemId] > 0) {
        totalAmount +=
          itemInfo.offerPrice * cartItems[itemId];
      }
    }

    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user && isSignedIn) {
      fetchUserData();
    } else {
      setUserData(false);
      setCartItems({});
      setIsSeller(false);
    }
  }, [user, isSignedIn]);

  const value = {
    user,
    isSignedIn,
    getToken,
    currency,
    router,

    isSeller,
    setIsSeller,

    userData,
    fetchUserData,

    products,
    fetchProductData,

    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};