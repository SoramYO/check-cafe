import React, { createContext, useContext, useState, useEffect } from 'react';
import userPackageAPI from '../services/userPackageAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PremiumContext = createContext();

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const checkPremiumStatus = async (forceRefresh = false) => {
    try {
      // Kiểm tra user đã đăng nhập chưa
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        console.log('User not authenticated, skipping premium check');
        setIsPremium(false);
        setLoading(false);
        return false;
      }

      // Nếu không force refresh và đã check trong 30 giây gần đây, skip
      if (!forceRefresh && lastChecked && (Date.now() - lastChecked) < 30000) {
        return isPremium;
      }

      setLoading(true);
      const response = await userPackageAPI.HandleUserPackage('/my-packages');
      console.log('Premium API response:', response);
      
      // Backend trả về { data: result }, nên truy cập response.data
      const packages = response.data || [];
      console.log('Packages found:', packages);
      
      const activePackage = packages.find(pkg => pkg.status === 'active');
      console.log('Active package:', activePackage);
      
      let newPremiumStatus = false;
      if (activePackage) {
        const endDate = new Date(activePackage.end_date);
        const now = new Date();
        newPremiumStatus = endDate > now;
        console.log('Package end date:', endDate, 'Current time:', now, 'Is premium:', newPremiumStatus);
      }

      // Chỉ cập nhật nếu status thay đổi
      if (newPremiumStatus !== isPremium) {
        setIsPremium(newPremiumStatus);
        console.log('Premium status updated to:', newPremiumStatus);
      }

      setLastChecked(Date.now());
      return newPremiumStatus;
    } catch (error) {
      console.error('Error checking premium status:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Nếu lỗi 401/403, user chưa đăng nhập hoặc token hết hạn
      if (error.response?.status === 401 || error.response?.status === 403) {
        setIsPremium(false);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshPremiumStatus = async () => {
    return await checkPremiumStatus(true);
  };

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const value = {
    isPremium,
    loading,
    checkPremiumStatus,
    refreshPremiumStatus,
    lastChecked,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}; 