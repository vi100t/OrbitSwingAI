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
import { Plus, Calendar as CalendarIcon, List } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useTasks } from '@/hooks/useSupabase';
import dayjs from 'dayjs';
import TaskItem from '@/components/tasks/TaskItem';
import DaySchedule from '@/components/calendar/DaySchedule';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CalendarScreen() {
  const { tasks, loading } = useTasks();
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format('YYYY-MM-DD')
  );
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const router = useRouter();

  // Create marked dates object for calendar
  const markedDates = tasks.reduce((acc, task) => {
    const date = dayjs(task.due_date).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = {
        marked: true,
        dotColor: getPriorityColor(task.priority),
      };
    }
    return acc;
  }, {} as Record<string, { marked: boolean; dotColor: string; selected?: boolean; selectedColor?: string }>);

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
      selected: true,
      selectedColor: Colors.primary,
    };
  }

  // Filter tasks for selected date
  const selectedDateTasks = tasks.filter((task) => {
    const taskDate = dayjs(task.due_date).format('YYYY-MM-DD');
    return taskDate === selectedDate;
  });

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
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/tasks/new')}
              >
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          }
        />

        <View style={styles.contentContainer}>
          {viewMode === 'calendar' ? (
            <>
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
                    selectedDateTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onPress={() => router.push(`/tasks/${task.id}`)}
                      />
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <CalendarIcon
                        size={48}
                        color={Colors.secondaryText}
                        style={styles.emptyIcon}
                      />
                      <Text style={styles.emptyText}>
                        No tasks for this day
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </>
          ) : (
            <DaySchedule
              tasks={selectedDateTasks}
              habits={[]}
              date={selectedDate}
            />
          )}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
