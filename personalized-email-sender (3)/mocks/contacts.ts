import { Contact } from "@/types";

export const DEFAULT_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Αλέξανδρος Παπαδόπουλος",
    email: "alex@example.com",
    company: "ΤεχνοΕταιρεία",
    role: "Τεχνικός Διευθυντής",
    notes: "Συναντηθήκαμε στο ΤεχνοΣυνέδριο 2023",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "2",
    name: "Σοφία Αντωνίου",
    email: "sofia@example.com",
    company: "Σχεδιαστικό Στούντιο",
    role: "Δημιουργικός Διευθυντής",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "3",
    name: "Γιώργος Δημητρίου",
    email: "giorgos@example.com",
    company: "ΚαινοτομίαΑΕ",
    role: "Ιδρυτής",
    notes: "Ενδιαφέρεται για συνεργασία",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];