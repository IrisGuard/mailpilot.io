import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { X, Info } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTemplateStore } from "@/store/template-store";
import { useImageStore } from "@/store/image-store";
import Button from "@/components/Button";
import { getTemplateVariables } from "@/constants/variables";
import RichTextEditor from "@/components/RichTextEditor";
import { useTranslation } from "@/constants/i18n";

export default function EditTemplateScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getTemplateById, updateTemplate } = useTemplateStore();
  const { logo } = useImageStore();
  const { t } = useTranslation();
  
  const template = getTemplateById(id as string);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showVariables, setShowVariables] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
      setIncludeLogo(template.hasLogo || false);
    }
  }, [template]);

  if (!template) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>{t('templateNotFound')}</Text>
        <Button
          title={t('goBack')}
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('error'), t('enterTemplateName'));
      return;
    }

    if (!subject.trim()) {
      Alert.alert(t('error'), t('enterEmailSubject'));
      return;
    }

    if (!body.trim()) {
      Alert.alert(t('error'), t('enterEmailBody'));
      return;
    }

    updateTemplate(template.id, {
      name: name.trim(),
      subject: subject.trim(),
      body: body.trim(),
      hasImages: body.includes("[IMAGE:"),
      hasLogo: includeLogo,
    });

    router.back();
  };

  const insertVariable = (variable: string) => {
    setBody((prev) => prev + variable);
  };

  const templateVariables = getTemplateVariables();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t('editTemplate'),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('templateName')}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('templateNamePlaceholder')}
            placeholderTextColor={Colors.light.subtext}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('emailSubject')}</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder={t('emailSubjectPlaceholder')}
            placeholderTextColor={Colors.light.subtext}
          />
        </View>

        {logo && (
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t('includeCompanyLogo')}</Text>
              <Switch
                value={includeLogo}
                onValueChange={setIncludeLogo}
                trackColor={{ false: Colors.light.border, true: `${Colors.light.primary}80` }}
                thumbColor={includeLogo ? Colors.light.primary : "#f4f3f4"}
              />
            </View>
          </View>
        )}

        <View style={styles.formGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{t('emailBody')}</Text>
            <TouchableOpacity
              onPress={() => setShowVariables(!showVariables)}
              style={styles.variablesToggle}
            >
              <Text style={styles.variablesToggleText}>
                {showVariables ? t('hideVariables') : t('showVariables')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <RichTextEditor
            value={body}
            onChangeText={setBody}
            placeholder={t('emailBodyPlaceholder')}
            minHeight={300}
          />
        </View>

        {showVariables && (
          <View style={styles.variablesContainer}>
            <View style={styles.variablesHeader}>
              <Info size={16} color={Colors.light.subtext} />
              <Text style={styles.variablesHeaderText}>
                {t('clickToInsertVariables')}
              </Text>
            </View>
            <View style={styles.variablesList}>
              {templateVariables.map((variable) => (
                <TouchableOpacity
                  key={variable.key}
                  style={styles.variableItem}
                  onPress={() => insertVariable(variable.key)}
                >
                  <Text style={styles.variableKey}>{variable.key}</Text>
                  <Text style={styles.variableLabel}>{variable.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Button
          title={t('saveChanges')}
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
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: Colors.light.text,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  variablesToggle: {
    padding: 4,
  },
  variablesToggleText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  variablesContainer: {
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  variablesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  variablesHeaderText: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  variablesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variableItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  variableKey: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
    marginBottom: 4,
  },
  variableLabel: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  saveButton: {
    marginBottom: 40,
  },
});