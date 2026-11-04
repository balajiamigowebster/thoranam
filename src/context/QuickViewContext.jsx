"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState(null);

  const openQuickView = useCallback((productData) => {
    if (!productData) return;
    setProduct(productData);
    setIsOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <QuickViewContext.Provider
      value={{
        isOpen,
        product,
        openQuickView,
        closeQuickView,
      }}
    >
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  return context || {
    isOpen: false,
    product: null,
    openQuickView: () => {},
    closeQuickView: () => {},
  };
}

