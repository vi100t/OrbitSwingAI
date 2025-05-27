import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import {
  SquareCheck as CheckSquare,
  Timer,
  SquareStack,
  Calendar,
} from 'lucide-react-native';

const QuickActions: React.FC = () => {
  const router = useRouter();

  const actions = [
    {
      icon: <CheckSquare size={24} color={Colors.primary} />,
      label: 'New Task',
      onPress: () => router.push('/tasks/new'),
    },
    {
      icon: <Timer size={24} color="#E91E63" />,
      label: 'Pomodoro',
      onPress: () => router.push('/pomodoro'),
    },
    {
      icon: <SquareStack size={24} color="#009688" />,
      label: 'Eisenhower',
      onPress: () => router.push('/eisenhower'),
    },
    {
      icon: <Calendar size={24} color="#FF9800" />,
      label: 'Calendar',
      onPress: () => router.push('/calendar'),
    },
  ];

  return (
    <GlassCard style={styles.card}>
      <View style={styles.container}>
        {actions.map((action, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={action.onPress}
          >
            <View style={styles.actionIcon}>{action.icon}</View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  actionButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.text,
  },
});

export default QuickActions;
