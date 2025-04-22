import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Plus, UserPlus, Import, Search as SearchIcon } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useContactStore } from "@/store/contact-store";
import { useSmtpStore } from "@/store/smtp-store";
import ContactCard from "@/components/ContactCard";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import { useTranslation } from "@/constants/i18n";
import { Contact } from "@/types";

export default function ContactsScreen() {
  const router = useRouter();
  const { contacts, deleteContact } = useContactStore();
  const { isConfigured } = useSmtpStore();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          (contact) =>
            contact.name.toLowerCase().includes(query) ||
            contact.email.toLowerCase().includes(query) ||
            (contact.company && contact.company.toLowerCase().includes(query)) ||
            (contact.role && contact.role.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, contacts]);
  
  const handleContactPress = (contact: Contact) => {
    router.push(`/contact/${contact.id}`);
  };
  
  const handleContactLongPress = (contact: Contact) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t("cancel"), t("sendEmail"), t("edit"), t("delete")],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
          title: contact.name,
          message: t("whatWouldYouLikeToDoWithThisContact"),
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Send Email
            if (!isConfigured()) {
              Alert.alert(
                t("smtpNotConfigured"),
                t("configureSmtpFirst"),
                [
                  { text: t("cancel"), style: "cancel" },
                  {
                    text: t("configureNow"),
                    onPress: () => router.push("/settings/smtp"),
                  },
                ]
              );
              return;
            }
            router.push(`/compose/select/${contact.id}`);
          } else if (buttonIndex === 2) {
            // Edit
            router.push(`/contact/edit/${contact.id}`);
          } else if (buttonIndex === 3) {
            // Delete
            Alert.alert(
              t("deleteContact"),
              t("deleteContactConfirm", { name: contact.name }),
              [
                { text: t("cancel"), style: "cancel" },
                {
                  text: t("delete"),
                  style: "destructive",
                  onPress: () => {
                    deleteContact(contact.id);
                  },
                },
              ]
            );
          }
        }
      );
    } else {
      // For Android, implement a modal or a different UI
      Alert.alert(
        contact.name,
        t("whatWouldYouLikeToDoWithThisContact"),
        [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("sendEmail"),
            onPress: () => {
              if (!isConfigured()) {
                Alert.alert(
                  t("smtpNotConfigured"),
                  t("configureSmtpFirst"),
                  [
                    { text: t("cancel"), style: "cancel" },
                    {
                      text: t("configureNow"),
                      onPress: () => router.push("/settings/smtp"),
                    },
                  ]
                );
                return;
              }
              router.push(`/compose/select/${contact.id}`);
            },
          },
          {
            text: t("edit"),
            onPress: () => router.push(`/contact/edit/${contact.id}`),
          },
          {
            text: t("delete"),
            style: "destructive",
            onPress: () => {
              Alert.alert(
                t("deleteContact"),
                t("deleteContactConfirm", { name: contact.name }),
                [
                  { text: t("cancel"), style: "cancel" },
                  {
                    text: t("delete"),
                    style: "destructive",
                    onPress: () => {
                      deleteContact(contact.id);
                    },
                  },
                ]
              );
            },
          },
        ]
      );
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("contacts"),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => router.push("/contact/import")}
                style={styles.headerButton}
              >
                <Import size={22} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/contact/create")}
                style={styles.headerButton}
              >
                <Plus size={22} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t("searchContacts")}
      />
      
      {contacts.length === 0 ? (
        <EmptyState
          type="contacts"
          title={t("noContactsYet")}
          message={t("addContactDescription")}
          actionLabel={t("addContact")}
          onAction={() => router.push("/contact/create")}
        />
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          type="search"
          title={t("noResults")}
          message={t("tryDifferentSearch")}
        />
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={({ item }) => (
            <ContactCard
              contact={item}
              onPress={() => handleContactPress(item)}
              onLongPress={() => handleContactLongPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/contact/create")}
      >
        <UserPlus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 80,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});