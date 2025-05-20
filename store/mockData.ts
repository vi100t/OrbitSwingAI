import { Task } from '@/types/task';
import { Note } from '@/types/note';
import { Habit } from '@/types/habit';

// Helper to generate random IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

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
    title: 'Complete project presentation',
    description: 'Finish slides and prepare notes for the team meeting',
    dueDate: tomorrow.toISOString(),
    dueTime: new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString(),
    isCompleted: false,
    priority: 'high',
    subTasks: [
      { id: generateId(), title: 'Prepare slides', isCompleted: true },
      { id: generateId(), title: 'Practice delivery', isCompleted: false },
      { id: generateId(), title: 'Gather feedback', isCompleted: false },
    ],
    category: 'work',
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
  },
  {
    id: generateId(),
    title: 'Grocery shopping',
    description: 'Buy fruits, vegetables, and snacks',
    dueDate: today.toISOString(),
    isCompleted: false,
    priority: 'medium',
    subTasks: [
      { id: generateId(), title: 'Make shopping list', isCompleted: true },
      { id: generateId(), title: 'Check pantry inventory', isCompleted: true },
      { id: generateId(), title: 'Visit supermarket', isCompleted: false },
    ],
    category: 'personal',
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
  },
  {
    id: generateId(),
    title: 'Call mom',
    description: "Don't forget to wish her happy birthday",
    dueDate: today.toISOString(),
    dueTime: new Date(today.setHours(18, 0, 0, 0)).toISOString(),
    isCompleted: true,
    completedAt: new Date(today.setHours(17, 30, 0, 0)).toISOString(),
    priority: 'high',
    category: 'personal',
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
  },
  {
    id: generateId(),
    title: 'Review quarterly reports',
    description: 'Analyze Q2 performance and prepare summary',
    dueDate: tomorrow.toISOString(),
    isCompleted: false,
    priority: 'medium',
    category: 'work',
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
  },
  {
    id: generateId(),
    title: 'Schedule dentist appointment',
    dueDate: today.toISOString(),
    isCompleted: false,
    priority: 'low',
    category: 'health',
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
  },
];

// Mock Notes
const notes: Note[] = [
  {
    id: generateId(),
    title: 'Meeting Notes',
    content: 'Discussed new project timeline. Key points:\n- Launch in September\n- Marketing starts in August\n- Team assignments need to be finalized by Friday\n\nFollow up with Sarah about the budget approval.',
    tags: ['work', 'meeting'],
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
  },
  {
    id: generateId(),
    title: 'Book Recommendations',
    content: '1. Atomic Habits by James Clear\n2. Deep Work by Cal Newport\n3. The Psychology of Money by Morgan Housel\n\nStart with Atomic Habits.',
    tags: ['reading', 'personal'],
    createdAt: new Date(yesterday.setDate(yesterday.getDate() - 2)).toISOString(),
    updatedAt: yesterday.toISOString(),
  },
  {
    id: generateId(),
    title: 'Weekly Goals',
    content: '- Complete project presentation\n- Run 3 times\n- Read 2 chapters of current book\n- Meal prep for the week\n- Call grandparents',
    tags: ['goals', 'personal'],
    createdAt: new Date(yesterday.setDate(yesterday.getDate() - 1)).toISOString(),
    updatedAt: yesterday.toISOString(),
  },
  {
    id: generateId(),
    title: 'Gift Ideas',
    content: "Mom's Birthday:\n- Scented candles\n- Cooking class voucher\n- Handmade photo album\n\nDad's Birthday:\n- Grilling accessories\n- Wireless headphones\n- Golf lessons",
    tags: ['shopping', 'personal'],
    createdAt: new Date(yesterday.setDate(yesterday.getDate() - 5)).toISOString(),
    updatedAt: yesterday.toISOString(),
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
const createCompletions = (dates: string[], streak: number, consistency = 0.8) => {
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