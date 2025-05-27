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

      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate.toISOString(),
        due_time: dueTime?.toISOString() ?? null,
        priority,
        user_id: session.user.id,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
        },
      ]}
      onPress={() => setPriority(value as 'low' | 'medium' | 'high')}
    >
      <Text
        style={[
          styles.priorityButtonText,
          { color: getPriorityColor(value, priority === value ? 1 : 0.7) },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="New Task" showBack />

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
              <Text style={styles.sectionTitle}>Subtasks</Text>
              <View style={styles.subtaskInput}>
                <TextInput
                  style={styles.subtaskTextInput}
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  placeholder="Add subtask"
                  placeholderTextColor={Colors.secondaryText}
                  onSubmitEditing={handleAddSubtask}
                />
                <TouchableOpacity
                  style={styles.addSubtaskButton}
                  onPress={handleAddSubtask}
                >
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.subtaskList}>
                {subtasks.map((subtask) => (
                  <TouchableOpacity
                    key={subtask.id}
                    style={styles.subtaskItem}
                    onPress={() => toggleSubtask(subtask.id)}
                  >
                    {subtask.isCompleted ? (
                      <CheckSquare size={20} color={Colors.primary} />
                    ) : (
                      <Square size={20} color={Colors.text} />
                    )}
                    <Text
                      style={[
                        styles.subtaskText,
                        subtask.isCompleted && styles.completedSubtask,
                      ]}
                    >
                      {subtask.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassCard>

          <TouchableOpacity
            style={[styles.saveButton, { opacity: 0.9 }]}
            onPress={() => {
              console.log('Save button pressed');
              handleSave();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>Create Task</Text>
          </TouchableOpacity>
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
          <DateTimePicker
            value={dueTime || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setDueTime(selectedTime);
              }
            }}
          />
        )}
      </SafeAreaView>
    </GlassBg>
  );
}

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
  },
  priorityButtonActive: {
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  priorityButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: 'white',
  },
  subtasksContainer: {
    marginTop: 20,
  },
  subtaskInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtaskTextInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  addSubtaskButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  subtaskList: {
    marginTop: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  completedSubtask: {
    textDecorationLine: 'line-through',
    color: Colors.secondaryText,
  },
  testButton: {
    backgroundColor: 'red',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
});
