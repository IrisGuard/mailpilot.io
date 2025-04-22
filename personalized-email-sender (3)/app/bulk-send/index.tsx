import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import {
  ChevronRight,
  Check,
  Search,
  FileText,
  Users,
  ClipboardList,
  Send,
  Info,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTemplateStore } from "@/store/template-store";
import { useContactStore } from "@/store/contact-store";
import { useHistoryStore } from "@/store/history-store";
import { useSmtpStore } from "@/store/smtp-store";
import { useImageStore } from "@/store/image-store";
import { useTranslation } from "@/constants/i18n";
import { FEATURES } from "@/constants/config";
import Button from "@/components/Button";
import SearchBar from "@/components/SearchBar";
import TemplateCard from "@/components/TemplateCard";
import ContactCard from "@/components/ContactCard";
import EmptyState from "@/components/EmptyState";
import { Template, Contact, BulkEmailResult, SmtpSettings } from "@/types";
import { 
  replaceTemplateVariables, 
  formatEmailWithImages, 
  mockSendEmail,
  sendEmail,
  validateSmtpSettings
} from "@/utils/email";

enum BulkSendStep {
  SELECT_TEMPLATE = 0,
  SELECT_CONTACTS = 1,
  REVIEW = 2,
  SENDING = 3,
  RESULTS = 4,
}

export default function BulkSendScreen() {
  const router = useRouter();
  const { templates } = useTemplateStore();
  const { contacts } = useContactStore();
  const { addEmailToHistory } = useHistoryStore();
  const { settings: smtpSettings } = useSmtpStore();
  const { logo, banner } = useImageStore();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState<BulkSendStep>(BulkSendStep.SELECT_TEMPLATE);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(templates);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [results, setResults] = useState<BulkEmailResult[]>([]);
  const [showSmtpWarning, setShowSmtpWarning] = useState(false);

  // Check if SMTP is configured - only run once on component mount
  useEffect(() => {
    if (!validateSmtpSettings(smtpSettings)) {
      setShowSmtpWarning(true);
    }
  }, []);

  // Filter templates and contacts based on search query
  useEffect(() => {
    if (searchQuery) {
      if (currentStep === BulkSendStep.SELECT_TEMPLATE) {
        const filtered = templates.filter((template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.subject.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredTemplates(filtered);
      } else if (currentStep === BulkSendStep.SELECT_CONTACTS) {
        const filtered = contacts.filter((contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredContacts(filtered);
      }
    } else {
      setFilteredTemplates(templates);
      setFilteredContacts(contacts);
    }
  }, [searchQuery, currentStep, templates, contacts]);

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setCurrentStep(BulkSendStep.SELECT_CONTACTS);
    setSearchQuery("");
  }, []);

  const handleSelectContact = useCallback((contact: Contact) => {
    setSelectedContacts(prev => {
      if (prev.some((c) => c.id === contact.id)) {
        return prev.filter((c) => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedContacts(prev => {
      if (prev.length === filteredContacts.length) {
        return [];
      } else {
        return [...filteredContacts];
      }
    });
  }, [filteredContacts]);

  const handleNext = useCallback(() => {
    if (currentStep === BulkSendStep.SELECT_CONTACTS) {
      if (selectedContacts.length === 0) {
        Alert.alert(t('error'), t('selectAtLeastOneContact'));
        return;
      }
      setCurrentStep(BulkSendStep.REVIEW);
    }
  }, [currentStep, selectedContacts.length, t]);

  const handleBack = useCallback(() => {
    if (currentStep === BulkSendStep.SELECT_CONTACTS) {
      setCurrentStep(BulkSendStep.SELECT_TEMPLATE);
      setSearchQuery("");
    } else if (currentStep === BulkSendStep.REVIEW) {
      setCurrentStep(BulkSendStep.SELECT_CONTACTS);
    } else if (currentStep === BulkSendStep.RESULTS) {
      // Reset and start over
      setCurrentStep(BulkSendStep.SELECT_TEMPLATE);
      setSelectedTemplate(null);
      setSelectedContacts([]);
      setSearchQuery("");
      setResults([]);
    }
  }, [currentStep]);

  const handleSendEmails = useCallback(async () => {
    if (!selectedTemplate || selectedContacts.length === 0) {
      return;
    }

    setCurrentStep(BulkSendStep.SENDING);
    setSendingProgress(0);
    setResults([]);

    const totalEmails = selectedContacts.length;
    const emailResults: BulkEmailResult[] = [];

    for (let i = 0; i < selectedContacts.length; i++) {
      const contact = selectedContacts[i];
      
      try {
        // Replace template variables
        const variables = {
          name: contact.name,
          email: contact.email,
          company: contact.company || "",
          role: contact.role || "",
        };

        const subject = replaceTemplateVariables(selectedTemplate.subject, variables);
        let body = replaceTemplateVariables(selectedTemplate.body, variables);

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
            contact.email, 
            subject, 
            formattedBody,
            smtpSettings as SmtpSettings // Type assertion since validateSmtpSettings ensures it's not null
          );
          
          success = result.success;
          errorMessage = result.message || '';
        } else {
          // Use mock sending for development/testing
          await mockSendEmail(contact.email, subject, formattedBody);
          success = true;
        }

        if (success) {
          // Add to history
          addEmailToHistory({
            to: contact.email,
            toName: contact.name,
            subject,
            body: formattedBody,
            status: "sent",
            templateId: selectedTemplate.id,
            templateName: selectedTemplate.name,
            contactId: contact.id,
            contactName: contact.name,
            sentAt: Date.now()
          });

          emailResults.push({
            contactId: contact.id,
            contactName: contact.name,
            email: contact.email,
            status: "sent",
          });
        } else {
          throw new Error(errorMessage || 'Failed to send email');
        }
      } catch (error) {
        console.error(`Failed to send email to ${contact.email}:`, error);
        
        emailResults.push({
          contactId: contact.id,
          contactName: contact.name,
          email: contact.email,
          status: "failed",
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Add to history as failed
        addEmailToHistory({
          to: contact.email,
          toName: contact.name,
          subject: selectedTemplate.subject,
          body: selectedTemplate.body,
          status: "failed",
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          contactId: contact.id,
          contactName: contact.name,
          error: error instanceof Error ? error.message : String(error),
          sentAt: Date.now()
        });
      }

      // Update progress
      setSendingProgress(((i + 1) / totalEmails) * 100);
      
      // Add a delay between emails to avoid rate limiting
      if (i < selectedContacts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setResults(emailResults);
    setCurrentStep(BulkSendStep.RESULTS);
  }, [selectedTemplate, selectedContacts, logo, banner, smtpSettings, addEmailToHistory]);

  const handleConfigureSmtp = useCallback(() => {
    router.push("/settings/smtp");
  }, [router]);

  const renderStepIndicator = useCallback(() => {
    return (
      <View style={styles.stepIndicator}>
        <View
          style={[
            styles.stepDot,
            currentStep >= BulkSendStep.SELECT_TEMPLATE && styles.activeStepDot,
          ]}
        >
          <Text style={styles.stepNumber}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View
          style={[
            styles.stepDot,
            currentStep >= BulkSendStep.SELECT_CONTACTS && styles.activeStepDot,
          ]}
        >
          <Text style={styles.stepNumber}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View
          style={[
            styles.stepDot,
            currentStep >= BulkSendStep.REVIEW && styles.activeStepDot,
          ]}
        >
          <Text style={styles.stepNumber}>3</Text>
        </View>
      </View>
    );
  }, [currentStep]);

  // Memoize the success and failed counts to prevent unnecessary re-renders
  const { successCount, failedCount } = useMemo(() => {
    return {
      successCount: results.filter((r) => r.status === "sent").length,
      failedCount: results.filter((r) => r.status === "failed").length
    };
  }, [results]);

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case BulkSendStep.SELECT_TEMPLATE:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('selectTemplate')}</Text>
            <SearchBar
              placeholder={t('searchTemplates')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
            />

            {templates.length === 0 ? (
              <EmptyState
                icon={<FileText size={48} color={Colors.light.subtext} />}
                title={t('noTemplates')}
                message={t('createTemplateFirst')}
                actionLabel={t('createTemplate')}
                onAction={() => router.push("/template/create")}
              />
            ) : filteredTemplates.length === 0 ? (
              <EmptyState
                icon={<Search size={48} color={Colors.light.subtext} />}
                title={t('noResults')}
                message={t('tryDifferentSearch')}
              />
            ) : (
              <FlatList
                data={filteredTemplates}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TemplateCard
                    template={item}
                    onPress={() => handleSelectTemplate(item)}
                    rightIcon={
                      selectedTemplate?.id === item.id ? (
                        <Check size={20} color={Colors.light.primary} />
                      ) : (
                        <ChevronRight size={20} color={Colors.light.subtext} />
                      )
                    }
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        );

      case BulkSendStep.SELECT_CONTACTS:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('selectContacts')}</Text>
            
            {selectedTemplate && (
              <View style={styles.selectedTemplateContainer}>
                <Text style={styles.selectedTemplateLabel}>{t('selectedTemplate')}:</Text>
                <Text style={styles.selectedTemplateName}>{selectedTemplate.name}</Text>
              </View>
            )}
            
            <SearchBar
              placeholder={t('searchContacts')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
            />

            <View style={styles.selectAllContainer}>
              <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
                <Text style={styles.selectAllText}>
                  {selectedContacts.length === filteredContacts.length
                    ? t('deselectAll')
                    : t('selectAll')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.selectedCount}>
                {selectedContacts.length} / {filteredContacts.length} επιλεγμένες
              </Text>
            </View>

            {contacts.length === 0 ? (
              <EmptyState
                icon={<Users size={48} color={Colors.light.subtext} />}
                title={t('noContacts')}
                message={t('addContactFirst')}
                actionLabel={t('addContact')}
                onAction={() => router.push("/contact/create")}
              />
            ) : filteredContacts.length === 0 ? (
              <EmptyState
                icon={<Search size={48} color={Colors.light.subtext} />}
                title={t('noResults')}
                message={t('tryDifferentSearch')}
              />
            ) : (
              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ContactCard
                    contact={item}
                    onPress={() => handleSelectContact(item)}
                    rightIcon={
                      selectedContacts.some((c) => c.id === item.id) ? (
                        <Check size={20} color={Colors.light.primary} />
                      ) : null
                    }
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}

            <Button
              title={t('reviewAndSend')}
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>
        );

      case BulkSendStep.REVIEW:
        return (
          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>{t('review')}</Text>

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

            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>{t('template')}</Text>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewItemTitle}>{selectedTemplate?.name}</Text>
                <Text style={styles.reviewItemSubtitle}>{selectedTemplate?.subject}</Text>
              </View>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>{t('recipients')}</Text>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewItemTitle}>
                  {selectedContacts.length} {t('contacts')}
                </Text>
                <Text style={styles.reviewItemSubtitle}>
                  {selectedContacts.slice(0, 3).map((c) => c.name).join(", ")}
                  {selectedContacts.length > 3 && ` + ${selectedContacts.length - 3} ${t('more')}`}
                </Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Info size={20} color={Colors.light.subtext} />
              <Text style={styles.infoText}>{t('bulkEmailInfo')}</Text>
            </View>

            <Button
              title={t('sendBulkEmails')}
              onPress={handleSendEmails}
              style={styles.sendButton}
              icon={<Send size={18} color="#fff" />}
            />
          </ScrollView>
        );

      case BulkSendStep.SENDING:
        return (
          <View style={styles.sendingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.sendingText}>{t('sendingEmails')}</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBar, { width: `${sendingProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(sendingProgress)}% ({Math.ceil((sendingProgress / 100) * selectedContacts.length)}/{selectedContacts.length})
            </Text>
          </View>
        );

      case BulkSendStep.RESULTS:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Αποτελέσματα Αποστολής</Text>
            
            <View style={styles.resultsContainer}>
              <View style={styles.resultsSummary}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultCount}>{successCount}</Text>
                  <Text style={styles.resultLabel}>{t('sent')}</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultItem}>
                  <Text style={[styles.resultCount, failedCount > 0 && styles.failedCount]}>
                    {failedCount}
                  </Text>
                  <Text style={[styles.resultLabel, failedCount > 0 && styles.failedLabel]}>
                    {t('failed')}
                  </Text>
                </View>
              </View>

              <Text style={styles.resultsTitle}>Λεπτομέρειες</Text>
              
              <FlatList
                data={results}
                keyExtractor={(item, index) => `${item.contactId}-${index}`}
                renderItem={({ item }) => (
                  <View style={styles.resultCard}>
                    <View style={styles.resultCardLeft}>
                      <Text style={styles.resultCardName}>{item.contactName}</Text>
                      <Text style={styles.resultCardEmail}>{item.email}</Text>
                    </View>
                    <View
                      style={[
                        styles.resultStatus,
                        item.status === "sent"
                          ? styles.successStatus
                          : styles.failedStatus,
                      ]}
                    >
                      <Text style={styles.resultStatusText}>
                        {item.status === "sent" ? t('sent') : t('failed')}
                      </Text>
                    </View>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsList}
              />
            </View>

            <Button
              title="Νέα Μαζική Αποστολή"
              onPress={() => {
                setCurrentStep(BulkSendStep.SELECT_TEMPLATE);
                setSelectedTemplate(null);
                setSelectedContacts([]);
                setSearchQuery("");
                setResults([]);
              }}
              style={styles.newBulkButton}
            />
          </View>
        );

      default:
        return null;
    }
  }, [
    currentStep, 
    t, 
    searchQuery, 
    templates, 
    filteredTemplates, 
    contacts, 
    filteredContacts, 
    selectedTemplate, 
    selectedContacts, 
    showSmtpWarning, 
    sendingProgress, 
    results, 
    successCount, 
    failedCount, 
    router, 
    handleSelectTemplate, 
    handleSelectContact, 
    handleSelectAll, 
    handleNext, 
    handleSendEmails, 
    handleConfigureSmtp
  ]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t('bulkSend'),
        }}
      />

      {currentStep < BulkSendStep.SENDING && renderStepIndicator()}
      {renderStepContent()}

      {currentStep !== BulkSendStep.SELECT_TEMPLATE &&
       currentStep !== BulkSendStep.SENDING &&
       currentStep !== BulkSendStep.RESULTS && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activeStepDot: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 8,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  selectedTemplateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectedTemplateLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    marginRight: 8,
  },
  selectedTemplateName: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  selectAllContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectAllButton: {
    padding: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  selectedCount: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  nextButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.subtext,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 8,
  },
  reviewCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
  },
  reviewItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  reviewItemSubtitle: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.subtext,
    marginLeft: 8,
  },
  sendButton: {
    marginBottom: 80,
  },
  sendingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sendingText: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 24,
  },
  progressBarContainer: {
    width: "80%",
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.light.primary,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginTop: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsSummary: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  resultItem: {
    flex: 1,
    alignItems: "center",
  },
  resultCount: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  failedCount: {
    color: Colors.light.error,
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  failedLabel: {
    color: Colors.light.error,
  },
  resultDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 12,
  },
  resultsList: {
    paddingBottom: 100,
  },
  resultCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resultCardLeft: {
    flex: 1,
  },
  resultCardName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
  },
  resultCardEmail: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  resultStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  successStatus: {
    backgroundColor: `${Colors.light.success}20`,
  },
  failedStatus: {
    backgroundColor: `${Colors.light.error}20`,
  },
  resultStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  newBulkButton: {
    marginBottom: 40,
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
});