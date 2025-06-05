import React, { useState, useEffect, useMemo } from 'react';
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
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTasks } from '@/hooks/useSupabase';
import { Agenda } from 'react-native-calendars';
import dayjs from 'dayjs';
import TaskItem from '@/components/tasks/TaskItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CalendarScreen() {
  const { tasks, loading } = useTasks();
  const router = useRouter();

  // Memoize agenda items to prevent unnecessary re-renders
  const items = useMemo(() => {
    const agendaItems = {};
    tasks.forEach(task => {
      const date = dayjs(task.due_date).format('YYYY-MM-DD');
      if (!agendaItems[date]) {
        agendaItems[date] = [];
      }
      agendaItems[date].push(task);
    });
    return agendaItems;
  }, [tasks]);

  const renderItem = (item) => (
    <TaskItem
      task={item}
      onPress={() => router.push(`/tasks/${item.id}`)}
    />
  );

  const renderEmptyDate = () => (
    <View style={styles.emptyDate}>
      <Text style={styles.emptyDateText}>No tasks for this day</Text>
    </View>
  );

  if (loading) {
    return (
      <GlassBg>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Header title="Calendar" showVoice={true} />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading calendar...</Text>
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
          <Agenda
            items={items}
            renderItem={renderItem}
            renderEmptyDate={renderEmptyDate}
            showClosingKnob={false}
            theme={{
              agendaDayTextColor: Colors.text,
              agendaDayNumColor: Colors.text,
              agendaTodayColor: Colors.primary,
              agendaKnobColor: Colors.primary,
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
            style={styles.agenda}
          />
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
  agenda: {
    marginTop: 16,
  },
  emptyDate: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    marginVertical: 4,
  },
  emptyDateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.secondaryText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.secondaryText,
  },
});