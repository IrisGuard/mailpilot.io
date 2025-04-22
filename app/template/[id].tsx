import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Edit,
  Trash2,
  Copy,
  Send,
  ChevronRight,
  Info,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTemplateStore } from "@/store/template-store";
import { useContactStore } from "@/store/contact-store";
import Button from "@/components/Button";
import ContactCard from "@/components/ContactCard";
import { useTranslation } from "@/constants/i18n";

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getTemplateById, deleteTemplate } = useTemplateStore();
  const { contacts } = useContactStore();
  const { t } = useTranslation();
  const template = getTemplateById(id as string);
  const recentContacts = [...contacts].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);

  if (!template) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>{t("emailNotFound")}</Text>
        <Button
          title={t("back")}
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      t("delete"),
      `${t("deleteContactConfirm", { name: template.name })}`,
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          onPress: () => {
            deleteTemplate(template.id);
            router.back();
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleDuplicate = () => {
    const { addTemplate } = useTemplateStore.getState();
    const { id, createdAt, updatedAt, ...rest } = template;
    addTemplate({
      ...rest,
      name: `${rest.name} (${t("copy")})`,
    });
    Alert.alert(t("success"), t("templateSaved"));
  };

  const handleSendEmail = () => {
    if (contacts.length === 0) {
      Alert.alert(
        t("noContacts"),
        t("addContactFirst"),
        [
          {
            text: t("addContact"),
            onPress: () => router.push("/contact/create"),
          },
          {
            text: t("cancel"),
            style: "cancel",
          },
        ]
      );
      return;
    }

    if (contacts.length === 1) {
      router.push(`/compose/${template.id}/${contacts[0].id}`);
      return;
    }

    // If we have recent contacts, show them
    if (recentContacts.length > 0) {
      router.push("/");
    } else {
      router.push("/contacts");
    }
  };

  // Function to replace variables in the template body
  const processTemplateBody = (body: string) => {
    // Replace {{company}} with a placeholder if it's in the template
    return body.replace(/{{company}}/g, "[Εταιρεία]");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: template.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/template/edit/${template.id}`)}
              style={{ marginRight: 8 }}
            >
              <Edit size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.card}>
        <Text style={styles.label}>{t("subject")}</Text>
        <Text style={styles.subject}>{template.subject}</Text>

        <Text style={styles.label}>{t("emailBody")}</Text>
        <View style={styles.bodyContainer}>
          <Text style={styles.body}>{processTemplateBody(template.body)}</Text>
        </View>
      </View>

      <View style={styles.variablesInfo}>
        <Info size={16} color={Colors.light.subtext} />
        <Text style={styles.variablesText}>
          {t("emailPreviewNote")}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title={t("sendEmail")}
          onPress={handleSendEmail}
          icon={<Send size={16} color="#fff" />}
          style={styles.sendButton}
        />
        <View style={styles.secondaryActions}>
          <Button
            title={t("copy")}
            onPress={handleDuplicate}
            variant="outline"
            icon={<Copy size={16} color={Colors.light.primary} />}
            style={styles.actionButton}
          />
          <Button
            title={t("delete")}
            onPress={handleDelete}
            variant="outline"
            icon={<Trash2 size={16} color={Colors.light.error} />}
            style={[styles.actionButton, styles.deleteButton]}
            textStyle={styles.deleteButtonText}
          />
        </View>
      </View>

      {recentContacts.length > 0 && (
        <View style={styles.contactsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("to")}</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push("/contacts")}
            >
              <Text style={styles.seeAllText}>{t("seeAll")}</Text>
              <ChevronRight size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>

          {recentContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onPress={() => router.push(`/compose/${template.id}/${contact.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: Colors.light.text,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.subtext,
    marginBottom: 8,
  },
  subject: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  bodyContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  variablesInfo: {
    flexDirection: "row",
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: "center",
    gap: 8,
  },
  variablesText: {
    fontSize: 14,
    color: Colors.light.subtext,
    flex: 1,
  },
  actions: {
    marginBottom: 24,
  },
  sendButton: {
    marginBottom: 12,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: Colors.light.error,
  },
  deleteButtonText: {
    color: Colors.light.error,
  },
  contactsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500",
  },
});