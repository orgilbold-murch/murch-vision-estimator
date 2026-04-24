import type { StateCreator } from 'zustand';
import type { User } from '@/types';

export interface AuthSlice {
  currentUserId: string | null;
  users: User[];
  setCurrentUser: (id: string) => void;
  setUsers: (users: User[]) => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  currentUserId: null,
  users: [],
  setCurrentUser: (id) => set({ currentUserId: id }),
  setUsers: (users) => set({ users }),
});
