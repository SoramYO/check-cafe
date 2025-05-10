import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface ActionButtonsProps {
  cafeId: string;
  cafeName: string;
  cafeAddress: string;
  isFavorite: boolean;
  onFavoritePress: (isFavorite: boolean) => void;
  onCheckInPress: () => void;
  onDirectionsPress: () => void;
  onWebsitePress?: () => void;
  onPhonePress?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  cafeId,
  cafeName,
  cafeAddress,
  isFavorite,
  onFavoritePress,
  onCheckInPress,
  onDirectionsPress,
  onWebsitePress,
  onPhonePress,
}) => {
  const { colors } = useTheme();

  const handleSharePress = async () => {
    try {
      const result = await Share.share({
        message: `Check out ${cafeName} at ${cafeAddress}!`,
        url: `https://checkcafe.app/cafe/${cafeId}`,
        title: `Check Cafe - ${cafeName}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.buttonRow}>
        <ActionButton
          icon="heart"
          label={isFavorite ? "Favorited" : "Favorite"}
          onPress={() => onFavoritePress(!isFavorite)}
          isActive={isFavorite}
        />
        <ActionButton
          icon="map-marker"
          label="Check In"
          onPress={onCheckInPress}
        />
        <ActionButton
          icon="compass"
          label="Directions"
          onPress={onDirectionsPress}
        />
        <ActionButton
          icon="share"
          label="Share"
          onPress={handleSharePress}
        />
      </View>

      {(onWebsitePress || onPhonePress) && (
        <View style={styles.secondaryButtonsContainer}>
          {onWebsitePress && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onWebsitePress}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Visit Website
              </ThemedText>
            </TouchableOpacity>
          )}
          
          {onPhonePress && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onPhonePress}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Call Cafe
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ThemedView>
  );
};

interface ActionButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  isActive?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  isActive = false,
}) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        isActive && { backgroundColor: '#ff7675' }
      ]}>
        <MaterialCommunityIcons 
          name={icon} 
          size={24} 
          color={isActive ? '#fff' : colors.text} 
        />
      </View>
      <ThemedText style={[
        styles.buttonLabel,
        isActive && { color: '#ff7675' }
      ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  buttonLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  secondaryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    fontSize: 14,
  },
});

export default ActionButtons; 
