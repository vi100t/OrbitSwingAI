import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import GlassBg from '@/components/ui/GlassBg';
import TaskSummary from '@/components/dashboard/TaskSummary';
import HabitStreak from '@/components/dashboard/HabitStreak';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import AIAssistant from '@/components/shared/AIAssistant';
import { useStore } from '@/store';
import HeatmapView from '@/components/dashboard/HeatmapView';
import QuickActions from '@/components/dashboard/QuickActions';
import Header from '@/components/shared/Header';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@/hooks/useSupabase';

export default function DashboardScreen() {
  const { habits, tasks, initializeData } = useStore();
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();

  useEffect(() => {
    // Initialize sample data for demonstration
    initializeData();
  }, [initializeData]);

  const completedTasksToday = tasks.filter(
    (task) =>
      task.is_completed &&
      task.completed_at &&
      new Date(task.completed_at).toDateString() === new Date().toDateString()
  ).length;

  const totalTasksToday = tasks.filter(
    (task) =>
      new Date(task.due_date).toDateString() === new Date().toDateString()
  ).length;

  const upcomingTasks = tasks
    .filter(
      (task) => !task.is_completed && new Date(task.due_date) > new Date()
    )
    .slice(0, 3);

  const displayName =
    profile?.display_name || profile?.first_name || 'Productivity Pro';

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
          />

          <Text style={styles.sectionTitle}>Habit Streaks</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.streaksContainer}
          >
            {habits.map((habit) => (
              <HabitStreak
                key={habit.id}
                title={habit.name}
                streak={habit.currentStreak}
                color={habit.color}
                onPress={() => {}}
              />
            ))}
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
  heatmapContainer: {
    marginTop: 16,
  },
  spacer: {
    height: 100,
  },
});
