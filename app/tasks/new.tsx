import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import GlassCard from '@/components/ui/GlassCard';
import {
  Calendar,
  Clock,
  Plus,
  Square,
  SquareCheck as CheckSquare,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useTasks, useSupabase } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { LabelSelector } from '@/components/LabelSelector';

export default function NewTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { createTask, generateSubtasks, createSubtasks } = useTasks();
  const { session } = useAuth();
  const [userId] = useState(() => uuidv4());
  const { labels, loadingLabels, fetchLabels } = useSupabase();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [subtasks, setSubtasks] = useState<
    Array<{ id: string; title: string; isCompleted: boolean }>
  >([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeatType, setRepeatType] = useState<
    'none' | 'daily' | 'weekly' | 'monthly'
  >('none');
  const [repeatFrequency, setRepeatFrequency] = useState(1);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [repeatEnds, setRepeatEnds] = useState<Date | null>(null);
  const [showRepeatEndsDatePicker, setShowRepeatEndsDatePicker] =
    useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [repeat, setRepeat] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState('daily');
  const [repeatEndDate, setRepeatEndDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchLabels();
  }, []);

  useEffect(() => {
    if (params.selectedLabels) {
      try {
        const parsedLabels = JSON.parse(params.selectedLabels as string);
        console.log('Received selected labels:', parsedLabels);
        setSelectedLabels(parsedLabels);
      } catch (error) {
        console.error('Error parsing selected labels:', error);
      }
    }
  }, [params.selectedLabels]);

  console.log('Current labels:', labels);
  console.log('Selected labels:', selectedLabels);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to create tasks');
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate ? dayjs(dueDate).format('YYYY-MM-DD') : undefined,
        due_time: dueTime ? dayjs(dueTime).format('HH:mm:ss') : undefined,
        priority: priority,
        status: 'pending',
        repeat_type: repeatType,
        repeat_frequency: repeatFrequency,
        repeat_days: repeatType === 'weekly' ? repeatDays : undefined,
        repeat_ends: repeatEnds
          ? dayjs(repeatEnds).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        labels: selectedLabels,
        user_id: session.user.id,
      };

      console.log('Saving task with data:', taskData);
      await createTask(taskData);
      router.back();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: Math.random().toString(),
          title: newSubtask.trim(),
          isCompleted: false,
        },
      ]);
      setNewSubtask('');
    }
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
      )
    );
  };

  const handleGenerateSubtasks = async () => {
    try {
      const generatedSubtasks = await generateSubtasks(title, description);
      if (generatedSubtasks && generatedSubtasks.length > 0) {
        setSubtasks(
          generatedSubtasks.map((subtask: string) => ({
            id: Math.random().toString(),
            title: subtask,
            isCompleted: false,
          }))
        );
      }
    } catch (error) {
      console.error('Error generating subtasks:', error);
    }
  };

  const handleLabelSelect = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleNavigateToLabels = () => {
    router.push({
      pathname: '/labels',
      params: { selectedLabels: JSON.stringify(selectedLabels) },
    });
  };

  const PriorityButton = ({
    value,
    label,
  }: {
    value: string;
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === value && styles.priorityButtonActive,
        {
          backgroundColor: getPriorityColor(
            value,
            priority === value ? 1 : 0.1
          ),
          borderColor:
            priority === value
              ? getPriorityColor(value, 0.3, true)
              : 'transparent',
        },
      ]}
      onPress={() => setPriority(value as 'low' | 'medium' | 'high')}
    >
      <Text
        style={[
          styles.priorityButtonText,
          {
            color:
              priority === value ? '#fff' : getPriorityColor(value, 0.7, true),
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setDueTime(selectedTime);
    }
  };

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="New Task"
          showBack
          showNotifications={false}
          rightComponent={
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.headerButton, styles.saveButton]}
                disabled={!title.trim()}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <GlassCard style={styles.card}>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor={Colors.secondaryText}
            />

            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add description"
              placeholderTextColor={Colors.secondaryText}
              multiline
              numberOfLines={4}
            />

            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={Colors.primary} />
                <Text style={styles.dateTimeText}>
                  {dayjs(dueDate).format('MMM D, YYYY')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={20} color={Colors.primary} />
                <Text style={styles.dateTimeText}>
                  {dueTime ? dayjs(dueTime).format('h:mm A') : 'Add time'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priorityContainer}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.priorityButtons}>
                <PriorityButton value="low" label="Low" />
                <PriorityButton value="medium" label="Medium" />
                <PriorityButton value="high" label="High" />
              </View>
            </View>

            <View style={styles.labelsContainer}>
              <View style={styles.labelsHeader}>
                <Text style={styles.sectionTitle}>Labels</Text>
                <TouchableOpacity
                  style={styles.addLabelButton}
                  onPress={handleNavigateToLabels}
                >
                  <Plus size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.labelsList}>
                {loadingLabels ? (
                  <Text style={styles.loadingText}>Loading labels...</Text>
                ) : labels.length === 0 ? (
                  <Text style={styles.noLabelsText}>No labels available</Text>
                ) : (
                  labels
                    .filter((label) => selectedLabels.includes(label.id))
                    .map((label) => (
                      <TouchableOpacity
                        key={label.id}
                        style={[
                          styles.labelItem,
                          { backgroundColor: label.color + '20' },
                        ]}
                        onPress={() => handleLabelSelect(label.id)}
                      >
                        <View
                          style={[
                            styles.labelColor,
                            { backgroundColor: label.color },
                          ]}
                        />
                        <Text
                          style={[styles.labelText, { color: label.color }]}
                        >
                          {label.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                )}
              </View>
            </View>

            <View style={styles.repeatContainer}>
              <View style={styles.repeatHeader}>
                <Text style={styles.sectionTitle}>Repeat</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    repeatType !== 'none' && styles.toggleSwitchActive,
                  ]}
                  onPress={() =>
                    setRepeatType(repeatType === 'none' ? 'daily' : 'none')
                  }
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      repeatType !== 'none' && styles.toggleKnobActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {repeatType !== 'none' && (
                <>
                  <View style={styles.repeatButtons}>
                    <TouchableOpacity
                      style={[
                        styles.repeatButton,
                        repeatType === 'daily' && styles.repeatButtonActive,
                      ]}
                      onPress={() => setRepeatType('daily')}
                    >
                      <Text
                        style={[
                          styles.repeatButtonText,
                          repeatType === 'daily' &&
                            styles.repeatButtonTextActive,
                        ]}
                      >
                        Daily
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.repeatButton,
                        repeatType === 'weekly' && styles.repeatButtonActive,
                      ]}
                      onPress={() => setRepeatType('weekly')}
                    >
                      <Text
                        style={[
                          styles.repeatButtonText,
                          repeatType === 'weekly' &&
                            styles.repeatButtonTextActive,
                        ]}
                      >
                        Weekly
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.repeatButton,
                        repeatType === 'monthly' && styles.repeatButtonActive,
                      ]}
                      onPress={() => setRepeatType('monthly')}
                    >
                      <Text
                        style={[
                          styles.repeatButtonText,
                          repeatType === 'monthly' &&
                            styles.repeatButtonTextActive,
                        ]}
                      >
                        Monthly
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.repeatOptions}>
                    <View style={styles.repeatFrequency}>
                      <Text style={styles.repeatLabel}>Repeat every</Text>
                      <View style={styles.frequencyInput}>
                        <TextInput
                          style={styles.frequencyText}
                          value={repeatFrequency.toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text);
                            if (!isNaN(num) && num > 0) {
                              setRepeatFrequency(num);
                            }
                          }}
                          keyboardType="number-pad"
                        />
                        <Text style={styles.frequencyUnit}>
                          {repeatType === 'daily'
                            ? 'days'
                            : repeatType === 'weekly'
                            ? 'weeks'
                            : 'months'}
                        </Text>
                      </View>
                    </View>

                    {repeatType === 'weekly' && (
                      <View style={styles.weekDays}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
                          (day, index) => (
                            <TouchableOpacity
                              key={`${day}-${index}`}
                              style={[
                                styles.weekDay,
                                repeatDays.includes(index) &&
                                  styles.weekDayActive,
                              ]}
                              onPress={() => {
                                if (repeatDays.includes(index)) {
                                  setRepeatDays(
                                    repeatDays.filter((d) => d !== index)
                                  );
                                } else {
                                  setRepeatDays([...repeatDays, index]);
                                }
                              }}
                            >
                              <Text
                                style={[
                                  styles.weekDayText,
                                  repeatDays.includes(index) &&
                                    styles.weekDayTextActive,
                                ]}
                              >
                                {day}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.endsContainer}
                      onPress={() => setShowRepeatEndsDatePicker(true)}
                    >
                      <Text style={styles.endsLabel}>Ends</Text>
                      <Text style={styles.endsValue}>
                        {repeatEnds
                          ? dayjs(repeatEnds).format('MMM D, YYYY')
                          : 'Never'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            <View style={styles.subtasksContainer}>
              <View style={styles.subtasksHeader}>
                <Text style={styles.sectionTitle}>Subtasks</Text>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateSubtasks}
                >
                  <Text style={styles.generateButtonText}>Generate</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.subtasksContainer}>
                {subtasks.map((subtask, index) => (
                  <View key={subtask.id} style={styles.subtaskItem}>
                    <TouchableOpacity
                      style={styles.subtaskCheckbox}
                      onPress={() => toggleSubtask(subtask.id)}
                    >
                      {subtask.isCompleted ? (
                        <CheckSquare size={20} color={Colors.primary} />
                      ) : (
                        <Square size={20} color={Colors.secondaryText} />
                      )}
                    </TouchableOpacity>
                    <TextInput
                      style={styles.subtaskInput}
                      value={subtask.title}
                      onChangeText={(text) =>
                        setSubtasks(
                          subtasks.map((st) =>
                            st.id === subtask.id ? { ...st, title: text } : st
                          )
                        )
                      }
                      placeholder="Subtask"
                      placeholderTextColor={Colors.secondaryText}
                    />
                    <TouchableOpacity
                      style={styles.removeSubtaskButton}
                      onPress={() =>
                        setSubtasks(
                          subtasks.filter((st) => st.id !== subtask.id)
                        )
                      }
                    >
                      <Text style={styles.removeSubtaskButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.addSubtaskContainer}>
                  <TouchableOpacity
                    style={styles.subtaskCheckbox}
                    onPress={() => setNewSubtask('')}
                  >
                    <Square size={20} color={Colors.secondaryText} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.subtaskInput}
                    value={newSubtask}
                    onChangeText={setNewSubtask}
                    placeholder="Add subtask"
                    placeholderTextColor={Colors.secondaryText}
                    onSubmitEditing={handleAddSubtask}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          </GlassCard>
        </ScrollView>

        {showDatePicker && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity
                  style={styles.pickerDoneButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setDueDate(selectedDate);
                  }
                }}
                style={{}}
              />
            </View>
          </TouchableOpacity>
        )}

        {showTimePicker && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity
                  style={styles.pickerDoneButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dueTime || new Date()}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={{}}
              />
            </View>
          </TouchableOpacity>
        )}

        {showRepeatEndsDatePicker && (
          <DateTimePicker
            value={repeatEnds || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowRepeatEndsDatePicker(false);
              if (selectedDate) {
                setRepeatEnds(selectedDate);
              }
            }}
          />
        )}
      </SafeAreaView>
    </GlassBg>
  );
}

const getPriorityColor = (
  priority: string,
  opacity: number = 1,
  isDark: boolean = false
) => {
  switch (priority) {
    case 'high':
      return isDark
        ? `rgba(183, 28, 28, ${opacity})` // Darker red
        : `rgba(244, 67, 54, ${opacity})`; // Original red
    case 'medium':
      return isDark
        ? `rgba(194, 107, 24, ${opacity})` // Darker orange
        : `rgba(255, 152, 0, ${opacity})`; // Original orange
    default:
      return isDark
        ? `rgba(13, 71, 161, ${opacity})` // Darker blue
        : `rgba(33, 150, 243, ${opacity})`; // Original blue
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 20,
  },
  titleInput: {
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  dateTimeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
  },
  priorityContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  priorityButtonActive: {
    borderWidth: 2,
  },
  priorityButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  priorityButtonTextActive: {
    color: Colors.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  subtasksContainer: {
    marginTop: 20,
  },
  subtasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  generateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  subtaskCheckbox: {
    marginRight: 8,
  },
  subtaskInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text,
  },
  removeSubtaskButton: {
    padding: 4,
  },
  removeSubtaskButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.secondaryText,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timePickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timePickerModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  timePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
  timePickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  doneButton: {
    backgroundColor: Colors.primary,
  },
  timePickerButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  doneButtonText: {
    color: '#fff',
  },
  repeatContainer: {
    marginBottom: 20,
  },
  repeatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: Colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  repeatButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 4,
  },
  repeatButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
  },
  repeatButtonActive: {
    backgroundColor: Colors.primary,
  },
  repeatButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  repeatButtonTextActive: {
    color: '#fff',
  },
  repeatOptions: {
    marginTop: 16,
  },
  repeatFrequency: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  repeatLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text,
    marginRight: 12,
  },
  frequencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  frequencyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
    width: 40,
    textAlign: 'center',
  },
  frequencyUnit: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weekDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
  },
  weekDayActive: {
    backgroundColor: Colors.primary,
  },
  weekDayText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  weekDayTextActive: {
    color: '#fff',
  },
  endsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  endsLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text,
  },
  endsValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  repeatEndsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  repeatEndsModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  repeatEndsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
  repeatEndsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  repeatEndsButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  section: {
    marginBottom: 16,
  },
  labelsContainer: {
    marginBottom: 20,
  },
  labelsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addLabelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.2)',
  },
  labelColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  labelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  selectedLabelText: {
    fontWeight: '600',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
    padding: 12,
  },
  noLabelsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
    padding: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 300,
  },
  pickerHeader: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  pickerDoneButton: {
    padding: 8,
  },
  pickerDoneText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
