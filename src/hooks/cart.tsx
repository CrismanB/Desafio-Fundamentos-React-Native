import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.removeItem('@GoMarketPlace');
      const allProducts = await AsyncStorage.getItem('@GoMarketPlace');
      if (allProducts) {
        setProducts(JSON.parse(allProducts));
      } else {
        [];
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productExists = products.find(item => item.id === product.id);

      if (productExists) {
        const productIncrementIfExist = products.map(_item => {
          const item = _item;
          if (item.id === product.id) {
            item.quantity += 1;
          }

          return item;
        });

        setProducts(productIncrementIfExist);
        return;
      }

      const newProduct = { ...product, quantity: 1 };

      setProducts([...products, newProduct]);

      await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.map(_item => {
        const item = _item;

        if (item.id === id) {
          item.quantity += 1;
        }
        return item;
      });

      setProducts(product);
      await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.map(_item => {
        const item = _item;

        if (item.id === id) {
          item.quantity <= 1 ? (item.quantity = 1) : (item.quantity -= 1);
        }
        return item;
      });

      setProducts(product);
      await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
