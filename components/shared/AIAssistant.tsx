import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import { Sparkles, X, Check } from 'lucide-react-native';

type Props = {
  suggestion: string;
  onAccept: () => void;
  onDismiss: () => void;
};

const AIAssistant: React.FC<Props> = ({ suggestion, onAccept, onDismiss }) => {
  const [animation] = useState(new Animated.Value(1));
  
  const handleDismiss = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Sparkles size={16} color={Colors.primary} />
            <Text style={styles.title}>AI Assistant</Text>
          </View>
          <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
            <X size={18} color={Colors.secondaryText} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.suggestion}>{suggestion}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleDismiss} style={[styles.button, styles.dismissButton]}>
            <X size={16} color={Colors.secondaryText} />
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onAccept} style={[styles.button, styles.acceptButton]}>
            <Check size={16} color="white" />
            <Text style={styles.acceptText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 6,
  },
  closeButton: {
    padding: 4,
  },
  suggestion: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  dismissButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  dismissText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.secondaryText,
    marginLeft: 6,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
  },
  acceptText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: 'white',
    marginLeft: 6,
  },
});

export default AIAssistant;