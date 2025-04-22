import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Contact } from "@/types";
import { generateId } from "@/utils/id";

// Sample contact for testing
const SAMPLE_CONTACTS: Contact[] = [
  {
    id: "sample-contact-1",
    name: "John Doe",
    email: "john.doe@example.com",
    company: "Example Corp",
    role: "Marketing Manager",
    notes: "Met at the marketing conference in June.",
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "sample-contact-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    company: "Tech Solutions",
    role: "CEO",
    notes: "Interested in our premium plan.",
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "sample-contact-3",
    name: "George Papadopoulos",
    email: "george.p@example.gr",
    company: "Hellenic Tech",
    role: "CTO",
    notes: "Met at Athens Tech Conference",
    createdAt: Date.now() - 259200000, // 3 days ago
    updatedAt: Date.now() - 172800000, // 2 days ago
  },
];

interface ContactState {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => string;
  updateContact: (id: string, contact: Partial<Omit<Contact, "id" | "createdAt" | "updatedAt">>) => void;
  deleteContact: (id: string) => void;
  getContactById: (id: string) => Contact | undefined;
}

export const useContactStore = create<ContactState>()(
  persist(
    (set, get) => ({
      contacts: SAMPLE_CONTACTS,
      
      addContact: (contact) => {
        const id = generateId();
        const timestamp = Date.now();
        
        const newContact: Contact = {
          ...contact,
          id,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        
        set((state) => ({
          contacts: [newContact, ...state.contacts],
        }));
        
        return id;
      },
      
      updateContact: (id, contact) => {
        set((state) => ({
          contacts: state.contacts.map((item) =>
            item.id === id
              ? { ...item, ...contact, updatedAt: Date.now() }
              : item
          ),
        }));
      },
      
      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== id),
        }));
      },
      
      getContactById: (id) => {
        return get().contacts.find((contact) => contact.id === id);
      },
    }),
    {
      name: "contact-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the contacts array, not the methods
      partialize: (state) => ({ contacts: state.contacts }),
    }
  )
);