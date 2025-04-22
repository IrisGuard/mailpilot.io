import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, Trash2, Edit, Copy } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTemplateStore } from "@/store/template-store";
import TemplateCard from "@/components/TemplateCard";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";

export default function TemplatesScreen() {
  const router = useRouter();
  const { templates, deleteTemplate } = useTemplateStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

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

  const handleLongPress = (template) => {
    Alert.alert(
      "Template Options",
      "What would you like to do with this template?",
      [
        {
          text: "Edit",
          onPress: () => router.push(`/template/edit/${template.id}`),
          style: "default",
          icon: <Edit size={20} color={Colors.light.primary} />,
        },
        {
          text: "Duplicate",
          onPress: () => duplicateTemplate(template),
          style: "default",
          icon: <Copy size={20} color={Colors.light.primary} />,
        },
        {
          text: "Delete",
          onPress: () => confirmDelete(template),
          style: "destructive",
          icon: <Trash2 size={20} color={Colors.light.error} />,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const duplicateTemplate = (template) => {
    const { addTemplate } = useTemplateStore.getState();
    const { id, createdAt, updatedAt, ...rest } = template;
    addTemplate({
      ...rest,
      name: `${rest.name} (Copy)`,
    });
  };

  const confirmDelete = (template) => {
    Alert.alert(
      "Delete Template",
      `Are you sure you want to delete "${template.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteTemplate(template.id),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search templates..."
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/template/create")}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {templates.length === 0 ? (
        <EmptyState type="templates" />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState type="search" message="No templates match your search" />
      ) : (
        <FlatList
          data={filteredTemplates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TemplateCard
              template={item}
              onPress={() => router.push(`/template/${item.id}`)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          contentContainerStyle={styles.list}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    paddingBottom: 20,
  },
});