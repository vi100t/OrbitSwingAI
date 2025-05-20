import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import { useStore } from '@/store';

const DAYS_IN_WEEK = 7;
const WEEKS_TO_SHOW = 4;

const HeatmapView: React.FC = () => {
  const { getActivityForDate } = useStore();
  
  // Generate dates for the heatmap (last 4 weeks)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    // Start from 4 weeks ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (DAYS_IN_WEEK * WEEKS_TO_SHOW - 1));
    
    for (let i = 0; i < DAYS_IN_WEEK * WEEKS_TO_SHOW; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  const dates = generateDates();
  
  // Format dates to get day name
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
  };
  
  // Group dates by week
  const groupByWeek = (dates: Date[]) => {
    const weeks = [];
    let currentWeek: Date[] = [];
    
    dates.forEach(date => {
      currentWeek.push(date);
      
      if (currentWeek.length === DAYS_IN_WEEK) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };
  
  const weeks = groupByWeek(dates);
  
  // Get the activity level color
  const getActivityColor = (date: Date) => {
    const activity = getActivityForDate(date);
    
    if (activity === 0) return '#E0E0E0';
    if (activity < 3) return '#C5E1A5';
    if (activity < 5) return '#AED581';
    if (activity < 7) return '#9CCC65';
    return '#8BC34A';
  };
  
  return (
    <GlassCard style={styles.card}>
      <View style={styles.container}>
        <View style={styles.dayLabels}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <Text key={`day-${index}`} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
        </View>
        
        <View style={styles.heatmap}>
          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.week}>
              {week.map((date, dateIndex) => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <View
                    key={`date-${dateIndex}`}
                    style={[
                      styles.day,
                      { backgroundColor: getActivityColor(date) },
                      isToday && styles.today,
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
  },
  container: {
    padding: 4,
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.secondaryText,
    width: 20,
    textAlign: 'center',
  },
  heatmap: {
    flexDirection: 'column',
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  day: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  today: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});

export default HeatmapView;