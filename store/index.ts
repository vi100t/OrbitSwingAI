import { create } from 'zustand';
import { Task } from '@/types/task';
import { Note } from '@/types/note';
import { Habit } from '@/types/habit';
import mockData from './mockData';

interface Settings {
  darkMode: boolean;
  notifications: boolean;
  cloudSync: boolean;
  reminderTime: string; // ISO string
}

interface AppState {
  tasks: Task[];
  notes: Note[];
  habits: Habit[];
  settings: Settings;
  
  // Tasks
  addTask: (task: Task) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  
  // Notes
  addNote: (note: Note) => void;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Habits
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updatedHabit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  
  // Settings
  updateSettings: (updatedSettings: Partial<Settings>) => void;
  
  // Activity
  getActivityForDate: (date: Date) => number;
  
  // Data initialization
  initializeData: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  notes: [],
  habits: [],
  settings: {
    darkMode: false,
    notifications: true,
    cloudSync: true,
    reminderTime: new Date().toISOString(),
  },
  
  // Tasks
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTask: (id, updatedTask) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updatedTask, updatedAt: new Date().toISOString() } : task
    ),
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),
  
  toggleTaskCompletion: (id) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            isCompleted: !task.isCompleted,
            completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          }
        : task
    ),
  })),
  
  // Notes
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  
  updateNote: (id, updatedNote) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() } : note
    ),
  })),
  
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((note) => note.id !== id),
  })),
  
  // Habits
  addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
  
  updateHabit: (id, updatedHabit) => set((state) => ({
    habits: state.habits.map((habit) =>
      habit.id === id ? { ...habit, ...updatedHabit } : habit
    ),
  })),
  
  deleteHabit: (id) => set((state) => ({
    habits: state.habits.filter((habit) => habit.id !== id),
  })),
  
  toggleHabitCompletion: (id, date) => set((state) => {
    const habit = state.habits.find((h) => h.id === id);
    if (!habit) return state;
    
    const existingCompletion = habit.completions.find((c) => c.date.split('T')[0] === date.split('T')[0]);
    
    let newCompletions;
    if (existingCompletion) {
      newCompletions = habit.completions.map((c) =>
        c.date.split('T')[0] === date.split('T')[0] ? { ...c, completed: !c.completed } : c
      );
    } else {
      newCompletions = [...habit.completions, { date, completed: true }];
    }
    
    // Calculate streaks
    const sortedCompletions = [...newCompletions]
      .filter((c) => c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Current streak calculation (consecutive days from today)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i].date);
      completionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (completionDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return {
      habits: state.habits.map((h) =>
        h.id === id
          ? {
              ...h,
              completions: newCompletions,
              currentStreak,
              longestStreak: Math.max(h.longestStreak, currentStreak),
            }
          : h
      ),
    };
  }),
  
  // Settings
  updateSettings: (updatedSettings) => set((state) => ({
    settings: { ...state.settings, ...updatedSettings },
  })),
  
  // Activity
  getActivityForDate: (date) => {
    const { tasks, habits } = get();
    const dateStr = date.toISOString().split('T')[0];
    
    // Count completed tasks for this date
    const completedTasks = tasks.filter(
      (task) => task.isCompleted && task.completedAt?.split('T')[0] === dateStr
    ).length;
    
    // Count completed habits for this date
    const completedHabits = habits.reduce((count, habit) => {
      const isCompleted = habit.completions.some(
        (c) => c.date.split('T')[0] === dateStr && c.completed
      );
      return isCompleted ? count + 1 : count;
    }, 0);
    
    return completedTasks + completedHabits;
  },
  
  // Initialize with mock data
  initializeData: () => set(() => ({
    tasks: mockData.tasks,
    notes: mockData.notes,
    habits: mockData.habits,
  })),
}));