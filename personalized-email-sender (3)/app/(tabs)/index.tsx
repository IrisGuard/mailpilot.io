import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, Users, Send, History, Settings, Github } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranslation } from '@/constants/i18n';
import { useTemplateStore } from '@/store/template-store';
import { useContactStore } from '@/store/contact-store';
import { useHistoryStore } from '@/store/history-store';
import { GITHUB_REPO } from '@/constants/config';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { templates } = useTemplateStore();
  const { contacts } = useContactStore();
  const { history } = useHistoryStore();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const openGitHubRepo = () => {
    router.push('/settings/deployment');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>MailPilot.io</Text>
        <Text style={styles.subtitle}>
          {t('home')}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{templates.length}</Text>
          <Text style={styles.statLabel}>{t('templates')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{contacts.length}</Text>
          <Text style={styles.statLabel}>{t('contacts')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{history.length}</Text>
          <Text style={styles.statLabel}>{t('history')}</Text>
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateTo('/template/create')}
          >
            <View style={styles.quickActionIcon}>
              <FileText size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('createTemplate')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateTo('/contact/create')}
          >
            <View style={styles.quickActionIcon}>
              <Users size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('createContact')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateTo('/bulk-send')}
          >
            <View style={styles.quickActionIcon}>
              <Send size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('bulkSend')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.githubCard} onPress={openGitHubRepo}>
        <View style={styles.githubCardContent}>
          <View style={styles.githubIconContainer}>
            <Github size={24} color="#fff" />
          </View>
          <View style={styles.githubTextContainer}>
            <Text style={styles.githubTitle}>{t('githubRepository')}</Text>
            <Text style={styles.githubDescription}>
              {t('githubRepositoryDescription')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.navigationContainer}>
        <Text style={styles.sectionTitle}>{t('navigation')}</Text>
        <View style={styles.navigationGrid}>
          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigateTo('/templates')}
          >
            <View style={styles.navigationIcon}>
              <FileText size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.navigationText}>{t('templates')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigateTo('/contacts')}
          >
            <View style={styles.navigationIcon}>
              <Users size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.navigationText}>{t('contacts')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigateTo('/bulk-send')}
          >
            <View style={styles.navigationIcon}>
              <Send size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.navigationText}>{t('bulkSend')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigateTo('/history')}
          >
            <View style={styles.navigationIcon}>
              <History size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.navigationText}>{t('history')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigateTo('/settings')}
          >
            <View style={styles.navigationIcon}>
              <Settings size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.navigationText}>{t('settings')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationItem}
            onPress={openGitHubRepo}
          >
            <View style={styles.navigationIcon}>
              <Github size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.navigationText}>{t('deployment')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
  },
  statCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  quickActionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIcon: {
    backgroundColor: `${Colors.light.primary}15`,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.light.text,
    textAlign: 'center',
  },
  githubCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#24292e',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  githubCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  githubIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  githubTextContainer: {
    flex: 1,
  },
  githubTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  githubDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  navigationContainer: {
    padding: 20,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navigationItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  navigationIcon: {
    backgroundColor: `${Colors.light.primary}15`,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  navigationText: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
});