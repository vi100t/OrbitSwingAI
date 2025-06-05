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
  // Store animation values in a ref to persist across renders
  const animationValues = useRef(
    Array.from({ length: BUBBLE_COUNT }).map(() => ({
      position: new Animated.ValueXY({
        x: Math.random() * width,
        y: Math.random() * height,
      }),
      size: new Animated.Value(Math.random() * 100 + 50),
      opacity: new Animated.Value(Math.random() * 0.3 + 0.1),
    }))
  ).current;

  // Store mounted state in a ref
  const mounted = useRef(true);

  useEffect(() => {
    // Animation function
    const animateBubble = (index: number) => {
      if (!mounted.current) return;

      const newX = Math.random() * width;
      const newY = Math.random() * height;
      const duration = Math.random() * 15000 + 10000;

      Animated.parallel([
        Animated.timing(animationValues[index].position, {
          toValue: { x: newX, y: newY },
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(animationValues[index].opacity, {
          toValue: Math.random() * 0.3 + 0.1,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(animationValues[index].size, {
          toValue: Math.random() * 100 + 50,
          duration,
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (mounted.current) {
          animateBubble(index);
        }
      });
    };

    // Start animations
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      animateBubble(i);
    }

    // Cleanup
    return () => {
      mounted.current = false;
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
      
      {animationValues.map((anim, index) => (
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