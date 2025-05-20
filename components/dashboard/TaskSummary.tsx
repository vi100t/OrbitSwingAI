import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import { CircleProgress } from '@/components/ui/CircleProgress';
import Colors from '@/constants/Colors';
import { ChevronRight } from 'lucide-react-native';

type Props = {
  completedTasks: number;
  totalTasks: number;
  onPress: () => void;
};

const TaskSummary: React.FC<Props> = ({ completedTasks, totalTasks, onPress }) => {
  const progress = totalTasks === 0 ? 0 : completedTasks / totalTasks;
  const percentage = Math.round(progress * 100);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard style={styles.card}>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Today's Tasks</Text>
            <Text style={styles.subtitle}>
              {completedTasks} of {totalTasks} tasks completed
            </Text>
            <View style={styles.viewButton}>
              <Text style={styles.viewText}>View Tasks</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </View>
          </View>
          <View style={styles.progressContainer}>
            <CircleProgress 
              size={80} 
              progress={progress} 
              trackColor={Platform.OS === 'web' ? 'rgba(124, 77, 255, 0.2)' : Colors.primaryLight}
              progressColor={Colors.primary}
              textStyle={styles.progressText}
            />
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 16,
  },
  progressContainer: {
    marginLeft: 20,
  },
  progressText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.primary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
});

export default TaskSummary;