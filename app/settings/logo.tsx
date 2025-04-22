import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { X, Info } from "lucide-react-native";
import { Image as ExpoImage } from "expo-image";
import Colors from "@/constants/colors";
import { useImageStore } from "@/store/image-store";
import Button from "@/components/Button";
import ImagePicker from "@/components/ImagePicker";
import { useTranslation } from "@/constants/i18n";

export default function LogoSettingsScreen() {
  const router = useRouter();
  const { logo, banner, setLogo, setBanner, clearLogo, clearBanner } = useImageStore();
  const [logoUri, setLogoUri] = useState<string | null>(logo?.uri || null);
  const [bannerUri, setBannerUri] = useState<string | null>(banner?.uri || null);
  const { t } = useTranslation();

  const handleLogoSelected = (uri: string, name: string) => {
    setLogoUri(uri);
    setLogo({
      uri,
      name,
      type: "logo",
    });
  };

  const handleBannerSelected = (uri: string, name: string) => {
    setBannerUri(uri);
    setBanner({
      uri,
      name,
      type: "banner",
    });
  };

  const handleRemoveLogo = () => {
    Alert.alert(
      t("removeLogo"),
      t("confirmRemoveLogo"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          onPress: () => {
            clearLogo();
            setLogoUri(null);
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleRemoveBanner = () => {
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
          onPress: () => {
            clearBanner();
            setBannerUri(null);
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSave = () => {
    Alert.alert(t("success"), "Οι ρυθμίσεις εικόνων αποθηκεύτηκαν", [
      { text: t("ok"), onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Εικόνες Εταιρείας",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Μεταφορτώστε το λογότυπο και το banner της εταιρείας σας για να συμπεριληφθούν στα email σας.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Λογότυπο Εταιρείας</Text>
          <Text style={styles.sublabel}>
            Το λογότυπο θα εμφανίζεται στην κεφαλίδα των email σας. Προτεινόμενο μέγεθος: 200x200px.
          </Text>
          <ImagePicker
            onImageSelected={handleLogoSelected}
            existingImageUri={logoUri || undefined}
            label="Μεταφόρτωση Λογότυπου"
            height={150}
          />

          {logoUri && (
            <Button
              title="Αφαίρεση Λογότυπου"
              onPress={handleRemoveLogo}
              variant="outline"
              style={styles.removeButton}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Banner Εταιρείας</Text>
          <Text style={styles.sublabel}>
            Το banner θα εμφανίζεται στην κορυφή των email σας. Προτεινόμενο μέγεθος: 600x150px.
          </Text>
          <ImagePicker
            onImageSelected={handleBannerSelected}
            existingImageUri={bannerUri || undefined}
            label="Μεταφόρτωση Banner"
            height={120}
          />

          {bannerUri && (
            <Button
              title="Αφαίρεση Banner"
              onPress={handleRemoveBanner}
              variant="outline"
              style={styles.removeButton}
            />
          )}
        </View>

        <View style={styles.infoBox}>
          <Info size={16} color={Colors.light.subtext} />
          <Text style={styles.infoText}>
            Χρησιμοποιήστε εικόνες υψηλής ποιότητας με διαφανές φόντο (PNG) για καλύτερα αποτελέσματα. Το banner θα εμφανίζεται στην κορυφή των email σας, ενώ το λογότυπο μπορεί να χρησιμοποιηθεί στην υπογραφή.
          </Text>
        </View>

        <Button
          title="Αποθήκευση Ρυθμίσεων Εικόνων"
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
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 6,
  },
  sublabel: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 12,
  },
  removeButton: {
    marginTop: 12,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.subtext,
    flex: 1,
  },
  saveButton: {
    marginBottom: 40,
  },
});