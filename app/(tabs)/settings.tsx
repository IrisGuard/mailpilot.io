import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/constants/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Mail, 
  Server, 
  Image, 
  FileImage, 
  Globe, 
  Moon, 
  Sun, 
  ChevronRight 
} from 'lucide-react-native';
import LanguageSelector from '@/components/LanguageSelector';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const settingsGroups = [
    {
      title: t('profile'),
      items: [
        {
          icon: <User size={20} color="#4F46E5" />,
          title: t('profile'),
          route: '/settings/profile',
        },
        {
          icon: <Mail size={20} color="#4F46E5" />,
          title: t('smtp'),
          route: '/settings/smtp',
        },
      ],
    },
    {
      title: t('appearance'),
      items: [
        {
          icon: <Image size={20} color="#4F46E5" />,
          title: t('logo'),
          route: '/settings/logo',
        },
        {
          icon: <FileImage size={20} color="#4F46E5" />,
          title: t('banner'),
          route: '/settings/banner',
        },
      ],
    },
    {
      title: t('deployment'),
      items: [
        {
          icon: <Server size={20} color="#4F46E5" />,
          title: t('deployment'),
          route: '/settings/deployment',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>{t('settings')}</Text>
        
        <View style={styles.languageContainer}>
          <LanguageSelector />
        </View>
        
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            
            {group.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={itemIndex} 
                style={styles.settingItem}
                onPress={() => router.push(item.route)}
              >
                <View style={styles.settingItemLeft}>
                  {item.icon}
                  <Text style={styles.settingItemText}>{item.title}</Text>
                </View>
                <ChevronRight size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>{t('theme')}</Text>
          <View style={styles.themeSelector}>
            <TouchableOpacity style={[styles.themeOption, styles.themeOptionSelected]}>
              <Sun size={20} color="#4F46E5" />
              <Text style={styles.themeOptionText}>{t('light')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.themeOption}>
              <Moon size={20} color="#6B7280" />
              <Text style={styles.themeOptionText}>{t('dark')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.themeOption}>
              <Globe size={20} color="#6B7280" />
              <Text style={styles.themeOptionText}>{t('system')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#111827',
  },
  languageContainer: {
    marginBottom: 16,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#111827',
  },
  themeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F9FAFB',
  },
  themeOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  themeOptionText: {
    marginTop: 4,
    fontSize: 14,
    color: '#111827',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  version: {
    fontSize: 14,
    color: '#6B7280',
  },
});