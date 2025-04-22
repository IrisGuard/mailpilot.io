import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/id';

export interface EmailHistory {
  id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  date: string;
  status: 'sent' | 'failed' | 'draft';
  error?: string;
  templateId?: string;
  contactIds?: string[];
}

interface HistoryState {
  history: EmailHistory[];
  
  addToHistory: (email: Omit<EmailHistory, 'id' | 'date'>) => void;
  updateHistory: (id: string, updates: Partial<EmailHistory>) => void;
  removeFromHistory: (id: string) => void;
  clearAllHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      
      addToHistory: (email) => set((state) => ({
        history: [
          {
            ...email,
            id: generateId(),
            date: new Date().toISOString(),
          },
          ...state.history,
        ],
      })),
      
      updateHistory: (id, updates) => set((state) => ({
        history: state.history.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      })),
      
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((item) => item.id !== id),
      })),
      
      clearAllHistory: () => set({ history: [] }),
    }),
    {
      name: 'history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);