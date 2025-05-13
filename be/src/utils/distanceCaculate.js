/**
 * Calculates the great-circle distance between two points on Earth using the Haversine formula
 * 
 * @param {number} lat1 - Latitude of the first point in decimal degrees
 * @param {number} lon1 - Longitude of the first point in decimal degrees
 * @param {number} lat2 - Latitude of the second point in decimal degrees
 * @param {number} lon2 - Longitude of the second point in decimal degrees
 * @param {string} [unit='km'] - Unit of distance ('km' or 'miles')
 * @returns {number} Distance between the two points
 */
const calculateDistance = (lat1, lon1, lat2, lon2, unit = 'km') => {
    // Radius of the Earth in different units
    const radii = {
      km: 6371, // kilometers
      miles: 3959 // miles
    };
  
    // Convert latitude and longitude to radians
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);
  
    // Haversine formula
    const a = 
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    // Calculate distance
    const distance = radii[unit] * c;
  
    // Round to 2 decimal places
    return Number(distance.toFixed(2));
  };
  
  /**
   * Checks if a point is within a specified radius of a central point
   * 
   * @param {number} centerLat - Latitude of the central point
   * @param {number} centerLon - Longitude of the central point
   * @param {number} pointLat - Latitude of the point to check
   * @param {number} pointLon - Longitude of the point to check
   * @param {number} radiusKm - Radius in kilometers
   * @returns {boolean} Whether the point is within the specified radius
   */
  const isPointInRadius = (centerLat, centerLon, pointLat, pointLon, radiusKm) => {
    const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
    return distance <= radiusKm;
  };

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
module.exports = {
  calculateDistance,
  isPointInRadius,
  getDistanceFromLatLonInKm,
};