import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Send, Image as ImageIcon, Info } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTemplateStore } from "@/store/template-store";
import { useContactStore } from "@/store/contact-store";
import { useUserStore } from "@/store/user-store";
import { useHistoryStore } from "@/store/history-store";
import { useSmtpStore } from "@/store/smtp-store";
import { useImageStore } from "@/store/image-store";
import { useTranslation } from "@/constants/i18n";
import { FEATURES } from "@/constants/config";
import Button from "@/components/Button";
import RichTextEditor from "@/components/RichTextEditor";
import { 
  replaceTemplateVariables, 
  formatEmailWithImages, 
  validateSmtpSettings, 
  mockSendEmail,
  sendEmail
} from "@/utils/email";
import { SmtpSettings } from "@/types";

export default function ComposeEmailScreen() {
  const { templateId, contactId } = useLocalSearchParams<{ templateId: string; contactId: string }>();
  const router = useRouter();
  const { getTemplateById } = useTemplateStore();
  const { contacts } = useContactStore();
  const { user } = useUserStore();
  const { addEmailToHistory } = useHistoryStore();
  const { settings: smtpSettings } = useSmtpStore();
  const { logo, banner } = useImageStore();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [showSmtpWarning, setShowSmtpWarning] = useState(false);

  // Get contact by ID
  const getContactById = useCallback((id: string) => {
    return contacts.find(contact => contact.id === id);
  }, [contacts]);

  useEffect(() => {
    const template = getTemplateById(templateId);
    const contact = getContactById(contactId);

    if (!template || !contact) {
      Alert.alert(t('error'), t('dataNotFound'));
      router.back();
      return;
    }

    // Replace template variables
    const variables = {
      name: contact.name,
      email: contact.email,
      company: contact.company || "",
      role: contact.role || "",
      sender: user?.name || "",
      signature: user?.signature || `${user?.name || ""}<br>${user?.email || ""}`,
    };

    setSubject(replaceTemplateVariables(template.subject, variables));
    
    // Add signature to body if it exists
    let processedBody = replaceTemplateVariables(template.body, variables);
    if (user?.signature) {
      processedBody += `<br><br>--<br>${user.signature}`;
    }
    
    setBody(processedBody);
    setRecipientName(contact.name);
    setRecipientEmail(contact.email);

    // Check if SMTP is configured
    if (!validateSmtpSettings(smtpSettings)) {
      setShowSmtpWarning(true);
    }
  }, [templateId, contactId, getTemplateById, getContactById, user, smtpSettings, t, router]);

  const handleSendEmail = useCallback(async () => {
    if (!subject.trim()) {
      Alert.alert(t('error'), t('enterEmailSubject'));
      return;
    }

    if (!body.trim()) {
      Alert.alert(t('error'), t('enterEmailBody'));
      return;
    }

    setLoading(true);

    try {
      // Format email with logo and banner if available
      const formattedBody = formatEmailWithImages(
        body,
        logo?.uri,
        banner?.uri
      );

      let success = false;
      let errorMessage = '';

      // Check if SMTP is configured and real email sending is enabled
      if (validateSmtpSettings(smtpSettings) && FEATURES.ENABLE_REAL_EMAIL_SENDING) {
        // Send via backend API
        const result = await sendEmail(
          recipientEmail, 
          subject, 
          formattedBody,
          smtpSettings as SmtpSettings // Type assertion since validateSmtpSettings ensures it's not null
        );
        
        success = result.success;
        errorMessage = result.message || '';
      } else {
        // Use mock sending for development/testing
        await mockSendEmail(recipientEmail, subject, formattedBody);
        success = true;
      }

      if (success) {
        // Add to history
        addEmailToHistory({
          to: recipientEmail,
          toName: recipientName,
          subject,
          body: formattedBody,
          status: "sent",
          templateId,
          templateName: getTemplateById(templateId)?.name,
          contactId,
          contactName: recipientName,
          sentAt: Date.now()
        });

        Alert.alert(t('success'), t('emailSentSuccessfully'), [
          { text: t('ok'), onPress: () => router.back() }
        ]);
      } else {
        throw new Error(errorMessage || 'Failed to send email');
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      
      // Add to history as failed
      addEmailToHistory({
        to: recipientEmail,
        toName: recipientName,
        subject,
        body,
        status: "failed",
        templateId,
        templateName: getTemplateById(templateId)?.name,
        contactId,
        contactName: recipientName,
        error: error instanceof Error ? error.message : String(error),
        sentAt: Date.now()
      });
      
      Alert.alert(t('error'), t('failedToSendEmail'));
    } finally {
      setLoading(false);
    }
  }, [
    subject, 
    body, 
    recipientEmail, 
    recipientName, 
    logo, 
    banner, 
    smtpSettings, 
    templateId, 
    contactId, 
    t, 
    router, 
    getTemplateById, 
    addEmailToHistory
  ]);

  const handleConfigureSmtp = useCallback(() => {
    router.push("/settings/smtp");
  }, [router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>{t('sending')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t('composeEmail'),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {showSmtpWarning && (
          <View style={styles.warningBox}>
            <Info size={20} color={Colors.light.warning} />
            <Text style={styles.warningText}>
              {t('smtpNotConfiguredWarning')}
            </Text>
            <TouchableOpacity onPress={handleConfigureSmtp}>
              <Text style={styles.configureLink}>{t('configureNow')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.recipientContainer}>
          <Text style={styles.label}>{t('to')}:</Text>
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.recipientEmail}>{recipientEmail}</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('subject')}:</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder={t('emailSubject')}
            placeholderTextColor={Colors.light.subtext}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('message')}:</Text>
          <RichTextEditor
            value={body}
            onChangeText={setBody}
            style={styles.editor}
            placeholder={t('emailBodyPlaceholder')}
          />
        </View>

        {(logo || banner) && (
          <View style={styles.imagesInfo}>
            <ImageIcon size={16} color={Colors.light.subtext} />
            <Text style={styles.imagesInfoText}>
              {logo && banner 
                ? "Το λογότυπο και το banner της εταιρείας θα συμπεριληφθούν στο email"
                : logo 
                  ? "Το λογότυπο της εταιρείας θα συμπεριληφθεί στο email"
                  : "Το banner της εταιρείας θα συμπεριληφθεί στο email"
              }
            </Text>
          </View>
        )}

        <Button
          title={t('sendEmail')}
          onPress={handleSendEmail}
          style={styles.sendButton}
          icon={<Send size={18} color="#fff" />}
        />
      </ScrollView>
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.warning}15`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
  },
  configureLink: {
    color: Colors.light.primary,
    fontWeight: "500",
    marginTop: 8,
    marginLeft: 28,
  },
  recipientContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  recipientInfo: {
    flex: 1,
    marginLeft: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
  },
  recipientEmail: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  formGroup: {
    marginBottom: 16,
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
  editor: {
    height: 300,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
  },
  imagesInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
    padding: 12,
  },
  imagesInfoText: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginLeft: 8,
  },
  sendButton: {
    marginBottom: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
});