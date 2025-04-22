import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import {
  User,
  Mail,
  Server,
  Image as ImageIcon,
  Globe,
  Trash2,
  Info,
  ChevronRight,
  Layout,
  Upload,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { useSmtpStore } from "@/store/smtp-store";
import { useImageStore } from "@/store/image-store";
import { useHistoryStore } from "@/store/history-store";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/constants/i18n";

export default function SettingsScreen() {
  const router = useRouter();
  const smtpStore = useSmtpStore();
  const { logo } = useImageStore();
  const { clearAllHistory } = useHistoryStore();
  const { t } = useI18n();
  const [saveToHistory, setSaveToHistory] = useState(true);

  useEffect(() => {
    // Load save to history preference
    const loadSaveToHistory = async () => {
      try {
        const value = await AsyncStorage.getItem("save_to_history");
        if (value !== null) {
          setSaveToHistory(value === "true");
        }
      } catch (error) {
        console.error("Failed to load save to history preference:", error);
      }
    };

    loadSaveToHistory();
  }, []);

  const handleToggleSaveToHistory = async (value: boolean) => {
    setSaveToHistory(value);
    try {
      await AsyncStorage.setItem("save_to_history", value.toString());
    } catch (error) {
      console.error("Failed to save preference:", error);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      t("clearHistory"),
      t("confirmClearHistory"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          onPress: () => {
            clearAllHistory();
            Alert.alert(t("success"), t("historyCleared"));
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: t("settings") }} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile")}</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push("/settings/profile")}
        >
          <View style={styles.settingInfo}>
            <User size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>{t("profile")}</Text>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("emailSettings")}</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push("/settings/smtp")}
        >
          <View style={styles.settingInfo}>
            <Server size={20} color={Colors.light.primary} />
            <View>
              <Text style={styles.settingText}>{t("smtpConfiguration")}</Text>
              <Text style={styles.settingStatus}>
                {smtpStore.isConfigured ? t("configured") : t("notConfigured")}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push("/settings/logo")}
        >
          <View style={styles.settingInfo}>
            <ImageIcon size={20} color={Colors.light.primary} />
            <View>
              <Text style={styles.settingText}>{t("companyLogo")}</Text>
              <Text style={styles.settingStatus}>
                {logo ? t("uploaded") : t("notUploaded")}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push("/settings/banner")}
        >
          <View style={styles.settingInfo}>
            <Layout size={20} color={Colors.light.primary} />
            <View>
              <Text style={styles.settingText}>{t("companyBanner")}</Text>
              <Text style={styles.settingStatus}>
                {t("bannerSettings")}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("preferences")}</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Mail size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>{t("saveEmailsToHistory")}</Text>
          </View>
          <Switch
            value={saveToHistory}
            onValueChange={handleToggleSaveToHistory}
            trackColor={{
              false: Colors.light.border,
              true: Colors.light.primary,
            }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Globe size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>{t("language")}</Text>
          </View>
          <LanguageSelector />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("dataManagement")}</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleClearHistory}
        >
          <View style={styles.settingInfo}>
            <Trash2 size={20} color={Colors.light.error} />
            <Text style={[styles.settingText, styles.dangerText]}>
              {t("clearHistory")}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push("/settings/deployment")}
        >
          <View style={styles.settingInfo}>
            <Upload size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>
              {t("deployment")}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("about")}</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Info size={20} color={Colors.light.primary} />
            <View>
              <Text style={styles.settingText}>mailpilot.io</Text>
              <Text style={styles.settingStatus}>{t("version")}: 1.0.0</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  settingStatus: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginTop: 2,
  },
  dangerText: {
    color: Colors.light.error,
  },
});