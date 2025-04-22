import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { X } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useContactStore } from "@/store/contact-store";
import Button from "@/components/Button";
import { validateEmail } from "@/utils/email";

export default function CreateContactScreen() {
  const router = useRouter();
  const { addContact } = useContactStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a contact name");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    addContact({
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      role: role.trim(),
      notes: notes.trim(),
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor={Colors.light.subtext}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            placeholderTextColor={Colors.light.subtext}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Company</Text>
          <TextInput
            style={styles.input}
            value={company}
            onChangeText={setCompany}
            placeholder="Company Name"
            placeholderTextColor={Colors.light.subtext}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Role</Text>
          <TextInput
            style={styles.input}
            value={role}
            onChangeText={setRole}
            placeholder="Job Title"
            placeholderTextColor={Colors.light.subtext}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional information..."
            placeholderTextColor={Colors.light.subtext}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Button
          title="Save Contact"
          onPress={handleSave}
          style={styles.saveButton}
        />
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  notesInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 120,
  },
  saveButton: {
    marginBottom: 40,
  },
});