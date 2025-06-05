import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
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
import { useTasks } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

export default function NewTaskScreen() {
  const router = useRouter();
  const { createTask, generateSubtasks, createSubtasks } = useTasks();
  const { session } = useAuth();
  const [userId] = useState(() => uuidv4()); // Generate a UUID for this session

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

  const handleSave = async () => {
    console.log('handleSave called');
    try {
      if (!session?.user?.id) {
        alert('Please sign in to create tasks');
        router.push('/login');
        return;
      }

      if (!title.trim()) {
        console.log('Title validation failed');
        alert('Please enter a task title');
        return;
      }

      console.log('Current subtasks state:', subtasks);

      // Format the time with the date for proper timestamp
      const formattedTime = dueTime
        ? dayjs(dueDate)
            .hour(dayjs(dueTime).hour())
            .minute(dayjs(dueTime).minute())
            .format('YYYY-MM-DD HH:mm:ss')
        : null;

      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dayjs(dueDate).format('YYYY-MM-DD'),
        due_time: formattedTime,
        priority,
        user_id: session.user.id,
        is_completed: false,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      console.log(
        'About to create task with data:',
        JSON.stringify(taskData, null, 2)
      );

      // Create task using useTasks hook
      const newTask = await createTask(taskData);
      if (!newTask) {
        console.error('Failed to create task');
        alert('Failed to create task');
        return;
      }

      console.log('Task created successfully:', newTask);

      // Create subtasks if any exist
      if (subtasks.length > 0) {
        console.log('Creating subtasks...');
        const subtaskData = subtasks.map((subtask) => ({
          title: subtask.title,
          is_completed: subtask.isCompleted,
        }));

        const insertedSubtasks = await createSubtasks(newTask.id, subtaskData);
        if (!insertedSubtasks) {
          console.error('Failed to create subtasks');
          alert('Failed to create subtasks');
        } else {
          console.log('Subtasks created successfully:', insertedSubtasks);
        }
      } else {
        console.log('No subtasks to create');
      }

      // Generate AI subtasks
      try {
        console.log('Generating AI subtasks...');
        const aiSubtasks = await generateSubtasks(title, description);
        if (aiSubtasks && aiSubtasks.length > 0) {
          const aiSubtaskData = aiSubtasks.map((subtask: string) => ({
            title: subtask,
            is_completed: false,
          }));

          const insertedAiSubtasks = await createSubtasks(
            newTask.id,
            aiSubtaskData
          );
          if (!insertedAiSubtasks) {
            console.error('Failed to create AI subtasks');
            alert('Failed to create AI subtasks');
          } else {
            console.log(
              'AI subtasks created successfully:',
              insertedAiSubtasks
            );
          }
        } else {
          console.log('No AI subtasks generated');
        }
      } catch (error) {
        console.error('Error generating AI subtasks:', error);
        alert('Failed to generate AI subtasks: ' + (error as Error).message);
      }

      console.log('Task creation completed, navigating back...');
      router.back();
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('An error occurred while creating the task. Please try again.');
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
          <DateTimePicker
            value={dueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDueDate(selectedDate);
              }
            }}
          />
        )}

        {showTimePicker && (
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerModal}>
              <DateTimePicker
                value={dueTime || new Date()}
                mode="time"
                display="spinner"
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setDueTime(selectedTime);
                  }
                }}
                textColor={Colors.text}
                themeVariant="light"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 12,
                  height: 200,
                  width: 200,
                }}
              />
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={[styles.timePickerButton, styles.cancelButton]}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.timePickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timePickerButton, styles.doneButton]}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text
                    style={[styles.timePickerButtonText, styles.doneButtonText]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
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
});
