import React, { createContext, useContext, useState, useEffect } from 'react';
import userPackageAPI from '../services/userPackageAPI';

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
      // Nếu không force refresh và đã check trong 30 giây gần đây, skip
      if (!forceRefresh && lastChecked && (Date.now() - lastChecked) < 30000) {
        return isPremium;
      }

      setLoading(true);
      const response = await userPackageAPI.HandleUserPackage('/my-packages');
      const activePackage = response.data.find(pkg => pkg.status === 'active');
      
      let newPremiumStatus = false;
      if (activePackage) {
        const endDate = new Date(activePackage.end_date);
        const now = new Date();
        newPremiumStatus = endDate > now;
      }

      // Chỉ cập nhật nếu status thay đổi
      if (newPremiumStatus !== isPremium) {
        setIsPremium(newPremiumStatus);
      }

      setLastChecked(Date.now());
      return newPremiumStatus;
    } catch (error) {
      console.error('Error checking premium status:', error);
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