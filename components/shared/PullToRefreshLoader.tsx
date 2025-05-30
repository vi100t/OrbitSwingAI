import React from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import Colors from '@/constants/Colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PullToRefreshLoaderProps {
  pullDistance: Animated.Value;
}

export default function PullToRefreshLoader({
  pullDistance,
}: PullToRefreshLoaderProps) {
  const loaderTranslateY = pullDistance.interpolate({
    inputRange: [-100, 0],
    outputRange: [SCREEN_HEIGHT / 3, -150],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.loaderContainer,
        {
          transform: [{ translateY: loaderTranslateY }],
        },
      ]}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
});
