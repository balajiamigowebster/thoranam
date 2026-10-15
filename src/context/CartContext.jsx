"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const DEFAULT_INITIAL_ITEM = [
  {
    id: "default-item",
    title: "Verdant Ikat – Bamboo Cotton Silk Saree",
    price: "Rs. 1,500.00",
    quantity: 1,
    mainImage: "/images/product-1.jpg",
  },
];

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("thoranam_cart");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error("Cart localStorage error:", e);
      }
    }
    return DEFAULT_INITIAL_ITEM;
  });
  const [animatingFlyers, setAnimatingFlyers] = useState([]);
  const [badgeBump, setBadgeBump] = useState(false);

  const saveCart = (items) => {
    setCartItems(items);
    try {
      localStorage.setItem("thoranam_cart", JSON.stringify(items));
    } catch (e) {}
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
    const cartTarget = document.getElementById("header-cart-icon-btn") ||
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

    // On completion (900ms match transition time)
    setTimeout(() => {
      // Remove flyer
      setAnimatingFlyers((prev) => prev.filter((f) => f.id !== flyerId));

      // Bump badge & shake cart
      setBadgeBump(true);
      setTimeout(() => setBadgeBump(false), 900);

      // Add item to cart state
      setCartItems((prev) => {
        const existingIdx = prev.findIndex((p) => p.id === item.id);
        let updated;
        if (existingIdx > -1) {
          updated = prev.map((p, idx) =>
            idx === existingIdx
              ? { ...p, quantity: (p.quantity || 1) + quantity }
              : p
          );
        } else {
          updated = [...prev, { ...item, quantity }];
        }
        try {
          localStorage.setItem("thoranam_cart", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
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
          if (item.id === id) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
      try {
        localStorage.setItem("thoranam_cart", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("thoranam_cart", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem("thoranam_cart");
    } catch (e) {}
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalCartCount,
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
                "left 850ms cubic-bezier(0.2, 0.8, 0.2, 1), top 850ms cubic-bezier(0.5, 0, 0.7, 1), transform 850ms cubic-bezier(0.25, 1, 0.5, 1), opacity 850ms ease-in",
            }}
          >
            {/* Elegant glowing container & luxury saree image */}
            <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(128,15,23,0.45)] border-2 border-amber-300 ring-4 ring-[#800F17]/20 bg-white">
              <img
                src={flyer.image || "/images/product-1.jpg"}
                alt="Adding to cart"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/images/product-1.jpg";
                }}
              />
              {/* Golden luxury particle burst */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 to-transparent mix-blend-overlay pointer-events-none" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-ping" />
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
