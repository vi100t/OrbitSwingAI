import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import { Task } from '@/types/task';
import { Calendar, Clock } from 'lucide-react-native';
import dayjs from 'dayjs';

type Props = {
  tasks: Task[];
  onPress: (id: string) => void;
};

const UpcomingTasks: React.FC<Props> = ({ tasks, onPress }) => {
  if (tasks.length === 0) {
    return (
      <GlassCard style={styles.card}>
        <Text style={styles.emptyText}>No upcoming tasks</Text>
      </GlassCard>
    );
  }

  return (
    <View style={styles.container}>
      {tasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          style={styles.taskItem}
          activeOpacity={0.8}
          onPress={() => onPress(task.id)}
        >
          <GlassCard style={styles.taskCard}>
            <View style={styles.taskContainer}>
              <View style={[styles.priority, { backgroundColor: getPriorityColor(task.priority) }]} />
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle} numberOfLines={1}>
                  {task.title}
                </Text>
                <View style={styles.taskMeta}>
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
      ))}
    </View>
  );
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return Colors.error;
    case 'medium':
      return Colors.warning;
    default:
      return Colors.info;
  }
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  card: {
    marginTop: 8,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  taskItem: {
    marginBottom: 12,
  },
  taskCard: {
    borderLeftWidth: 0,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priority: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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

export default UpcomingTasks;