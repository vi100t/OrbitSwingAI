import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircleProgressProps {
  size: number;
  progress: number;
  trackColor: string;
  progressColor: string;
  textStyle?: TextStyle;
}

export const CircleProgress: React.FC<CircleProgressProps> = ({
  size,
  progress,
  trackColor,
  progressColor,
  textStyle,
}) => {
  // Constrain progress between 0 and 1
  const validProgress = Math.min(Math.max(progress, 0), 1);
  
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = validProgress * circumference;
  
  // Circle center coordinates
  const center = size / 2;
  
  // Text to display inside circle
  const textPercentage = Math.round(validProgress * 100) + '%';
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progressValue}
          // Starting point at the top
          strokeLinecap="round"
          rotation="-90"
          originX={center}
          originY={center}
        />
      </Svg>
      
      {/* Percentage text in the center */}
      <View style={styles.textContainer}>
        <Text style={[styles.text, textStyle]}>{textPercentage}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});