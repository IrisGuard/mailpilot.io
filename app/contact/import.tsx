import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { X, Mail, Building2, UserPlus, CheckCircle } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useContactStore } from "@/store/contact-store";
import Button from "@/components/Button";
import { useTranslation } from "@/constants/i18n";

// Define the Contact type for this component
interface Contact {
  name: string;
  email: string;
  company?: string;
  role?: string;
  notes?: string;
}

export default function ImportContactsScreen() {
  const router = useRouter();
  const { addContacts } = useContactStore();
  const { t } = useTranslation();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [importedContacts, setImportedContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Mock function to simulate Gmail connection
  const connectToGmail = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data
      const mockContacts = [
        {
          name: "John Doe",
          email: "john.doe@example.com",
          company: "Acme Inc.",
          role: "CEO",
          notes: "",
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          company: "Tech Solutions",
          role: "CTO",
          notes: "",
        },
        {
          name: "Michael Johnson",
          email: "michael.johnson@example.com",
          company: "Global Corp",
          role: "Marketing Director",
          notes: "",
        },
        {
          name: "Sarah Williams",
          email: "sarah.williams@example.com",
          company: "Design Studio",
          role: "Lead Designer",
          notes: "",
        },
        {
          name: "Robert Brown",
          email: "robert.brown@example.com",
          company: "Finance Group",
          role: "CFO",
          notes: "",
        },
      ];
      
      setImportedContacts(mockContacts);
    } catch (err) {
      setError("Failed to connect to Gmail. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };
  
  const toggleContactSelection = (contact: Contact) => {
    if (selectedContacts.some(c => c.email === contact.email)) {
      setSelectedContacts(selectedContacts.filter(c => c.email !== contact.email));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };
  
  const handleImportSelected = () => {
    if (selectedContacts.length === 0) {
      Alert.alert(t("error"), t("selectAtLeastOneContact"));
      return;
    }
    
    // Validate emails
    const invalidEmails = selectedContacts.filter(
      contact => !contact.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    );
    
    if (invalidEmails.length > 0) {
      Alert.alert(
        t("invalidEmails"),
        t("someEmailsAreInvalid")
      );
      return;
    }
    
    // Import contacts
    addContacts(selectedContacts);
    
    Alert.alert(
      t("success"),
      t("contactsImported"),
      [{ text: t("ok"), onPress: () => router.back() }]
    );
  };
  
  const renderContactItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.some(c => c.email === item.email);
    
    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.contactItemSelected]}
        onPress={() => toggleContactSelection(item)}
      >
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactEmail}>{item.email}</Text>
          {item.company && (
            <View style={styles.companyContainer}>
              <Building2 size={12} color={Colors.light.subtext} />
              <Text style={styles.company}>
                {item.company}
                {item.role ? ` • ${item.role}` : ""}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.checkboxContainer}>
          {isSelected && <CheckCircle size={20} color={Colors.light.primary} />}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("importContacts"),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          {t("importContactsDescription")}
        </Text>
        
        <Button
          title={isConnecting ? t("connecting") : t("connectToGmail")}
          onPress={connectToGmail}
          style={styles.gmailButton}
          disabled={isConnecting}
          leftIcon={<Mail size={18} color="#fff" />}
        />
        
        <View style={styles.orContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>{t("or")}</Text>
          <View style={styles.divider} />
        </View>
        
        <Button
          title={t("manuallyAddContact")}
          onPress={() => router.push("/contact/create")}
          variant="outline"
          style={styles.manualButton}
          leftIcon={<UserPlus size={18} color={Colors.light.primary} />}
        />
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        {importedContacts.length > 0 && (
          <View style={styles.importedContainer}>
            <View style={styles.importedHeader}>
              <Text style={styles.importedTitle}>
                {t("foundContacts")} ({importedContacts.length})
              </Text>
              <Text style={styles.selectedCount}>
                {selectedContacts.length} {t("selected")}
              </Text>
            </View>
            
            <FlatList
              data={importedContacts}
              renderItem={renderContactItem}
              keyExtractor={(item) => item.email}
              scrollEnabled={false}
              style={styles.contactsList}
            />
            
            <Button
              title={t("importSelectedContacts")}
              onPress={handleImportSelected}
              disabled={selectedContacts.length === 0}
              style={styles.importButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 24,
    lineHeight: 22,
  },
  gmailButton: {
    marginBottom: 24,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  orText: {
    marginHorizontal: 16,
    color: Colors.light.subtext,
    fontSize: 14,
  },
  manualButton: {
    marginBottom: 32,
  },
  errorText: {
    color: Colors.light.error,
    marginBottom: 16,
  },
  importedContainer: {
    marginBottom: 40,
  },
  importedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  importedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  selectedCount: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  contactsList: {
    marginBottom: 16,
  },
  contactItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  contactItemSelected: {
    backgroundColor: `${Colors.light.primary}10`,
    borderColor: Colors.light.primary,
    borderWidth: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  companyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  company: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  importButton: {
    marginTop: 8,
  },
});