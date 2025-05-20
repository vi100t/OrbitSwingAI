import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import { Flame } from 'lucide-react-native';

type Props = {
  title: string;
  streak: number;
  color: string;
  onPress: () => void;
};

const HabitStreak: React.FC<Props> = ({ title, streak, color, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard style={[styles.card, { borderColor: color }]}>
        <View style={styles.container}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.streakContainer}>
            <Flame size={20} color={streak > 0 ? '#FF9800' : Colors.secondaryText} fill={streak > 0 ? '#FF9800' : 'transparent'} />
            <Text style={[styles.streakText, { color: streak > 0 ? Colors.text : Colors.secondaryText }]}>
              {streak}
            </Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 8,
    width: 140,
    height: 90,
    borderLeftWidth: 3,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 4,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginLeft: 4,
  },
});

export default HabitStreak;