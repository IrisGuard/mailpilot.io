import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { X, ChevronRight, Search as SearchIcon } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTemplateStore } from "@/store/template-store";
import { useContactStore } from "@/store/contact-store";
import { useSmtpStore } from "@/store/smtp-store";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import { useTranslation } from "@/constants/i18n";
import { Template } from "@/types";

export default function SelectTemplateScreen() {
  const { contactId } = useLocalSearchParams();
  const router = useRouter();
  const { templates } = useTemplateStore();
  const { getContactById } = useContactStore();
  const { isConfigured } = useSmtpStore();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  
  const contact = getContactById(contactId as string);
  
  useEffect(() => {
    if (!isConfigured()) {
      Alert.alert(
        t("smtpNotConfigured"),
        t("configureSmtpFirst"),
        [
          { text: t("cancel"), style: "cancel", onPress: () => router.back() },
          {
            text: t("configureNow"),
            onPress: () => router.push("/settings/smtp"),
          },
        ]
      );
    }
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTemplates(templates);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTemplates(
        templates.filter(
          (template) =>
            template.name.toLowerCase().includes(query) ||
            template.subject.toLowerCase().includes(query) ||
            template.body.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, templates]);
  
  const handleTemplatePress = (template: Template) => {
    router.push(`/compose/${template.id}/${contactId}`);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("chooseTemplateForEmail"),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {contact && (
        <View style={styles.contactCard}>
          <Text style={styles.contactCardLabel}>{t("sendingTo", { name: contact.name })}</Text>
          <Text style={styles.contactCardEmail}>{contact.email}</Text>
        </View>
      )}
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t("searchTemplates")}
      />
      
      {templates.length === 0 ? (
        <EmptyState
          type="templates"
          title={t("noTemplates")}
          message={t("createTemplateFirst")}
          actionLabel={t("createTemplate")}
          onAction={() => router.push("/template/create")}
        />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          type="search"
          title={t("noResults")}
          message={t("tryDifferentSearch")}
        />
      ) : (
        <FlatList
          data={filteredTemplates}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.templateItem}
              onPress={() => handleTemplatePress(item)}
            >
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{item.name}</Text>
                <Text style={styles.templateSubject} numberOfLines={1}>
                  {item.subject}
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.light.subtext} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  contactCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  contactCardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  contactCardEmail: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  listContent: {
    paddingBottom: 20,
  },
  templateItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  templateSubject: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
});