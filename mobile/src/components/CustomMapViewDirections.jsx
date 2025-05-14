import React, { useState, useEffect } from "react";
import { Polyline } from "react-native-maps";
import axios from "axios";

const CustomMapViewDirections = ({
  origin,
  destination,
  onReady,
  strokeWidth = 3,
  strokeColor = "#4A90E2",
}) => {
  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    if (!origin || !destination) return;

    const getDirections = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

        const response = await axios.get(url);
        if (response.data.code === "Ok" && response.data.routes.length > 0) {
          const route = response.data.routes[0];

          // Convert coordinates from [longitude, latitude] to {latitude, longitude}
          const routeCoordinates = route.geometry.coordinates.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
          }));

          // Convert distance from meters to kilometers
          const routeDistance = route.distance / 1000;
          // Convert duration from seconds to minutes
          const routeDuration = route.duration / 60;

          setCoordinates(routeCoordinates);

          // Call onReady with route information
          onReady?.({
            coordinates: routeCoordinates,
            distance: routeDistance,
            duration: routeDuration,
          });
        } else {
          console.error("Error getting directions:", response.data.code);
        }
      } catch (error) {
        console.error("Error fetching directions:", error);
      }
    };

    getDirections();
  }, [origin?.latitude, origin?.longitude, destination?.latitude, destination?.longitude]);

  return (
    <Polyline
      coordinates={coordinates}
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}
      lineCap="round"
      lineJoin="round"
      geodesic={true}
    />
  );
};

export default CustomMapViewDirections;
