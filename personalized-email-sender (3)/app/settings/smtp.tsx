import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSmtpStore } from '@/store/smtp-store';
import Button from '@/components/Button';
import { useTranslation } from '@/constants/i18n';
import { Info } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function SmtpSettings() {
  const router = useRouter();
  const { t } = useTranslation();
  const smtpStore = useSmtpStore();
  
  // Local state for form
  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [useTLS, setUseTLS] = useState(true);
  const [saveToHistory, setSaveToHistory] = useState(true);

  // Load settings from store when component mounts
  useEffect(() => {
    setHost(smtpStore.host || '');
    setPort(smtpStore.port?.toString() || '587');
    setUsername(smtpStore.username || '');
    setPassword(smtpStore.password || '');
    setFromName(smtpStore.fromName || '');
    setFromEmail(smtpStore.fromEmail || '');
    setUseTLS(smtpStore.useTLS !== undefined ? smtpStore.useTLS : true);
    setSaveToHistory(smtpStore.saveToHistory !== undefined ? smtpStore.saveToHistory : true);
  }, [smtpStore]);
  
  // Validation
  const validateForm = () => {
    if (!host) {
      Alert.alert(t('error'), t('enterSmtpHost'));
      return false;
    }
    
    const portNumber = parseInt(port, 10);
    if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
      Alert.alert(t('error'), t('enterValidPort'));
      return false;
    }
    
    if (!username) {
      Alert.alert(t('error'), t('enterSmtpUsername'));
      return false;
    }
    
    if (!password) {
      Alert.alert(t('error'), t('enterSmtpPassword'));
      return false;
    }
    
    if (!fromName) {
      Alert.alert(t('error'), t('enterSenderName'));
      return false;
    }
    
    if (!fromEmail) {
      Alert.alert(t('error'), t('enterSenderEmail'));
      return false;
    }
    
    return true;
  };
  
  // Save settings
  const saveSettings = () => {
    if (!validateForm()) return;
    
    smtpStore.setHost(host);
    smtpStore.setPort(parseInt(port, 10));
    smtpStore.setUsername(username);
    smtpStore.setPassword(password);
    smtpStore.setFromName(fromName);
    smtpStore.setFromEmail(fromEmail);
    smtpStore.setUseTLS(useTLS);
    smtpStore.setSaveToHistory(saveToHistory);
    smtpStore.setIsConfigured(true);
    
    Alert.alert(t('success'), t('smtpSettingsSaved'));
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: t('smtpConfiguration'),
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.infoBox}>
          <Info size={20} color={Colors.light.primary} />
          <Text style={styles.infoText}>{t('smtpDescription')}</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('smtpServer')}</Text>
          <TextInput
            style={styles.input}
            value={host}
            onChangeText={setHost}
            placeholder="smtp.gmail.com"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('port')}</Text>
          <TextInput
            style={styles.input}
            value={port}
            onChangeText={setPort}
            placeholder="587"
            keyboardType="number-pad"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('username')}</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="your.email@gmail.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>
        
        <View style={styles.infoBox}>
          <Info size={20} color={Colors.light.primary} />
          <Text style={styles.infoText}>{t('gmailInstructions')}</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('fromName')}</Text>
          <TextInput
            style={styles.input}
            value={fromName}
            onChangeText={setFromName}
            placeholder="Your Name"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('fromEmail')}</Text>
          <TextInput
            style={styles.input}
            value={fromEmail}
            onChangeText={setFromEmail}
            placeholder="your.email@gmail.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.switchGroup}>
          <Text style={styles.switchLabel}>{t('useTLS')}</Text>
          <Switch
            value={useTLS}
            onValueChange={setUseTLS}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : useTLS ? '#ffffff' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.switchGroup}>
          <Text style={styles.switchLabel}>{t('saveEmailsToHistory')}</Text>
          <Switch
            value={saveToHistory}
            onValueChange={setSaveToHistory}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : saveToHistory ? '#ffffff' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button onPress={saveSettings} title={t('save')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.light.card,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: Colors.light.infoBackground || '#e6f0fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
    color: Colors.light.primary,
    fontSize: 14,
    lineHeight: 20,
  },
});