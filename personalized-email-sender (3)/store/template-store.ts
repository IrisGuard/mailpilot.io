import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Template } from "@/types";
import { DEFAULT_TEMPLATES } from "@/mocks/templates";

interface TemplateState {
  templates: Template[];
  addTemplate: (template: Omit<Template, "id" | "createdAt" | "updatedAt">) => void;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  getTemplateById: (id: string) => Template | undefined;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES,
      
      addTemplate: (template) => {
        const newTemplate: Template = {
          ...template,
          id: Date.now().toString(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },
      
      updateTemplate: (id, updatedTemplate) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, ...updatedTemplate, updatedAt: Date.now() }
              : template
          ),
        }));
      },
      
      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }));
      },
      
      getTemplateById: (id) => {
        return get().templates.find((template) => template.id === id);
      },
    }),
    {
      name: "template-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the templates array, not the methods
      partialize: (state) => ({ templates: state.templates }),
    }
  )
);