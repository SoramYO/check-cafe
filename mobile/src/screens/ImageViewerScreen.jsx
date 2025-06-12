import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Text,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ImageViewerScreen({ route }) {
  const navigation = useNavigation();
  const { imageUrl, title, userName } = route.params;
  
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  
  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startScale = scale.value;
    },
    onActive: (event, context) => {
      scale.value = Math.max(1, Math.min(context.startScale * event.scale, 3));
    },
    onEnd: () => {
      if (scale.value < 1.2) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        message: title ? `Check-in: ${title}` : 'Check-in từ CheckCafe',
        url: imageUrl,
      };
      await Share.share(shareContent);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const resetZoom = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={!isControlsVisible} />
      
      {/* Header */}
      {isControlsVisible && (
        <SafeAreaView style={styles.header} edges={['top']}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            {userName && (
              <Text style={styles.headerTitle} numberOfLines={1}>
                {userName}
              </Text>
            )}
            {title && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {title}
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShare}
          >
            <MaterialCommunityIcons name="share" size={24} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {/* Image */}
      <PinchGestureHandler onGestureEvent={pinchHandler}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <TouchableOpacity
            style={styles.imageTouchable}
            activeOpacity={1}
            onPress={toggleControls}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>
      </PinchGestureHandler>

      {/* Bottom Controls */}
      {isControlsVisible && (
        <View style={styles.bottomControls}>
          {/* <TouchableOpacity
            style={styles.controlButton}
            onPress={resetZoom}
          >
            <MaterialCommunityIcons name="fit-to-screen" size={24} color="white" />
            <Text style={styles.controlButtonText}>Fit</Text>
          </TouchableOpacity> */}
          
          {/* <TouchableOpacity
            style={styles.controlButton}
            onPress={handleShare}
          >
            <MaterialCommunityIcons name="share-variant" size={24} color="white" />
            <Text style={styles.controlButtonText}>Chia sẻ</Text>
          </TouchableOpacity> */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTouchable: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlButton: {
    alignItems: 'center',
    gap: 4,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 12,
  },
}); 