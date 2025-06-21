import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CameraGrid = () => {
  return (
    <View style={styles.gridOverlay}>
      <View style={styles.gridRow}>
        <View style={styles.gridLine} />
        <View style={styles.gridLine} />
      </View>
      <View style={styles.gridCol}>
        <View style={styles.gridLine} />
        <View style={styles.gridLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  gridRow: {
    width: '100%',
    height: SCREEN_WIDTH,
    justifyContent: 'space-around',
    position: 'absolute',
  },
  gridCol: {
    width: SCREEN_WIDTH,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
  },
  gridLine: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    margin: SCREEN_WIDTH / 3,
  },
});

export default CameraGrid; 