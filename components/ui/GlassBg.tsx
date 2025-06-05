import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

const BUBBLE_COUNT = 6;
const { width, height } = Dimensions.get('window');

type Props = {
  children: React.ReactNode;
};

const GlassBg: React.FC<Props> = ({ children }) => {
  // Create a single ref for all animation-related state
  const animationState = useRef({
    values: Array.from({ length: BUBBLE_COUNT }).map(() => ({
      position: new Animated.ValueXY({
        x: Math.random() * width,
        y: Math.random() * height,
      }),
      size: new Animated.Value(Math.random() * 100 + 50),
      opacity: new Animated.Value(Math.random() * 0.3 + 0.1),
    })),
    mounted: true,
    animations: [] as Animated.CompositeAnimation[],
  }).current;

  useEffect(() => {
    const startBubbleAnimation = (index: number) => {
      if (!animationState.mounted) return;

      const newX = Math.random() * width;
      const newY = Math.random() * height;
      const duration = Math.random() * 15000 + 10000;

      const animation = Animated.parallel([
        Animated.timing(animationState.values[index].position, {
          toValue: { x: newX, y: newY },
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(animationState.values[index].opacity, {
          toValue: Math.random() * 0.3 + 0.1,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(animationState.values[index].size, {
          toValue: Math.random() * 100 + 50,
          duration,
          useNativeDriver: false,
        }),
      ]);

      animation.start(() => {
        if (animationState.mounted) {
          startBubbleAnimation(index);
        }
      });

      animationState.animations.push(animation);
    };

    // Start animations
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      startBubbleAnimation(i);
    }

    return () => {
      animationState.mounted = false;
      // Stop all running animations
      animationState.animations.forEach(animation => animation.stop());
      animationState.animations = [];
    };
  }, []);

  const getBubbleColor = (index: number) => {
    const colors = [
      Colors.bubble1,
      Colors.bubble2,
      Colors.bubble3,
      Colors.bubble4,
      Colors.bubble5,
      Colors.bubble6,
    ];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8f9ff', '#e8eaff']}
        style={styles.gradient}
      />
      
      {animationState.values.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bubble,
            {
              left: anim.position.x,
              top: anim.position.y,
              width: anim.size,
              height: anim.size,
              opacity: anim.opacity,
              backgroundColor: getBubbleColor(index),
            },
          ]}
        />
      ))}
      
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 100,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default GlassBg;