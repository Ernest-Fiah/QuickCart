"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { cartKey, parseCartKey, validateItem, cleanCart } from "@/lib/commerce.mjs";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const currency = "GH₵";
  const router = useRouter();

  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});

  const fetchProductData = async () => {
    try {
      setProductsLoading(true);

      const { data } = await axios.get("/api/product/list");

      if (data.success) {
        setProducts(data.products || []);
      } else {
        toast.error(data.message);
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch product data error:", error);

      setProducts([]);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch products"
      );
    } finally {
      setProductsLoading(false);
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
        setCartItems(cleanCart(data.user.cartItems));

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

  const cartLock = useRef(false);
  const [cartBusy, setCartBusy] = useState(false);
  const saveCart = async (cartData) => {
    const token = await getToken();
    const { data } = await axios.post('/api/cart/update', { cartItems: cartData }, { headers: { Authorization: `Bearer ${token}` } });
    if (!data.success) throw new Error(data.message);
    setCartItems(cartData);
  };
  const addToCart = async (itemId, size = '') => {
    if (!isSignedIn) { toast.error('Please sign in to add items'); return false; }
    if (cartLock.current) return false;
    cartLock.current = true;
    setCartBusy(true);
    try {
      const product = products.find(p => p._id === itemId);
      const key = cartKey(itemId, size);
      validateItem({ quantity: (cartItems[key] || 0) + 1, size }, product);
      await saveCart({ ...cartItems, [key]: (cartItems[key] || 0) + 1 });
      toast.success('Product added to cart');
      return true;
    } catch (error) { toast.error(error.response?.data?.message || error.message); return false; }
    finally { cartLock.current = false; setCartBusy(false); }
  };
  const updateCartQuantity = async (key, quantity) => {
    if (cartLock.current || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 99) return;
    cartLock.current = true;
    setCartBusy(true);
    try {
      const next = { ...cartItems };
      if (quantity === 0) delete next[key]; else next[key] = quantity;
      await saveCart(next);
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to update cart'); }
    finally { cartLock.current = false; setCartBusy(false); }
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
        (product) => product._id === parseCartKey(itemId).product
      );

      if (itemInfo && cartItems[itemId] > 0) {
        totalAmount += Math.round(itemInfo.offerPrice * 100) * cartItems[itemId] / 100;
      }
    }

    return Math.round(totalAmount * 100) / 100;
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
    productsLoading,
    fetchProductData,

    cartItems,
    cartBusy,
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
