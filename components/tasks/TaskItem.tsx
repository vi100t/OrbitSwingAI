import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import { Task } from '@/types/task';
import Colors from '@/constants/Colors';
import { Calendar, Clock, SquareCheck as CheckSquare, Square } from 'lucide-react-native';
import dayjs from 'dayjs';

type Props = {
  task: Task;
  onToggleComplete: () => void;
  onPress: () => void;
};

const TaskItem: React.FC<Props> = ({ task, onToggleComplete, onPress }) => {
  // Get color based on priority
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
      <GlassCard style={[styles.card, task.isCompleted && styles.completedCard]}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={onToggleComplete}
            activeOpacity={0.7}
          >
            {task.isCompleted ? (
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
                  task.isCompleted && styles.completedTitle,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              <View
                style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]}
              />
            </View>
            
            {task.subTasks && task.subTasks.length > 0 && (
              <View style={styles.subtasksContainer}>
                <Text style={styles.subtaskInfo}>
                  {task.subTasks.filter(st => st.isCompleted).length} of {task.subTasks.length} subtasks completed
                </Text>
              </View>
            )}
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Calendar size={14} color={Colors.secondaryText} />
                <Text style={styles.metaText}>
                  {dayjs(task.dueDate).format('MMM D')}
                </Text>
              </View>
              
              {task.dueTime && (
                <View style={styles.metaItem}>
                  <Clock size={14} color={Colors.secondaryText} />
                  <Text style={styles.metaText}>
                    {dayjs(task.dueTime).format('h:mm A')}
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
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
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
    marginTop: 4,
  },
  subtaskInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.secondaryText,
  },
  metaContainer: {
    flexDirection: 'row',
    marginTop: 8,
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