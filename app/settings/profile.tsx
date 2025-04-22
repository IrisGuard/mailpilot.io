import React, { useState, useEffect } from "react";
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
import { X, User, Mail, Building, Phone } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useUserStore } from "@/store/user-store";
import { useTranslation } from "@/constants/i18n";
import Button from "@/components/Button";

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const { t } = useTranslation();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setCompany(user.company || "");
      setPhone(user.phone || "");
      setPosition(user.position || "");
    }
  }, [user]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t("error"), t("enterName"));
      return;
    }

    if (!email.trim()) {
      Alert.alert(t("error"), t("enterEmail"));
      return;
    }

    updateUser({
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      phone: phone.trim(),
      position: position.trim(),
    });

    Alert.alert(t("success"), t("profileUpdated"), [
      { text: t("ok"), onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("profile"),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          {t("profileDescription")}
        </Text>

        <View style={styles.card}>
          <View style={styles.formGroup}>
            <View style={styles.inputRow}>
              <User size={20} color={Colors.light.subtext} />
              <Text style={styles.label}>{t("fullName")}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t("fullName")}
              placeholderTextColor={Colors.light.subtext}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.inputRow}>
              <Mail size={20} color={Colors.light.subtext} />
              <Text style={styles.label}>{t("email")}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              placeholderTextColor={Colors.light.subtext}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.inputRow}>
              <Building size={20} color={Colors.light.subtext} />
              <Text style={styles.label}>{t("company")}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder={t("company")}
              placeholderTextColor={Colors.light.subtext}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.inputRow}>
              <User size={20} color={Colors.light.subtext} />
              <Text style={styles.label}>{t("position")}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={position}
              onChangeText={setPosition}
              placeholder={t("position")}
              placeholderTextColor={Colors.light.subtext}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.inputRow}>
              <Phone size={20} color={Colors.light.subtext} />
              <Text style={styles.label}>{t("phone")}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t("phone")}
              placeholderTextColor={Colors.light.subtext}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Button
          title={t("saveProfile")}
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
  description: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: 20,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  saveButton: {
    marginBottom: 40,
  },
});