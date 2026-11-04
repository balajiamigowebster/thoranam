"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useSyncExternalStore,
} from "react";

const CartContext = createContext(null);

const emptySubscribe = () => () => {};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [animatingFlyers, setAnimatingFlyers] = useState([]);
  const [badgeBump, setBadgeBump] = useState(false);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("thoranam_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out any previously cached default test item
          const filtered = parsed.filter((item) => item.id !== "default-item");
          if (filtered.length !== parsed.length) {
            localStorage.setItem("thoranam_cart", JSON.stringify(filtered));
          }
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCartItems(filtered);
        }
      }
    } catch (e) {
      console.error("Cart localStorage error:", e);
    }
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "thoranam_cart" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        } catch (err) {}
      }
    };
    const handleCustomUpdate = () => {
      try {
        const stored = localStorage.getItem("thoranam_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        }
      } catch (err) {}
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("thoranam_cart_updated", handleCustomUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("thoranam_cart_updated", handleCustomUpdate);
    };
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    try {
      localStorage.setItem("thoranam_cart", JSON.stringify(items));
      window.dispatchEvent(new Event("thoranam_cart_updated"));
    } catch (e) {}
  };

  /**
   * addToCart - Immediate synchronous cart update with persistence
   */
  const addToCart = (item, quantity = 1) => {
    if (!item) return [];

    let current = [];
    try {
      const stored = localStorage.getItem("thoranam_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) current = parsed;
      }
    } catch (e) {
      current = [...cartItems];
    }

    const itemId = String(item.id);
    const existingIdx = current.findIndex((p) => String(p.id) === itemId);
    let updated;
    if (existingIdx > -1) {
      updated = current.map((p, idx) =>
        idx === existingIdx
          ? { ...p, quantity: (p.quantity || 1) + quantity }
          : p
      );
    } else {
      updated = [...current, { ...item, quantity }];
    }

    try {
      localStorage.setItem("thoranam_cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("thoranam_cart_updated"));
    } catch (e) {}

    setCartItems(updated);
    setBadgeBump(true);
    setTimeout(() => setBadgeBump(false), 900);

    return updated;
  };

  /**
   * triggerAddToCartAnimation
   * @param {Object} options
   * @param {HTMLElement|DOMRect} options.startElementOrRect - The element clicked or its getBoundingClientRect()
   * @param {string} options.image - image URL to fly to the cart
   * @param {Object} options.item - product data to add to cart
   * @param {number} options.quantity - quantity added
   */
  const triggerAddToCartAnimation = ({
    startElementOrRect,
    image = "/images/product-1.jpg",
    item = {},
    quantity = 1,
  }) => {
    // Immediately persist item so navigation/state is never delayed
    addToCart(item, quantity);

    if (typeof window === "undefined") return;

    // 1. Calculate Start Rect
    let startRect = null;
    if (startElementOrRect instanceof HTMLElement) {
      startRect = startElementOrRect.getBoundingClientRect();
    } else if (startElementOrRect && typeof startElementOrRect === "object") {
      startRect = startElementOrRect;
    }

    if (!startRect) {
      // Fallback center of screen
      startRect = {
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        width: 60,
        height: 60,
      };
    }

    // 2. Find Target Cart Icon in Header
    const cartTarget =
      document.getElementById("header-cart-icon-btn") ||
      document.querySelector('a[aria-label="Shopping Cart"]');

    let endRect = {
      top: 25,
      left: window.innerWidth - 60,
      width: 32,
      height: 32,
    };

    if (cartTarget) {
      endRect = cartTarget.getBoundingClientRect();
    }

    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;

    const flyerId = "flyer-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

    const newFlyer = {
      id: flyerId,
      image,
      startX,
      startY,
      endX,
      endY,
      stage: "start",
    };

    setAnimatingFlyers((prev) => [...prev, newFlyer]);

    // Force frame to start transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimatingFlyers((prev) =>
          prev.map((f) => (f.id === flyerId ? { ...f, stage: "flying" } : f))
        );
      });
    });

    // On completion (850ms match transition time)
    setTimeout(() => {
      setAnimatingFlyers((prev) => prev.filter((f) => f.id !== flyerId));
    }, 850);
  };

  const totalCartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const updateQuantity = (id, delta) => {
    setCartItems((prev) => {
      const updated = prev
        .map((item) => {
          if (String(item.id) === String(id)) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
      try {
        localStorage.setItem("thoranam_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("thoranam_cart_updated"));
      } catch (e) {}
      return updated;
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => String(item.id) !== String(id));
      try {
        localStorage.setItem("thoranam_cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("thoranam_cart_updated"));
      } catch (e) {}
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem("thoranam_cart");
      window.dispatchEvent(new Event("thoranam_cart_updated"));
    } catch (e) {}
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalCartCount,
        isMounted,
        addToCart,
        triggerAddToCartAnimation,
        badgeBump,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}

      {/* Fly to Cart Animation Overlay */}
      {animatingFlyers.map((flyer) => {
        const isFlying = flyer.stage === "flying";
        return (
          <div
            key={flyer.id}
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: `${isFlying ? flyer.endX : flyer.startX}px`,
              top: `${isFlying ? flyer.endY : flyer.startY}px`,
              transform: `translate(-50%, -50%) scale(${isFlying ? 0.2 : 1}) rotate(${
                isFlying ? 360 : 0
              }deg)`,
              opacity: isFlying ? 0.2 : 1,
              transition:
                "all 0.85s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.85s ease-in-out, opacity 0.85s ease-in",
            }}
          >
            <div className="w-16 h-20 rounded-lg overflow-hidden shadow-2xl border-2 border-white ring-2 ring-[#800F17]/40">
              <img
                src={flyer.image}
                alt="Flyer item"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/images/product-1.jpg";
                }}
              />
            </div>
          </div>
        );
      })}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cartItems: [],
      totalCartCount: 0,
      addToCart: () => [],
      triggerAddToCartAnimation: () => {},
      badgeBump: false,
      isCartOpen: false,
      setIsCartOpen: () => {},
      openCart: () => {},
      closeCart: () => {},
      updateQuantity: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
    };
  }
  return context;
}
