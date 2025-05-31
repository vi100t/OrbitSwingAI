import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import { useStore } from '@/store';
import GlassCard from '@/components/ui/GlassCard';
import {
  Calendar,
  Clock,
  Trash2,
  Plus,
  Square,
  SquareCheck as CheckSquare,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useTasks } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { createTask, updateTask, deleteTask, generateSubtasks } = useTasks();
  const { session } = useAuth();

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
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      // Load task data
      const loadTask = async () => {
        try {
          const { data: task, error } = await supabase
            .from('tasks')
            .select('*, subtasks(*)')
            .eq('id', id)
            .single();

          if (error) {
            console.error('Error loading task:', error);
            return;
          }

          if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setDueDate(new Date(task.due_date));
            setDueTime(task.due_time ? new Date(task.due_time) : null);
            setPriority(task.priority as 'low' | 'medium' | 'high');
            setIsCompleted(task.is_completed);
            setSubtasks(
              task.subtasks?.map((st: any) => ({
                id: st.id,
                title: st.title,
                isCompleted: st.is_completed,
              })) || []
            );
          }
        } catch (err) {
          console.error('Error in loadTask:', err);
        }
      };

      loadTask();
    }
  }, [id]);

  const handleSave = async () => {
    try {
      if (!session?.user?.id) {
        console.error('No user session');
        return;
      }

      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate.toISOString(),
        due_time: dueTime?.toISOString() ?? null,
        priority,
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
        subtasks: subtasks.map((subtask) => ({
          id: subtask.id,
          title: subtask.title,
          is_completed: subtask.isCompleted,
          task_id: id as string,
        })),
      };

      if (id) {
        // For updates, we need to ensure we're sending all fields
        const updateData = {
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
          due_time: taskData.due_time,
          priority: taskData.priority,
          is_completed: taskData.is_completed,
          updated_at: taskData.updated_at,
          subtasks: taskData.subtasks,
        };

        const updatedTask = await updateTask(id as string, updateData);
        if (!updatedTask) {
          console.error('Failed to update task');
          return;
        }
        console.log('Task updated successfully:', updatedTask);
      } else {
        const newTask = await createTask({
          ...taskData,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
        });
        if (!newTask) {
          console.error('Failed to create task');
          return;
        }
        console.log('Task created successfully:', newTask);

        // Generate AI subtasks
        const aiSubtasks = await generateSubtasks(title, description);
        if (aiSubtasks) {
          console.log('Generated subtasks:', aiSubtasks);
          // Handle AI generated subtasks
        }
      }

      router.back();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (!id) return;

      const success = await deleteTask(id as string);
      if (success) {
        console.log('Task deleted successfully');
        router.back();
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
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
        <Header
          title={id ? 'Edit Task' : 'New Task'}
          showBack
          showNotifications={false}
          rightComponent={
            <View style={styles.headerButtons}>
              {id && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[styles.headerButton, styles.deleteButton]}
                >
                  <Trash2 size={24} color={Colors.error} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.headerButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <ScrollView style={styles.content}>
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
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
    height: '100%',
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
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
});
