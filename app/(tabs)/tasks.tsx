import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  ListRenderItem,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import { Plus, Search } from 'lucide-react-native';
import TaskItem from '@/components/tasks/TaskItem';
import { useRouter } from 'expo-router';
import SearchBar from '@/components/shared/SearchBar';
import { useTasks } from '@/hooks/useSupabase';
import { Task } from '@/types/task';
import PullToRefreshLoader from '@/components/shared/PullToRefreshLoader';
import dayjs from 'dayjs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Task>);

export default function TasksScreen() {
  const { tasks, loading, refreshTasks } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'today' | 'upcoming' | 'completed' | 'due'
  >('all');
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const loaderPosition = React.useRef(new Animated.Value(-50)).current;
  const cardsPosition = React.useRef(new Animated.Value(0)).current;
  const pullDistance = React.useRef(new Animated.Value(0)).current;
  const searchInputWidth = React.useRef(new Animated.Value(40)).current;
  const searchInputOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardsPosition, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, cardsPosition]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);

    // Reset pull distance to trigger the interpolation
    pullDistance.setValue(0);
  }, [pullDistance, refreshTasks]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: pullDistance } } }],
    { useNativeDriver: true }
  );

  const loaderTranslateY = pullDistance.interpolate({
    inputRange: [-100, 0],
    outputRange: [SCREEN_HEIGHT / 3, -150],
    extrapolate: 'clamp',
  });

  const cardsTranslateY = pullDistance.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [SCREEN_HEIGHT, 0, 0],
    extrapolate: 'clamp',
  });

  const toggleSearch = () => {
    if (showSearch) {
      // Collapse search
      Animated.parallel([
        Animated.timing(searchInputWidth, {
          toValue: 40,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(searchInputOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSearch(false);
        setSearchQuery('');
      });
    } else {
      // Expand search
      setShowSearch(true);
      Animated.parallel([
        Animated.timing(searchInputWidth, {
          toValue: 200,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(searchInputOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleSearchBlur = () => {
    if (searchQuery.length === 0) {
      toggleSearch();
    }
  };

  // Filter tasks based on search query and active filter
  const filteredTasks = tasks.filter((task) => {
    // First apply search filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase() || '').includes(
        searchQuery.toLowerCase()
      );

    if (!matchesSearch) return false;

    // Then apply active filter
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day').endOf('day');
    const taskDate = dayjs(task.due_date);

    switch (activeFilter) {
      case 'today':
        return taskDate.isSame(today, 'day');
      case 'upcoming':
        return taskDate.isAfter(today, 'day');
      case 'completed':
        return task.is_completed;
      case 'due':
        return !task.is_completed && taskDate.isBefore(today, 'day');
      default:
        return true;
    }
  });

  // Sort tasks by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First sort by completion status
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }
    // Then sort by due date
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const handleTaskPress = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const renderItem: ListRenderItem<Task> = ({ item }) => (
    <TaskItem task={item} onPress={() => handleTaskPress(item.id)} />
  );

  if (loading) {
    return (
      <GlassBg>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Header title="Tasks" showVoice={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </SafeAreaView>
      </GlassBg>
    );
  }

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="Tasks"
          showVoice={true}
          rightComponent={
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/tasks/new')}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          }
        />

        <View style={styles.contentContainer}>
          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              <Animated.View
                style={[styles.searchContainer, { width: searchInputWidth }]}
              >
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={toggleSearch}
                >
                  <Search size={20} color={Colors.primary} />
                </TouchableOpacity>

                {showSearch && (
                  <Animated.View
                    style={[
                      styles.searchInputContainer,
                      { opacity: searchInputOpacity },
                    ]}
                  >
                    <TextInput
                      style={styles.searchInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search tasks..."
                      placeholderTextColor={Colors.secondaryText}
                      autoFocus={true}
                      onBlur={handleSearchBlur}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        style={styles.clearButton}
                      >
                        <Text style={styles.clearButtonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                )}
              </Animated.View>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  activeFilter === 'all' && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter('all')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'all' && styles.filterPillTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  activeFilter === 'today' && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter('today')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'today' && styles.filterPillTextActive,
                  ]}
                >
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  activeFilter === 'upcoming' && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter('upcoming')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'upcoming' && styles.filterPillTextActive,
                  ]}
                >
                  Upcoming
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  activeFilter === 'due' && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter('due')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'due' && styles.filterPillTextActive,
                  ]}
                >
                  Due
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  activeFilter === 'completed' && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter('completed')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'completed' && styles.filterPillTextActive,
                  ]}
                >
                  Completed
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <Animated.View
            style={[
              styles.contentWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: cardsTranslateY }],
                marginTop: 12,
              },
            ]}
          >
            <AnimatedFlatList
              data={sortedTasks}
              keyExtractor={(item: Task) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.tasksList}
              onScroll={onScroll}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.primary]}
                  tintColor={Colors.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No tasks found</Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/tasks/new')}
                  >
                    <Text style={styles.emptyButtonText}>Create Task</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </Animated.View>

          <PullToRefreshLoader pullDistance={pullDistance} />
        </View>
      </SafeAreaView>
    </GlassBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentWrapper: {
    flex: 1,
    height: '100%',
  },
  filterContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  filterScrollContent: {
    paddingRight: 20,
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.text,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    paddingHorizontal: 8,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: Colors.secondaryText,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: -1,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  filterPillTextActive: {
    color: 'white',
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
  tasksList: {
    paddingBottom: 100,
    gap: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
