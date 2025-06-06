import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import GlassBg from '@/components/ui/GlassBg';
import TaskSummary from '@/components/dashboard/TaskSummary';
import HabitStreak from '@/components/dashboard/HabitStreak';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import AIAssistant from '@/components/shared/AIAssistant';
import { useTasks, useHabits } from '@/hooks/useSupabase';
import HeatmapView from '@/components/dashboard/HeatmapView';
import QuickActions from '@/components/dashboard/QuickActions';
import Header from '@/components/shared/Header';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@/hooks/useSupabase';
import dayjs from 'dayjs';

export default function DashboardScreen() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { habits, loading: habitsLoading } = useHabits();
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();

  const today = dayjs().startOf('day');
  const tomorrow = dayjs().add(1, 'day').startOf('day');

  const completedTasksToday = tasks.filter(
    (task) =>
      task.is_completed &&
      task.completed_at &&
      dayjs(task.completed_at).startOf('day').isSame(today)
  ).length;

  const totalTasksToday = tasks.filter((task) =>
    dayjs(task.due_date).startOf('day').isSame(today)
  ).length;

  const upcomingTasks = tasks
    .filter(
      (task) =>
        !task.is_completed &&
        dayjs(task.due_date).isAfter(today) &&
        dayjs(task.due_date).isBefore(tomorrow.add(7, 'day'))
    )
    .sort((a, b) => dayjs(a.due_date).unix() - dayjs(b.due_date).unix())
    .slice(0, 3);

  const displayName =
    profile?.display_name || profile?.first_name || 'Productivity Pro';

  const isLoading = tasksLoading || habitsLoading || profileLoading;

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Dashboard" showVoice={true} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Good day,</Text>
            <Text style={styles.nameText}>{displayName}</Text>
          </View>

          <TaskSummary
            completedTasks={completedTasksToday}
            totalTasks={totalTasksToday}
            onPress={() => router.push('/tasks')}
            loading={isLoading}
          />

          <Text style={styles.sectionTitle}>Habit Streaks</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.streaksContainer}
          >
            {isLoading ? (
              <View style={styles.loadingHabits}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : habits.length === 0 ? (
              <View style={styles.emptyHabits}>
                <Text style={styles.emptyText}>No habits yet</Text>
                <Text style={styles.emptySubtext}>
                  Habits are automatically created when you make a task
                  repeatable
                </Text>
              </View>
            ) : (
              habits.map((habit) => (
                <HabitStreak
                  key={habit.id}
                  title={habit.name}
                  streak={habit.current_streak || 0}
                  color={habit.color || Colors.primary}
                  onPress={() => {}}
                />
              ))
            )}
          </ScrollView>

          <View style={styles.heatmapContainer}>
            <Text style={styles.sectionTitle}>Monthly Activity</Text>
            <HeatmapView />
          </View>

          <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
          <UpcomingTasks
            tasks={upcomingTasks}
            onPress={(id) => router.push(`/tasks/${id}`)}
          />

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickActions />

          <AIAssistant
            suggestion="You have 3 overdue tasks. Would you like to reschedule them?"
            onAccept={() => {}}
            onDismiss={() => {}}
          />

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </GlassBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.secondaryText,
  },
  nameText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.text,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  streaksContainer: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  loadingHabits: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHabits: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.secondaryText,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  heatmapContainer: {
    marginTop: 16,
  },
  spacer: {
    height: 100,
  },
});
