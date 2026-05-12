import { create } from 'zustand';
import api from '../lib/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  team?: string;
  pendingInvitations?: any[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  respondToInvitation: (teamId: string, action: 'accept' | 'reject') => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    set({ user: data, isAuthenticated: true });
  },

  register: async (credentials) => {
    const { data } = await api.post('/auth/register', credentials);
    set({ user: data, isAuthenticated: true });
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/profile');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    set({ user: response.data });
  },

  respondToInvitation: async (teamId, action) => {
    const response = await api.put(`/users/team/invitations/${teamId}/respond`, { action });
    set({ user: response.data.user });
  },
}));
