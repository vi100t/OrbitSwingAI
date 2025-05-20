import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Task } from '@/types/task';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';

type Props = {
  tasks: Task[];
  date: string;
};

const HOUR_HEIGHT = 60;
const WORK_HOURS = 12; // 8 AM to 8 PM

const DaySchedule: React.FC<Props> = ({ tasks, date }) => {
  const router = useRouter();
  
  const tasksByHour: Record<number, Task[]> = {};
  
  // Group tasks by hour
  tasks.forEach(task => {
    const hour = task.dueTime ? new Date(task.dueTime).getHours() : 9; // Default to 9 AM
    
    if (!tasksByHour[hour]) {
      tasksByHour[hour] = [];
    }
    
    tasksByHour[hour].push(task);
  });
  
  const renderTimeSlots = () => {
    const slots = [];
    
    for (let i = 8; i < 8 + WORK_HOURS; i++) {
      // Format hour in 12-hour format
      const formattedHour = i % 12 === 0 ? 12 : i % 12;
      const amPm = i < 12 ? 'AM' : 'PM';
      
      slots.push(
        <View key={`hour-${i}`} style={styles.timeSlot}>
          <Text style={styles.timeText}>{`${formattedHour} ${amPm}`}</Text>
          <View style={styles.slotLine} />
          
          {/* Tasks in this time slot */}
          <View style={styles.tasksContainer}>
            {tasksByHour[i]?.map(task => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskItem,
                  { backgroundColor: getPriorityColor(task.priority, 0.15) },
                  { borderLeftColor: getPriorityColor(task.priority, 1) },
                ]}
                onPress={() => router.push(`/tasks/${task.id}`)}
              >
                <Text style={styles.taskTitle} numberOfLines={1}>
                  {task.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    
    return slots;
  };
  
  if (tasks.length === 0) {
    return (
      <GlassCard style={styles.emptyCard}>
        <Text style={styles.emptyText}>No tasks scheduled for this day</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/tasks/create')}
        >
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </GlassCard>
    );
  }
  
  return (
    <GlassCard style={styles.card}>
      <View style={[styles.schedule, { height: WORK_HOURS * HOUR_HEIGHT }]}>
        {renderTimeSlots()}
      </View>
    </GlassCard>
  );
};

const getPriorityColor = (priority: string, opacity: number = 1) => {
  switch (priority) {
    case 'high':
      return `rgba(244, 67, 54, ${opacity})`;
    case 'medium':
      return `rgba(255, 152, 0, ${opacity})`;
    default:
      return `rgba(33, 150, 243, ${opacity})`;
  }
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  schedule: {
    position: 'relative',
  },
  timeSlot: {
    position: 'relative',
    height: HOUR_HEIGHT,
    flexDirection: 'row',
  },
  timeText: {
    width: 60,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: -8,
    textAlign: 'center',
  },
  slotLine: {
    position: 'absolute',
    left: 70,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  tasksContainer: {
    flex: 1,
    marginLeft: 16,
    paddingRight: 8,
  },
  taskItem: {
    borderLeftWidth: 3,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  taskTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.text,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
});

export default DaySchedule;