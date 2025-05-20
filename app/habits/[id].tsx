import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import { useStore } from '@/store';
import GlassCard from '@/components/ui/GlassCard';
import { Calendar, Clock, Trash2, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { habits, addHabit, updateHabit, deleteHabit } = useStore();
  
  const habit = habits.find(h => h.id === id) || {
    id: '',
    name: '',
    description: '',
    frequency: 'daily',
    timeOfDay: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    color: Colors.primary,
    createdAt: new Date().toISOString(),
    completions: [],
  };

  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || '');
  const [frequency, setFrequency] = useState(habit.frequency);
  const [timeOfDay, setTimeOfDay] = useState(new Date(habit.timeOfDay));
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(habit.daysOfWeek || []);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    const newHabit = {
      name,
      description,
      frequency,
      timeOfDay: timeOfDay.toISOString(),
      daysOfWeek: frequency === 'custom' ? daysOfWeek : undefined,
      color: habit.color,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      completions: habit.completions,
    };

    if (id) {
      updateHabit(habit.id, newHabit);
    } else {
      addHabit({
        id: Math.random().toString(36).substring(7),
        ...newHabit,
        createdAt: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        completions: [],
      });
    }
    router.back();
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
    router.back();
  };

  const toggleDay = (dayIndex: number) => {
    if (daysOfWeek.includes(dayIndex)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== dayIndex));
    } else {
      setDaysOfWeek([...daysOfWeek, dayIndex].sort());
    }
  };

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title={id ? 'Edit Habit' : 'New Habit'}
          showBack
        />
        
        <ScrollView style={styles.content}>
          <GlassCard style={styles.card}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Habit name"
              placeholderTextColor={Colors.secondaryText}
            />
            
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add description"
              placeholderTextColor={Colors.secondaryText}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequency</Text>
              <View style={styles.frequencyButtons}>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'daily' && styles.frequencyButtonActive,
                  ]}
                  onPress={() => setFrequency('daily')}
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      frequency === 'daily' && styles.frequencyButtonTextActive,
                    ]}
                  >
                    Daily
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'weekly' && styles.frequencyButtonActive,
                  ]}
                  onPress={() => setFrequency('weekly')}
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      frequency === 'weekly' && styles.frequencyButtonTextActive,
                    ]}
                  >
                    Weekly
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'custom' && styles.frequencyButtonActive,
                  ]}
                  onPress={() => setFrequency('custom')}
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      frequency === 'custom' && styles.frequencyButtonTextActive,
                    ]}
                  >
                    Custom
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {frequency === 'custom' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Days of Week</Text>
                <View style={styles.daysContainer}>
                  {DAYS.map((day, index) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        daysOfWeek.includes(index) && styles.dayButtonActive,
                      ]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          daysOfWeek.includes(index) && styles.dayButtonTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reminder Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={20} color={Colors.primary} />
                <Text style={styles.timeText}>
                  {dayjs(timeOfDay).format('h:mm A')}
                </Text>
              </TouchableOpacity>
            </View>

            {id && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Trash2 size={20} color={Colors.error} />
                <Text style={styles.deleteText}>Delete Habit</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Habit</Text>
          </TouchableOpacity>
        </ScrollView>

        {showTimePicker && (
          <DateTimePicker
            value={timeOfDay}
            mode="time"
            is24Hour={false}
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setTimeOfDay(selectedTime);
              }
            }}
          />
        )}
      </SafeAreaView>
    </GlassBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 20,
  },
  nameInput: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  descriptionInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  frequencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  frequencyButtonActive: {
    backgroundColor: Colors.primary,
  },
  frequencyButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  frequencyButtonTextActive: {
    color: 'white',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.primary,
  },
  dayButtonTextActive: {
    color: 'white',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  timeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    marginTop: 20,
  },
  deleteText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.error,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: 'white',
  },
});