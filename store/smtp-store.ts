import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SmtpState {
  host: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  useTLS: boolean;
  saveToHistory: boolean;
  isConfigured: boolean;
  
  setHost: (host: string) => void;
  setPort: (port: number) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setFromName: (fromName: string) => void;
  setFromEmail: (fromEmail: string) => void;
  setUseTLS: (useTLS: boolean) => void;
  setSaveToHistory: (saveToHistory: boolean) => void;
  setIsConfigured: (isConfigured: boolean) => void;
  resetSettings: () => void;
}

export const useSmtpStore = create<SmtpState>()(
  persist(
    (set) => ({
      host: '',
      port: 587,
      username: '',
      password: '',
      fromName: '',
      fromEmail: '',
      useTLS: true,
      saveToHistory: true,
      isConfigured: false,
      
      setHost: (host) => set({ host }),
      setPort: (port) => set({ port }),
      setUsername: (username) => set({ username }),
      setPassword: (password) => set({ password }),
      setFromName: (fromName) => set({ fromName }),
      setFromEmail: (fromEmail) => set({ fromEmail }),
      setUseTLS: (useTLS) => set({ useTLS }),
      setSaveToHistory: (saveToHistory) => set({ saveToHistory }),
      setIsConfigured: (isConfigured) => set({ isConfigured }),
      resetSettings: () => set({
        host: '',
        port: 587,
        username: '',
        password: '',
        fromName: '',
        fromEmail: '',
        useTLS: true,
        saveToHistory: true,
        isConfigured: false,
      }),
    }),
    {
      name: 'smtp-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);