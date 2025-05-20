import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as RNCalendar, CalendarProps } from 'react-native-calendars';
import Colors from '@/constants/Colors';
import GlassBg from '@/components/ui/GlassBg';
import GlassCard from '@/components/ui/GlassCard';
import { useStore } from '@/store';
import Header from '@/components/shared/Header';
import dayjs from 'dayjs';
import DaySchedule from '@/components/calendar/DaySchedule';

type DayObject = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

export default function CalendarScreen() {
  const { tasks } = useStore();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  // Function to prepare calendar marked dates
  const getMarkedDates = () => {
    const markedDates: Record<string, any> = {};
    
    // Add a dot for each day with tasks
    tasks.forEach(task => {
      const dateStr = dayjs(task.dueDate).format('YYYY-MM-DD');
      
      if (!markedDates[dateStr]) {
        markedDates[dateStr] = { dots: [] };
      }
      
      // Add a dot based on priority
      const dotColor = task.priority === 'high' ? Colors.error : 
                       task.priority === 'medium' ? Colors.warning : 
                       Colors.info;
      
      // Limit to 3 dots per date to avoid overflow
      if (markedDates[dateStr].dots.length < 3) {
        markedDates[dateStr].dots.push({
          key: task.id,
          color: dotColor,
        });
      }
    });
    
    // Highlight selected date
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: Colors.primary,
    };
    
    return markedDates;
  };

  const handleDayPress = (day: DayObject) => {
    setSelectedDate(day.dateString);
  };

  // Get tasks for selected date
  const selectedTasks = tasks.filter(task => 
    dayjs(task.dueDate).format('YYYY-MM-DD') === selectedDate
  );

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Calendar" />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.calendarCard}>
            <RNCalendar
              theme={{
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
                textMonthFontFamily: 'Poppins-SemiBold',
                textDayHeaderFontFamily: 'Inter-Medium',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12,
              }}
              markingType="multi-dot"
              markedDates={getMarkedDates()}
              onDayPress={handleDayPress}
              enableSwipeMonths={true}
            />
          </GlassCard>
          
          <View style={styles.scheduleContainer}>
            <Text style={styles.dateTitle}>
              {dayjs(selectedDate).format('dddd, MMMM D')}
            </Text>
            
            <DaySchedule 
              tasks={selectedTasks}
              date={selectedDate}
            />
          </View>
          
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </GlassBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarCard: {
    marginTop: 16,
  },
  scheduleContainer: {
    marginTop: 24,
  },
  dateTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  spacer: {
    height: 100,
  },
});