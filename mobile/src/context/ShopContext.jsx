import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShopContext = createContext();
const SHOP_STORAGE_KEY = '@shop_data';

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const [shopData, setShopData] = useState({
    shopId: null,
    shopName: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load facility data from AsyncStorage when app starts
  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(SHOP_STORAGE_KEY);
      if (storedData) {
        setShopData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateShopData = async (data) => {
    try {
      const newData = {
        ...shopData,
        ...data
      };
      setShopData(newData);
      await AsyncStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Error saving shop data:', error);
    }
  };

  const clearShopData = async () => {
    try {
      const emptyData = {
        shopId: null,
        shopName: '',
      };
      setShopData(emptyData);
      await AsyncStorage.removeItem(SHOP_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing shop data:', error);
    }
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <ShopContext.Provider 
      value={{ 
        ...shopData, 
        updateShopData,
        clearShopData
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}; 