import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ImageState {
  logo: string | null;
  banner: string | null;
  
  setLogo: (logo: string | null) => void;
  setBanner: (banner: string | null) => void;
}

export const useImageStore = create<ImageState>()(
  persist(
    (set) => ({
      logo: null,
      banner: null,
      
      setLogo: (logo) => set({ logo }),
      setBanner: (banner) => set({ banner }),
    }),
    {
      name: 'image-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);