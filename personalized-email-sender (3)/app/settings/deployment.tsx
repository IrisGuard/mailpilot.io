import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import {
  X,
  Github,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  ArrowRight,
  CloudUpload,
  Check,
  UserPlus,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTemplateStore } from "@/store/template-store";
import { useContactStore } from "@/store/contact-store";
import { useSmtpStore } from "@/store/smtp-store";
import { useUserStore } from "@/store/user-store";
import { useImageStore } from "@/store/image-store";
import { validateDeploymentData, exportAppData, simulateGitHubUpload, generateGitHubFiles } from "@/utils/deployment";
import { useTranslation } from "@/constants/i18n";
import Button from "@/components/Button";
import { GITHUB_REPO } from "@/constants/config";

export default function DeploymentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { templates } = useTemplateStore();
  const { contacts } = useContactStore();
  const { settings } = useSmtpStore();
  const { user } = useUserStore();
  const { logo, banner } = useImageStore();
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    message?: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showGitCommands, setShowGitCommands] = useState(false);
  const [uploadingToGithub, setUploadingToGithub] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message?: string;
  } | null>(null);
  const [smtpWarning, setSmtpWarning] = useState(false);

  // Run validation on mount and when dependencies change
  useEffect(() => {
    const result = validateDeploymentData({
      templates,
      contacts,
      smtpSettings: settings,
      user,
      logo,
      banner,
    });
    
    setValidationResult(result);
    
    // Check if SMTP is configured and set warning flag
    if (!settings || !settings.host || !settings.username) {
      setSmtpWarning(true);
    } else {
      setSmtpWarning(false);
    }
    
    console.log("Validation result:", result);
  }, [templates, contacts, settings, user, logo, banner]);

  const handleTestDeployment = () => {
    setTesting(true);
    setTestResult(null);
    
    // Simulate a delay to show loading state
    setTimeout(() => {
      const result = validateDeploymentData({
        templates,
        contacts,
        smtpSettings: settings,
        user,
        logo,
        banner,
      });
      
      setTestResult(result);
      setTesting(false);
    }, 1500);
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      
      await exportAppData({
        templates,
        contacts,
        smtpSettings: settings,
        user,
        logo,
        banner,
      });
      
      Alert.alert(
        t("exportComplete"),
        t(Platform.OS === "web" ? "dataExportedWeb" : "dataExportedMobile")
      );
    } catch (error) {
      Alert.alert(t("error"), String(error));
    } finally {
      setExporting(false);
    }
  };

  const handleUploadToGithub = async () => {
    console.log("Upload to GitHub button clicked");
    
    // Reset states
    setError(null);
    setUploadComplete(false);
    
    // First check if we have valid data
    const validationResult = validateDeploymentData({
      templates,
      contacts,
      smtpSettings: settings,
      user,
      logo,
      banner,
    });

    console.log("Validation result:", validationResult);

    if (!validationResult.valid) {
      console.log("Validation failed:", validationResult.message);
      Alert.alert(
        t("cannotUpload"),
        validationResult.message || t("deploymentError")
      );
      return;
    }

    try {
      setUploadingToGithub(true);
      setUploadStep(0);
      
      console.log("Starting GitHub upload simulation...");
      
      // Generate GitHub files first
      const files = await generateGitHubFiles({
        templates,
        contacts,
        smtpSettings: settings,
        user,
        logo,
        banner,
      });
      
      console.log("Files generated:", Object.keys(files).length);
      
      // Then simulate the upload process
      await simulateGitHubUpload(
        {
          templates,
          contacts,
          smtpSettings: settings,
          user,
          logo,
          banner,
        },
        (step) => {
          console.log("Upload step changed to:", step);
          setUploadStep(step);
        }
      );
      
      console.log("Upload simulation completed");
      setUploadComplete(true);
      
      // Show success message after upload is complete
      setTimeout(() => {
        Alert.alert(
          t("uploadComplete"),
          t("githubUploadSuccess"),
          [
            {
              text: t("viewRepository"),
              onPress: openGitHubLink,
            },
            {
              text: t("ok"),
            },
          ]
        );
      }, 1000);
    } catch (error) {
      console.error("Error during GitHub upload:", error);
      setError(String(error));
      Alert.alert(t("error"), String(error));
    } finally {
      setUploadingToGithub(false);
    }
  };

  const openGitHubLink = () => {
    Linking.openURL(GITHUB_REPO.URL);
  };

  const openNetlifyLink = () => {
    Linking.openURL("https://app.netlify.com/start");
  };

  const toggleGitCommands = () => {
    setShowGitCommands(!showGitCommands);
  };

  const copyToClipboard = (text: string) => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(text);
      Alert.alert(t("copied"), t("commandCopied"));
    }
  };

  const navigateToAddContact = () => {
    router.push("/contact/create");
  };
  
  const navigateToSmtpSettings = () => {
    router.push("/settings/smtp");
  };

  // Upload steps content
  const renderUploadStep = (stepNumber: number, title: string, description: string) => {
    const isCurrentStep = uploadStep === stepNumber;
    const isCompleted = uploadStep > stepNumber || uploadComplete;
    
    return (
      <View style={styles.uploadStep}>
        <View 
          style={[
            styles.uploadStepIcon, 
            isCurrentStep && styles.uploadStepIconActive,
            isCompleted && styles.uploadStepIconCompleted
          ]}
        >
          {isCompleted ? (
            <Check size={18} color="#fff" />
          ) : (
            <Text style={styles.uploadStepNumber}>{stepNumber + 1}</Text>
          )}
        </View>
        <View style={styles.uploadStepContent}>
          <Text style={styles.uploadStepTitle}>{title}</Text>
          <Text style={styles.uploadStepDescription}>{description}</Text>
          {isCurrentStep && !isCompleted && (
            <ActivityIndicator 
              style={styles.uploadStepLoader} 
              color={Colors.light.primary} 
              size="small" 
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("deployment"),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>{t("deploymentDescription")}</Text>

        {/* Validation Status Banner */}
        {validationResult && !validationResult.valid && (
          <View style={styles.validationError}>
            <AlertCircle size={20} color={Colors.light.error} />
            <Text style={styles.validationErrorText}>
              {validationResult.message || t("deploymentError")}
            </Text>
            {validationResult.message?.includes("contacts") && (
              <TouchableOpacity 
                style={styles.addContactButton}
                onPress={navigateToAddContact}
              >
                <UserPlus size={16} color="#fff" />
                <Text style={styles.addContactButtonText}>{t("addContact")}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* SMTP Warning Banner - shown but doesn't block deployment */}
        {smtpWarning && (
          <View style={styles.smtpWarning}>
            <AlertCircle size={20} color={Colors.light.warning} />
            <Text style={styles.smtpWarningText}>
              {t("smtpWarning")}
            </Text>
            <TouchableOpacity 
              style={styles.configureSmtpButton}
              onPress={navigateToSmtpSettings}
            >
              <Text style={styles.configureSmtpButtonText}>{t("configureSmtp")}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("uploadToGitHub")}</Text>
          <Text style={styles.sectionDescription}>
            {t("uploadToGitHubDescription")}
          </Text>
          
          {!uploadingToGithub && !uploadComplete ? (
            <Button
              title={t("uploadToGitHub")}
              onPress={handleUploadToGithub}
              icon={<CloudUpload size={20} color="#fff" />}
              style={styles.button}
              disabled={validationResult ? !validationResult.valid : false}
            />
          ) : (
            <View style={styles.uploadStepsContainer}>
              {renderUploadStep(
                0, 
                t("preparingFiles"), 
                t("preparingFilesDescription")
              )}
              {renderUploadStep(
                1, 
                t("connectingToGitHub"), 
                t("connectingToGitHubDescription")
              )}
              {renderUploadStep(
                2, 
                t("uploadingFiles"), 
                t("uploadingFilesDescription")
              )}
              {renderUploadStep(
                3, 
                t("finalizingUpload"), 
                t("finalizingUploadDescription")
              )}
              
              {uploadComplete && (
                <View style={styles.uploadComplete}>
                  <CheckCircle size={40} color={Colors.light.success} />
                  <Text style={styles.uploadCompleteText}>{t("uploadCompleteMessage")}</Text>
                  <TouchableOpacity 
                    style={styles.viewRepoButton}
                    onPress={openGitHubLink}
                  >
                    <Text style={styles.viewRepoButtonText}>{t("viewRepository")}</Text>
                    <ExternalLink size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              
              {error && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={24} color={Colors.light.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("exportYourData")}</Text>
          <Text style={styles.sectionDescription}>
            {t("exportDataDescription")}
          </Text>
          <Button
            title={t("export")}
            onPress={handleExportData}
            loading={exporting}
            icon={<Download size={20} color="#fff" />}
            style={styles.button}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("testDeployment")}</Text>
          <Text style={styles.sectionDescription}>
            {t("testDeploymentDescription")}
          </Text>
          <Button
            title={testing ? t("testing") : t("simulateDeployment")}
            onPress={handleTestDeployment}
            loading={testing}
            style={styles.button}
          />

          {testResult && (
            <View
              style={[
                styles.testResult,
                {
                  backgroundColor: testResult.valid
                    ? `${Colors.light.success}15`
                    : `${Colors.light.error}15`,
                },
              ]}
            >
              <View style={styles.testResultIcon}>
                {testResult.valid ? (
                  <CheckCircle size={24} color={Colors.light.success} />
                ) : (
                  <AlertCircle size={24} color={Colors.light.error} />
                )}
              </View>
              <Text
                style={[
                  styles.testResultText,
                  {
                    color: testResult.valid
                      ? Colors.light.success
                      : Colors.light.error,
                  },
                ]}
              >
                {testResult.valid
                  ? t("deploymentSuccess")
                  : testResult.message || t("deploymentError")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("deploymentOptions")}</Text>
          
          <TouchableOpacity
            style={styles.deployOption}
            onPress={openGitHubLink}
          >
            <View style={styles.deployOptionIcon}>
              <Github size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.deployOptionContent}>
              <Text style={styles.deployOptionTitle}>{t("viewGitHubRepo")}</Text>
              <Text style={styles.deployOptionDescription}>
                {t("viewGitHubRepoDescription")}
              </Text>
            </View>
            <ExternalLink size={20} color={Colors.light.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deployOption}
            onPress={toggleGitCommands}
          >
            <View style={styles.deployOptionIcon}>
              <Github size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.deployOptionContent}>
              <Text style={styles.deployOptionTitle}>{t("pushToGitHub")}</Text>
              <Text style={styles.deployOptionDescription}>
                {t("pushToGitHubDescription")}
              </Text>
            </View>
            {showGitCommands ? (
              <X size={20} color={Colors.light.subtext} />
            ) : (
              <ArrowRight size={20} color={Colors.light.subtext} />
            )}
          </TouchableOpacity>
          
          {showGitCommands && (
            <View style={styles.codeBlock}>
              <View style={styles.commandRow}>
                <Text style={styles.codeText}>git init</Text>
                <TouchableOpacity onPress={() => copyToClipboard("git init")}>
                  <Copy size={18} color={Colors.light.subtext} />
                </TouchableOpacity>
              </View>
              <View style={styles.commandRow}>
                <Text style={styles.codeText}>git add .</Text>
                <TouchableOpacity onPress={() => copyToClipboard("git add .")}>
                  <Copy size={18} color={Colors.light.subtext} />
                </TouchableOpacity>
              </View>
              <View style={styles.commandRow}>
                <Text style={styles.codeText}>git commit -m "Initial commit"</Text>
                <TouchableOpacity onPress={() => copyToClipboard('git commit -m "Initial commit"')}>
                  <Copy size={18} color={Colors.light.subtext} />
                </TouchableOpacity>
              </View>
              <View style={styles.commandRow}>
                <Text style={styles.codeText}>git remote add origin {GITHUB_REPO.URL}.git</Text>
                <TouchableOpacity onPress={() => copyToClipboard(`git remote add origin ${GITHUB_REPO.URL}.git`)}>
                  <Copy size={18} color={Colors.light.subtext} />
                </TouchableOpacity>
              </View>
              <View style={styles.commandRow}>
                <Text style={styles.codeText}>git push -u origin main</Text>
                <TouchableOpacity onPress={() => copyToClipboard("git push -u origin main")}>
                  <Copy size={18} color={Colors.light.subtext} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.deployOption}
            onPress={openNetlifyLink}
          >
            <View style={styles.deployOptionIcon}>
              <Upload size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.deployOptionContent}>
              <Text style={styles.deployOptionTitle}>{t("deployToNetlify")}</Text>
              <Text style={styles.deployOptionDescription}>
                {t("deployToNetlifyDescription")}
              </Text>
            </View>
            <ExternalLink size={20} color={Colors.light.subtext} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("manualDeployment")}</Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t("cloneRepository")}</Text>
                <Text style={styles.stepDescription}>
                  {t("cloneRepositoryDescription")}
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t("makeChanges")}</Text>
                <Text style={styles.stepDescription}>
                  {t("makeChangesDescription")}
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t("connectToNetlify")}</Text>
                <Text style={styles.stepDescription}>
                  {t("connectToNetlifyDescription")}
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t("configureBuildSettings")}</Text>
                <Text style={styles.stepDescription}>
                  {t("configureBuildSettingsDescription")}
                </Text>
              </View>
            </View>
          </View>
        </View>
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
  validationError: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.error}15`,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  validationErrorText: {
    color: Colors.light.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  smtpWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.warning}15`,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  smtpWarningText: {
    color: Colors.light.warning,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  configureSmtpButton: {
    backgroundColor: Colors.light.warning,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  configureSmtpButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  addContactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: "flex-start",
    gap: 6,
  },
  addContactButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    marginBottom: 8,
  },
  testResult: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  testResultIcon: {
    marginRight: 12,
  },
  testResultText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  deployOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 12,
  },
  deployOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deployOptionContent: {
    flex: 1,
  },
  deployOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  deployOptionDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  steps: {
    marginTop: 8,
  },
  step: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  commandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  codeText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    color: Colors.light.text,
    flex: 1,
  },
  uploadStepsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  uploadStep: {
    flexDirection: "row",
    marginBottom: 16,
  },
  uploadStepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  uploadStepIconActive: {
    backgroundColor: Colors.light.primary,
  },
  uploadStepIconCompleted: {
    backgroundColor: Colors.light.success,
  },
  uploadStepNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  uploadStepContent: {
    flex: 1,
  },
  uploadStepTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  uploadStepDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    lineHeight: 20,
  },
  uploadStepLoader: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  uploadComplete: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: `${Colors.light.success}10`,
    borderRadius: 8,
  },
  uploadCompleteText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  viewRepoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  viewRepoButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.error}15`,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});