import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTranslation, LANGUAGES, LanguageCode } from '@/constants/i18n';
import Colors from '@/constants/colors';

export default function LanguageSelector() {
  const { locale, setLocale } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<LanguageCode>((locale as LanguageCode) || 'en');

  const handleSelectLanguage = async (languageCode: LanguageCode) => {
    await setLocale(languageCode);
    setCurrentLocale(languageCode);
    setModalVisible(false);
  };

  const languageEntries = Object.entries(LANGUAGES).map(([code, language]) => ({
    code: code as LanguageCode,
    ...language,
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>
          {LANGUAGES[currentLocale]?.nativeName || 'English'}
        </Text>
        <ChevronDown size={18} color={Colors.light.subtext} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            
            <FlatList
              data={languageEntries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.languageItem}
                  onPress={() => handleSelectLanguage(item.code)}
                >
                  <Text style={styles.languageName}>{item.nativeName}</Text>
                  {currentLocale === item.code && (
                    <Check size={20} color={Colors.light.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  selectorText: {
    fontSize: 16,
    color: Colors.light.text,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: Colors.light.text,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  languageName: {
    fontSize: 16,
    color: Colors.light.text,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.primary,
  },
});