import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import {
  Calendar,
  Clock,
  SquareCheck as CheckSquare,
  Square,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { useTasks } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';

type SubTask = {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
};

type Props = {
  task: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    due_date: string;
    due_time: string | null;
    is_completed: boolean;
    completed_at: string | null;
    priority: string;
    category: string | null;
    created_at: string;
    updated_at: string;
    subtasks?: SubTask[];
  };
  onPress: () => void;
};

const TaskItem: React.FC<Props> = ({ task, onPress }) => {
  const { updateTask } = useTasks();

  const handleToggleComplete = async () => {
    try {
      await updateTask(task.id, {
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date().toISOString() : null,
      });
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      const subtask = task.subtasks?.find((st) => st.id === subtaskId);
      if (subtask) {
        const { error } = await supabase
          .from('subtasks')
          .update({ is_completed: !subtask.is_completed })
          .eq('id', subtaskId)
          .eq('task_id', task.id);

        if (error) {
          console.error('Error updating subtask:', error);
        }
      }
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      default:
        return Colors.info;
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard
        style={[styles.card, task.is_completed && styles.completedCard]}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={handleToggleComplete}
            activeOpacity={0.7}
          >
            {task.is_completed ? (
              <CheckSquare size={20} color={Colors.primary} />
            ) : (
              <Square size={20} color={Colors.secondaryText} />
            )}
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  task.is_completed && styles.completedTitle,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor() },
                ]}
              />
            </View>

            {task.subtasks && task.subtasks.length > 0 && (
              <View style={styles.subtasksContainer}>
                {task.subtasks.map((subtask) => (
                  <TouchableOpacity
                    key={subtask.id}
                    style={styles.subtaskRow}
                    onPress={() => handleToggleSubtask(subtask.id)}
                  >
                    {subtask.is_completed ? (
                      <CheckSquare size={16} color={Colors.primary} />
                    ) : (
                      <Square size={16} color={Colors.secondaryText} />
                    )}
                    <Text
                      style={[
                        styles.subtaskText,
                        subtask.is_completed && styles.completedSubtask,
                      ]}
                    >
                      {subtask.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Calendar size={14} color={Colors.secondaryText} />
                <Text style={styles.metaText}>
                  {dayjs(task.due_date).format('MMM D')}
                </Text>
              </View>

              {task.due_time && (
                <View style={styles.metaItem}>
                  <Clock size={14} color={Colors.secondaryText} />
                  <Text style={styles.metaText}>
                    {dayjs(task.due_time).format('h:mm A')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  completedCard: {
    opacity: 0.7,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: Colors.secondaryText,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  subtasksContainer: {
    marginTop: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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
  metaContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.secondaryText,
    marginLeft: 4,
  },
});

export default TaskItem;
