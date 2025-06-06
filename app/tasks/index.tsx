import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSupabase } from '@/hooks/useSupabase';
import { TaskCard } from '@/components/TaskCard';
import { LabelFilter } from '@/components/LabelFilter';
import { Task } from '@/types/task';
import dayjs from 'dayjs';

export default function TaskListScreen() {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const { tasks, loading, labels, loadingLabels, fetchLabels, updateTask } =
    useSupabase();

  useEffect(() => {
    fetchLabels();
  }, []);

  const filteredTasks = tasks.filter((task: Task) => {
    if (selectedLabels.length === 0) return true;
    return task.labels?.some((labelId: string) =>
      selectedLabels.includes(labelId)
    );
  });

  const handleLabelSelect = (labelId: string) => {
    setSelectedLabels((prev: string[]) =>
      prev.includes(labelId)
        ? prev.filter((id: string) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await updateTask(taskId, {
        is_completed: !task.is_completed,
        completed_at: !task.is_completed
          ? dayjs().format('YYYY-MM-DD HH:mm:ss')
          : null,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/tasks/new')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {!loadingLabels && labels.length > 0 && (
        <LabelFilter
          labels={labels}
          selectedLabels={selectedLabels}
          onSelectLabel={handleLabelSelect}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#7C4DFF" />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              labels={labels}
              onPress={() => router.push(`/tasks/${item.id}`)}
              onComplete={() => handleCompleteTask(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#7C4DFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 16,
  },
});
