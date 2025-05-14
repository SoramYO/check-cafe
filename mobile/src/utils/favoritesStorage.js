import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@favorites";

export const getFavoriteShops = async () => {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
};

export const toggleFavorite = async (shop) => {
  try {
    const favorites = await getFavoriteShops();
    const isFavorite = favorites.some((fav) => fav._id === shop._id);

    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((fav) => fav._id !== shop._id);
    } else {
      newFavorites = [shop, ...favorites];
    }

    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    return newFavorites;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};