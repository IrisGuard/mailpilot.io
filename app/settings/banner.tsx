import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Upload, Trash2, Info } from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import { useTranslation } from "@/constants/i18n";

// Sample banner image from the web
const SAMPLE_BANNER = "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1080&auto=format&fit=crop";

export default function BannerSettingsScreen() {
  const [banner, setBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Load banner on component mount
  React.useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    try {
      const savedBanner = await AsyncStorage.getItem("company_banner");
      if (savedBanner) {
        setBanner(savedBanner);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load banner:", error);
      setLoading(false);
    }
  };

  const saveBanner = async (uri: string) => {
    try {
      await AsyncStorage.setItem("company_banner", uri);
      setBanner(uri);
      Alert.alert(t("success"), t("bannerUpdated"));
    } catch (error) {
      console.error("Failed to save banner:", error);
      Alert.alert(t("error"), String(error));
    }
  };

  const removeBanner = async () => {
    Alert.alert(
      t("removeBanner"),
      t("confirmRemoveBanner"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("company_banner");
              setBanner(null);
              Alert.alert(t("success"), t("bannerRemoved"));
            } catch (error) {
              console.error("Failed to remove banner:", error);
              Alert.alert(t("error"), String(error));
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        t("error"),
        "We need camera roll permissions to upload your banner."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      saveBanner(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: t("bannerSettings") }} />

      <Text style={styles.description}>{t("bannerDescription")}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("currentBanner")}</Text>
        {banner ? (
          <View style={styles.bannerContainer}>
            <Image source={{ uri: banner }} style={styles.banner} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeBanner}
            >
              <Trash2 size={20} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noBannerContainer}>
            <Text style={styles.noBannerText}>{t("notUploaded")}</Text>
            <Image 
              source={{ uri: SAMPLE_BANNER }} 
              style={styles.sampleBanner} 
              resizeMode="cover"
            />
            <Text style={styles.sampleText}>
              {t("bannerTip")}
            </Text>
          </View>
        )}
      </View>

      <Button
        title={banner ? t("uploadBanner") : t("uploadBanner")}
        onPress={pickImage}
        icon={<Upload size={18} color="#fff" />}
        style={styles.uploadButton}
      />

      <View style={styles.tipContainer}>
        <Info size={18} color={Colors.light.subtext} />
        <Text style={styles.tipText}>
          {t("bannerTip")}
        </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  bannerContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    height: 120,
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 8,
  },
  noBannerContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
    padding: 16,
    height: 120,
  },
  noBannerText: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: 8,
  },
  sampleBanner: {
    width: "100%",
    height: 60,
    borderRadius: 4,
    marginVertical: 8,
  },
  sampleText: {
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: "center",
  },
  uploadButton: {
    marginBottom: 24,
  },
  tipContainer: {
    flexDirection: "row",
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: "flex-start",
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.light.subtext,
    flex: 1,
    lineHeight: 20,
  },
});