import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Task, Label } from '@/types/task';

interface TaskCardProps {
  task: Task;
  labels: Label[];
  onPress: () => void;
  onComplete: () => void;
}

export function TaskCard({ task, labels, onPress, onComplete }: TaskCardProps) {
  const taskLabels = labels.filter((label) => task.labels?.includes(label.id));

  return (
    <TouchableOpacity
      style={[styles.container, task.is_completed && styles.completedContainer]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.checkbox, task.is_completed && styles.checked]}
            onPress={onComplete}
          >
            {task.is_completed && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <Text
            style={[styles.title, task.is_completed && styles.completedText]}
          >
            {task.title}
          </Text>
        </View>

        {taskLabels.length > 0 && (
          <View style={styles.labelsContainer}>
            {taskLabels.map((label) => (
              <View
                key={label.id}
                style={[styles.labelChip, { backgroundColor: label.color }]}
              >
                <Text style={styles.labelText}>{label.name}</Text>
              </View>
            ))}
          </View>
        )}

        {task.due_date && (
          <View style={styles.dueDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.dueDate}>
              {dayjs(task.due_date).format('MMM D, YYYY')}
              {task.due_time && ` at ${task.due_time}`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  completedContainer: {
    backgroundColor: '#F3F4F6',
  },
  content: {
    // ... existing content styles ...
  },
  header: {
    // ... existing header styles ...
  },
  checkbox: {
    // ... existing checkbox styles ...
  },
  checked: {
    // ... existing checked styles ...
  },
  title: {
    // ... existing title styles ...
  },
  completedText: {
    // ... existing completedText styles ...
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  labelChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labelText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dueDate: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
});
