import React from "react";
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
  Mail,
  User,
  AtSign,
  Building2,
  Briefcase,
  StickyNote,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useContactStore } from "@/store/contact-store";
import { useTemplateStore } from "@/store/template-store";
import Button from "@/components/Button";
import TemplateCard from "@/components/TemplateCard";

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getContactById, deleteContact } = useContactStore();
  const { templates } = useTemplateStore();
  const contact = getContactById(id as string);
  const recentTemplates = [...templates].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);

  if (!contact) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Contact not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete "${contact.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            deleteContact(contact.id);
            router.back();
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSendEmail = () => {
    if (templates.length === 0) {
      Alert.alert(
        "No Templates",
        "You need to create a template before sending an email.",
        [
          {
            text: "Create Template",
            onPress: () => router.push("/template/create"),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
      return;
    }

    if (templates.length === 1) {
      router.push(`/compose/${templates[0].id}/${contact.id}`);
      return;
    }

    // If we have recent templates, show them
    if (recentTemplates.length > 0) {
      router.push("/");
    } else {
      router.push("/templates");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: contact.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/contact/edit/${contact.id}`)}
              style={{ marginRight: 8 }}
            >
              <Edit size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {contact.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <User size={18} color={Colors.light.subtext} />
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{contact.name}</Text>
          </View>

          <View style={styles.infoItem}>
            <AtSign size={18} color={Colors.light.subtext} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{contact.email}</Text>
          </View>

          {contact.company && (
            <View style={styles.infoItem}>
              <Building2 size={18} color={Colors.light.subtext} />
              <Text style={styles.infoLabel}>Company</Text>
              <Text style={styles.infoValue}>{contact.company}</Text>
            </View>
          )}

          {contact.role && (
            <View style={styles.infoItem}>
              <Briefcase size={18} color={Colors.light.subtext} />
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{contact.role}</Text>
            </View>
          )}

          {contact.notes && (
            <View style={styles.notesContainer}>
              <View style={styles.notesHeader}>
                <StickyNote size={18} color={Colors.light.subtext} />
                <Text style={styles.notesLabel}>Notes</Text>
              </View>
              <Text style={styles.notesValue}>{contact.notes}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Send Email"
          onPress={handleSendEmail}
          icon={<Mail size={16} color="#fff" />}
          style={styles.sendButton}
        />
        <Button
          title="Delete Contact"
          onPress={handleDelete}
          variant="outline"
          icon={<Trash2 size={16} color={Colors.light.error} />}
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />
      </View>

      {recentTemplates.length > 0 && (
        <View style={styles.templatesSection}>
          <Text style={styles.sectionTitle}>Email Templates</Text>
          {recentTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
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
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.light.secondary}30`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "600",
    color: Colors.light.secondary,
  },
  infoContainer: {
    width: "100%",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.subtext,
    width: 80,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  notesContainer: {
    paddingVertical: 12,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.subtext,
    marginLeft: 8,
  },
  notesValue: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  actions: {
    marginBottom: 24,
  },
  sendButton: {
    marginBottom: 12,
  },
  deleteButton: {
    borderColor: Colors.light.error,
  },
  deleteButtonText: {
    color: Colors.light.error,
  },
  templatesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
});