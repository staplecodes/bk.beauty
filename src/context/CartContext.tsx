import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemsCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bk_cart_v2');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (item: any) =>
            item &&
            typeof item.productId === 'string' &&
            item.product &&
            typeof item.product.id === 'string' &&
            item.product.id === item.productId &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
        )
        .map((item: any) => ({
          productId: item.productId,
          product: { ...item.product },
          variantId: typeof item.variantId === 'string' ? item.variantId : undefined,
          variant: item.variant && typeof item.variant.id === 'string' ? { ...item.variant } : undefined,
          quantity: item.quantity,
        }));
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('bk_cart_v2', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addItem = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === variant?.id
      );

      if (existingIdx > -1) {
        const next = [...prev];
        const existing = next[existingIdx];
        const newQty = existing.quantity + quantity;
        // Limit to available stock
        const maxStock = variant ? variant.stockQuantity : product.stockQuantity;
        next[existingIdx] = {
          ...existing,
          quantity: Math.min(newQty, maxStock),
        };
        return next;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product: { ...product },
            variantId: variant?.id,
            variant: variant ? { ...variant } : undefined,
            quantity: Math.max(1, quantity),
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          const maxStock = item.variant
            ? item.variant.stockQuantity
            : item.product.stockQuantity;
          return {
            ...item,
            quantity: Math.min(quantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemsCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
