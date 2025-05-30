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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function TasksScreen() {
  const { tasks, loading, refreshTasks } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const loaderPosition = React.useRef(new Animated.Value(-50)).current;
  const cardsPosition = React.useRef(new Animated.Value(0)).current;
  const pullDistance = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
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
    } else {
      fadeAnim.setValue(0);
    }
  }, [loading, fadeAnim, cardsPosition]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);

    // Reset pull distance to trigger the interpolation
    pullDistance.setValue(0);
  }, [refreshTasks, pullDistance]);

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

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase() || '').includes(
        searchQuery.toLowerCase()
      )
  );

  // Sort tasks by due date
  const sortedTasks = [...filteredTasks].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  const handleTaskPress = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const renderItem: ListRenderItem<Task> = ({ item }) => (
    <TaskItem task={item} onPress={() => handleTaskPress(item.id)} />
  );

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Tasks" showVoice={true} />

        <View style={styles.contentContainer}>
          <View style={styles.searchRow}>
            {showSearch ? (
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClear={() => {
                  setSearchQuery('');
                  setShowSearch(false);
                }}
              />
            ) : (
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearch(true)}
              >
                <Search size={18} color={Colors.text} />
                <Text style={styles.searchButtonText}>Search tasks</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/tasks/new')}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
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
              keyExtractor={(item) => item.id}
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
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentWrapper: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchButtonText: {
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
  tasksList: {
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
