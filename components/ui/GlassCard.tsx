import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
};

const GlassCard: React.FC<Props> = ({ children, style, intensity = 50 }) => {
  // On web, we'll use a div with backdrop-filter
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.webGlass}>{children}</View>
      </View>
    );
  }

  // On native platforms, use BlurView
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.glassShadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    backgroundColor: 'transparent',
  },
  blur: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    flex: 1,
    padding: 16,
    borderColor: Colors.glassBorder,
    borderWidth: 1,
    borderRadius: 16,
  },
  webGlass: {
    width: '100%',
    height: '100%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    borderColor: Colors.glassBorder,
    borderWidth: 1,
  },
});

export default GlassCard;