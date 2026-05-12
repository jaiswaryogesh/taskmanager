import { create } from 'zustand';
import api from '../lib/axios';

export interface Task {
  _id: string;
  title: string;
  description: string;
  completedBy: string[]; // User IDs
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: (workspaceId: string) => Promise<void>;
  createTask: (task: any) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async (workspaceId: string) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/tasks?workspaceId=${workspaceId}`);
      set({ tasks: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    set((state) => ({ tasks: [...state.tasks, data] }));
  },

  toggleTaskCompletion: async (taskId) => {
    // We don't do optimistic UI update easily because we don't have the user ID here in the store natively.
    // It's safer to just let the backend return the populated task and update it.
    
    try {
      const { data } = await api.put(`/tasks/${taskId}/toggle`);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? data : t)),
      }));
    } catch (error) {
      console.error(error);
    }
  },

  setTasks: (tasks) => set({ tasks }),
}));
