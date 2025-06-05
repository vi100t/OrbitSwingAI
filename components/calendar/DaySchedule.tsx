import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Task } from '@/types/task';
import { Habit } from '@/types/habit';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { Calendar, Clock, CheckSquare, Square } from 'lucide-react-native';

type Props = {
  tasks: Task[];
  habits: Habit[];
  date: string;
};

const HOUR_HEIGHT = 60;
const WORK_HOURS = 12; // 8 AM to 8 PM

const DaySchedule: React.FC<Props> = ({ tasks, habits, date }) => {
  const router = useRouter();

  console.log(
    'DaySchedule received tasks:',
    tasks.map((task) => ({
      id: task.id,
      title: task.title,
      due_date: task.due_date,
      due_time: task.due_time,
      is_completed: task.is_completed,
    }))
  );
  console.log(
    'DaySchedule received habits:',
    habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      completions: habit.completions,
    }))
  );
  console.log('DaySchedule date:', date);

  const itemsByHour: Record<number, Array<Task | Habit>> = {};

  // Group tasks by hour
  tasks.forEach((task) => {
    console.log('Processing task:', {
      id: task.id,
      title: task.title,
      due_date: task.due_date,
      due_time: task.due_time,
      is_completed: task.is_completed,
    });
    const hour = task.due_time ? dayjs(task.due_time, 'HH:mm:ss').hour() : 9; // Default to 9 AM
    console.log('Task hour:', hour);

    if (!itemsByHour[hour]) {
      itemsByHour[hour] = [];
    }

    itemsByHour[hour].push(task);
  });

  // Group habits by hour
  habits.forEach((habit) => {
    const hour = habit.timeOfDay
      ? dayjs(habit.timeOfDay, 'HH:mm:ss').hour()
      : 9; // Default to 9 AM

    if (!itemsByHour[hour]) {
      itemsByHour[hour] = [];
    }

    itemsByHour[hour].push(habit);
  });

  console.log(
    'Items by hour:',
    Object.entries(itemsByHour).map(([hour, items]) => ({
      hour,
      items: items.map((item) => ({
        id: item.id,
        title: 'title' in item ? item.title : item.name,
        type: 'title' in item ? 'task' : 'habit',
        time: 'due_time' in item ? item.due_time : item.timeOfDay,
      })),
    }))
  );

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

          {/* Items in this time slot */}
          <View style={styles.itemsContainer}>
            {itemsByHour[i]?.map((item) => {
              const isTask = 'due_date' in item;
              const isCompleted = isTask
                ? (item as Task).is_completed
                : (item as Habit).completions?.some(
                    (c) =>
                      dayjs(c.date).format('YYYY-MM-DD') === date && c.completed
                  ) ?? false;

              return (
                <TouchableOpacity
                  key={
                    isTask ? (item as Task).id : `habit-${(item as Habit).id}`
                  }
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: isTask
                        ? getPriorityColor((item as Task).priority, 0.15)
                        : `${(item as Habit).color}15`,
                    },
                    {
                      borderLeftColor: isTask
                        ? getPriorityColor((item as Task).priority, 1)
                        : (item as Habit).color,
                    },
                  ]}
                  onPress={() => {
                    if (isTask) {
                      router.push(`/tasks/${(item as Task).id}`);
                    } else {
                      // Handle habit press
                      console.log('Habit pressed:', (item as Habit).id);
                    }
                  }}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {isTask ? (item as Task).title : (item as Habit).name}
                    </Text>
                    {isCompleted ? (
                      <CheckSquare size={16} color={Colors.primary} />
                    ) : (
                      <Square size={16} color={Colors.secondaryText} />
                    )}
                  </View>
                  {isTask && (item as Task).description && (
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {(item as Task).description}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }

    return slots;
  };

  if (tasks.length === 0 && habits.length === 0) {
    return (
      <GlassCard style={styles.emptyCard}>
        <Text style={styles.emptyText}>No items scheduled for this day</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/tasks/new')}
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
  itemsContainer: {
    flex: 1,
    marginLeft: 16,
    paddingRight: 8,
  },
  itemCard: {
    borderLeftWidth: 3,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  itemDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 4,
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
