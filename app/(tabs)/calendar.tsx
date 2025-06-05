import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useTasks } from '@/hooks/useSupabase';
import dayjs from 'dayjs';
import TaskItem from '@/components/tasks/TaskItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Generate time slots for the day
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({
      hour,
      label: dayjs().hour(hour).format('h:mm A'),
    });
  }
  return slots;
};

export default function CalendarScreen() {
  const { tasks, loading } = useTasks();
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format('YYYY-MM-DD')
  );
  const router = useRouter();
  const timeSlots = generateTimeSlots();

  console.log('Tasks:', tasks); // Debug log

  // Create marked dates object for calendar
  const markedDates = tasks.reduce((acc, task) => {
    // Format the date to YYYY-MM-DD
    const date = dayjs(task.due_date).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = {
        marked: true,
        dotColor: getPriorityColor(task.priority),
      };
    }
    return acc;
  }, {} as Record<string, { marked: boolean; dotColor: string; selected?: boolean; selectedColor?: string }>);

  console.log('Marked Dates:', markedDates); // Debug log

  // Add selected date to marked dates
  if (markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: Colors.primary,
    };
  } else {
    markedDates[selectedDate] = {
      marked: false,
      dotColor: Colors.primary,
      selected: true,
      selectedColor: Colors.primary,
    };
  }

  // Filter tasks for selected date
  const selectedDateTasks = tasks.filter((task) => {
    const taskDate = dayjs(task.due_date).format('YYYY-MM-DD');
    return taskDate === selectedDate;
  });

  // Group tasks by hour
  const tasksByHour = timeSlots.reduce((acc, slot) => {
    const tasksInSlot = selectedDateTasks.filter((task) => {
      if (!task.due_time) return false;
      const taskHour = dayjs(task.due_time, 'HH:mm:ss').hour();
      return taskHour === slot.hour;
    });
    acc[slot.hour] = tasksInSlot;
    return acc;
  }, {} as Record<number, typeof selectedDateTasks>);

  // Get tasks without time
  const tasksWithoutTime = selectedDateTasks.filter((task) => !task.due_time);

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      default:
        return Colors.info;
    }
  }

  if (loading) {
    return (
      <GlassBg>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Header title="Calendar" showVoice={true} />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        </SafeAreaView>
      </GlassBg>
    );
  }

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="Calendar"
          showVoice={true}
          rightComponent={
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/tasks/new')}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          }
        />

        <View style={styles.contentContainer}>
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: Colors.text,
                selectedDayBackgroundColor: Colors.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: Colors.primary,
                dayTextColor: Colors.text,
                textDisabledColor: Colors.secondaryText,
                dotColor: Colors.primary,
                selectedDotColor: '#ffffff',
                arrowColor: Colors.primary,
                monthTextColor: Colors.text,
                indicatorColor: Colors.primary,
                textDayFontFamily: 'Inter-Regular',
                textMonthFontFamily: 'Poppins-Medium',
                textDayHeaderFontFamily: 'Inter-Medium',
              }}
            />
          </View>

          <View style={styles.tasksContainer}>
            <View style={styles.tasksHeader}>
              <Text style={styles.tasksTitle}>
                {dayjs(selectedDate).format('MMMM D, YYYY')}
              </Text>
              <Text style={styles.tasksCount}>
                {selectedDateTasks.length} task
                {selectedDateTasks.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <ScrollView
              style={styles.tasksList}
              showsVerticalScrollIndicator={false}
            >
              {selectedDateTasks.length > 0 ? (
                <>
                  {timeSlots.map((slot) => {
                    const tasksInSlot = tasksByHour[slot.hour] || [];
                    if (tasksInSlot.length === 0) return null;

                    return (
                      <View key={slot.hour} style={styles.timeSlot}>
                        <View style={styles.timeHeader}>
                          <Clock size={16} color={Colors.secondaryText} />
                          <Text style={styles.timeLabel}>{slot.label}</Text>
                        </View>
                        {tasksInSlot.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onPress={() => router.push(`/tasks/${task.id}`)}
                          />
                        ))}
                      </View>
                    );
                  })}

                  {tasksWithoutTime.length > 0 && (
                    <View style={styles.timeSlot}>
                      <View style={styles.timeHeader}>
                        <Text style={styles.timeLabel}>No Time Set</Text>
                      </View>
                      {tasksWithoutTime.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onPress={() => router.push(`/tasks/${task.id}`)}
                        />
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <CalendarIcon
                    size={48}
                    color={Colors.secondaryText}
                    style={styles.emptyIcon}
                  />
                  <Text style={styles.emptyText}>No tasks for this day</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </GlassBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tasksContainer: {
    flex: 1,
    marginTop: 24,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tasksTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: Colors.text,
  },
  tasksCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.secondaryText,
  },
  tasksList: {
    flex: 1,
  },
  timeSlot: {
    marginBottom: 16,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  timeLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.secondaryText,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.secondaryText,
    marginBottom: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.secondaryText,
  },
});
