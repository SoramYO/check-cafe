import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          timestamp: currentLocation.timestamp,
        });
      } catch (error) {
        setErrorMsg('Error getting location: ' + error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateLocation = async () => {
    try {
      setLoading(true);
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: currentLocation.timestamp,
      });
    } catch (error) {
      setErrorMsg('Error updating location: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocationContext.Provider value={{ location, errorMsg, loading, updateLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}; 