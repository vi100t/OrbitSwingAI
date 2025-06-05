import { Task } from '@/types/task';
import { Note } from '@/types/note';
import { Habit } from '@/types/habit';
import dayjs from 'dayjs';

// Helper to generate UUID v4
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Get today and other dates
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

// Mock Tasks
const tasks: Task[] = [
  {
    id: generateId(),
    user_id: 'mock-user',
    title: 'Complete project presentation',
    description: 'Finish slides and prepare notes for the team meeting',
    due_date: dayjs(tomorrow).format('YYYY-MM-DD'),
    due_time: dayjs(tomorrow)
      .set('hour', 14)
      .set('minute', 0)
      .format('HH:mm:ss'),
    is_completed: false,
    completed_at: null,
    priority: 'high',
    category: 'work',
    created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    subtasks: [
      {
        id: generateId(),
        task_id: generateId(),
        title: 'Prepare slides',
        is_completed: true,
        created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        id: generateId(),
        task_id: generateId(),
        title: 'Practice delivery',
        is_completed: false,
        created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        id: generateId(),
        task_id: generateId(),
        title: 'Gather feedback',
        is_completed: false,
        created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
      },
    ],
  },
  {
    id: generateId(),
    user_id: 'mock-user',
    title: 'Grocery shopping',
    description: 'Buy fruits, vegetables, and snacks',
    due_date: dayjs(today).format('YYYY-MM-DD'),
    due_time: null,
    is_completed: false,
    completed_at: null,
    priority: 'medium',
    category: 'personal',
    created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    subtasks: [
      {
        id: generateId(),
        task_id: 'mock-task',
        title: 'Make shopping list',
        is_completed: true,
        created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        id: generateId(),
        task_id: 'mock-task',
        title: 'Check pantry inventory',
        is_completed: true,
        created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        id: generateId(),
        task_id: 'mock-task',
        title: 'Visit supermarket',
        is_completed: false,
        created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
      },
    ],
  },
  {
    id: generateId(),
    user_id: 'mock-user',
    title: 'Call mom',
    description: "Don't forget to wish her happy birthday",
    due_date: dayjs(today).format('YYYY-MM-DD'),
    due_time: dayjs(today).set('hour', 18).set('minute', 0).format('HH:mm:ss'),
    is_completed: true,
    completed_at: dayjs(today)
      .set('hour', 17)
      .set('minute', 30)
      .format('YYYY-MM-DD HH:mm:ss'),
    priority: 'high',
    category: 'personal',
    created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    id: generateId(),
    user_id: 'mock-user',
    title: 'Review quarterly reports',
    description: 'Analyze Q2 performance and prepare summary',
    due_date: dayjs(tomorrow).format('YYYY-MM-DD'),
    due_time: null,
    is_completed: false,
    completed_at: null,
    priority: 'medium',
    category: 'work',
    created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    id: generateId(),
    user_id: 'mock-user',
    title: 'Schedule dentist appointment',
    description: null,
    due_date: dayjs(today).format('YYYY-MM-DD'),
    due_time: null,
    is_completed: false,
    completed_at: null,
    priority: 'low',
    category: 'health',
    created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
  },
];

// Mock Notes
const notes: Note[] = [
  {
    id: generateId(),
    user_id: 'mock-user',
    title: 'Meeting Notes',
    content: 'Discuss project timeline and resource allocation',
    tags: ['work', 'meeting'],
    created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    id: generateId(),
    user_id: 'mock-user',
    title: 'Shopping List',
    content: 'Milk, eggs, bread, fruits',
    tags: ['personal', 'shopping'],
    created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    id: generateId(),
    user_id: 'mock-user',
    title: 'Book Recommendations',
    content: '1. Atomic Habits\n2. Deep Work\n3. The Psychology of Money',
    tags: ['personal', 'reading'],
    created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    id: generateId(),
    user_id: 'mock-user',
    title: 'Project Ideas',
    content:
      '1. Mobile app for habit tracking\n2. Recipe sharing platform\n3. Fitness progress tracker',
    tags: ['work', 'ideas'],
    created_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs(yesterday).format('YYYY-MM-DD HH:mm:ss'),
  },
];

// Generate past dates for habit completions
const generatePastDates = (count: number) => {
  const dates = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString());
  }

  return dates;
};

// Create completions with some random gaps
const createCompletions = (
  dates: string[],
  streak: number,
  consistency = 0.8
) => {
  return dates.map((date, index) => ({
    date,
    completed: index < streak || Math.random() < consistency,
  }));
};

// Mock Habits
const habits: Habit[] = [
  {
    id: generateId(),
    name: 'Morning Meditation',
    description: '10 minutes of mindfulness practice',
    frequency: 'daily',
    timeOfDay: new Date(today.setHours(6, 0, 0, 0)).toISOString(),
    currentStreak: 5,
    longestStreak: 12,
    color: '#9C27B0',
    createdAt: new Date(today.setDate(today.getDate() - 30)).toISOString(),
    completions: createCompletions(generatePastDates(30), 5),
  },
  {
    id: generateId(),
    name: 'Reading',
    description: 'Read at least 20 pages',
    frequency: 'daily',
    timeOfDay: new Date(today.setHours(21, 0, 0, 0)).toISOString(),
    currentStreak: 3,
    longestStreak: 7,
    color: '#2196F3',
    createdAt: new Date(today.setDate(today.getDate() - 20)).toISOString(),
    completions: createCompletions(generatePastDates(20), 3),
  },
  {
    id: generateId(),
    name: 'Exercise',
    description: '30 minutes of physical activity',
    frequency: 'custom',
    daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    timeOfDay: new Date(today.setHours(18, 0, 0, 0)).toISOString(),
    currentStreak: 2,
    longestStreak: 4,
    color: '#4CAF50',
    createdAt: new Date(today.setDate(today.getDate() - 15)).toISOString(),
    completions: createCompletions(generatePastDates(15), 2, 0.6),
  },
  {
    id: generateId(),
    name: 'Journaling',
    description: 'Write daily reflections',
    frequency: 'daily',
    timeOfDay: new Date(today.setHours(22, 0, 0, 0)).toISOString(),
    currentStreak: 0,
    longestStreak: 5,
    color: '#FF9800',
    createdAt: new Date(today.setDate(today.getDate() - 10)).toISOString(),
    completions: createCompletions(generatePastDates(10), 0, 0.5),
  },
];

export default {
  tasks,
  notes,
  habits,
};
