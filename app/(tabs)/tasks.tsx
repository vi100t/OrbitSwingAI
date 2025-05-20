import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import { useStore } from '@/store';
import Colors from '@/constants/Colors';
import { Plus, Filter } from 'lucide-react-native';
import TaskItem from '@/components/tasks/TaskItem';
import TaskFilters from '@/components/tasks/TaskFilters';
import { useRouter } from 'expo-router';

export default function TasksScreen() {
  const { tasks, toggleTaskCompletion } = useStore();
  const [filterType, setFilterType] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Apply filters to tasks
  const filteredTasks = tasks.filter(task => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    switch (filterType) {
      case 'today':
        return taskDate.getTime() === today.getTime();
      case 'upcoming':
        return taskDate.getTime() > today.getTime() && !task.isCompleted;
      case 'completed':
        return task.isCompleted;
      default:
        return true;
    }
  });
  
  // Sort tasks: incomplete first, then by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First sort by completion status
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    
    // Then sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
    }
    
    // Finally sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  const handleTaskPress = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header 
          title="Tasks" 
          showVoice={true}
        />
        
        <View style={styles.contentContainer}>
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={styles.filterButton} 
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} color={Colors.text} />
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/tasks/create')}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {showFilters && (
            <TaskFilters
              currentFilter={filterType}
              onFilterChange={setFilterType}
            />
          )}
          
          <FlatList
            data={sortedTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onToggleComplete={() => toggleTaskCompletion(item.id)}
                onPress={() => handleTaskPress(item.id)}
              />
            )}
            contentContainerStyle={styles.taskList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tasks found</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push('/tasks/create')}
                >
                  <Text style={styles.emptyButtonText}>Create Task</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </GlassBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text,
    marginLeft: 6,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  taskList: {
    paddingBottom: 100,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.secondaryText,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: 'white',
  },
});