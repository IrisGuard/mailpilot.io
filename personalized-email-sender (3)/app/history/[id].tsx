import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Image as ImageIcon,
  FileText,
  Users,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useHistoryStore } from "@/store/history-store";
import { useTemplateStore } from "@/store/template-store";
import { useContactStore } from "@/store/contact-store";
import Button from "@/components/Button";
import { formatDate } from "@/utils/date";
import { useTranslation } from "@/constants/i18n";

export default function EmailDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getEmailById } = useHistoryStore();
  const { getTemplateById } = useTemplateStore();
  const { getContact: getContactById } = useContactStore();
  const { t } = useTranslation();
  
  const email = getEmailById(id as string);
  
  if (!email) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>{t("emailNotFound")}</Text>
        <Button
          title={t("back")}
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    );
  }
  
  const template = email.templateId ? getTemplateById(email.templateId) : null;
  const contact = email.contactId ? getContactById(email.contactId) : null;
  const contacts = email.contactIds
    ? email.contactIds.map((cid) => getContactById(cid)).filter(Boolean)
    : [];
  
  const getStatusColor = () => {
    switch (email.status) {
      case "sent":
        return Colors.light.success;
      case "failed":
        return Colors.light.error;
      default:
        return Colors.light.warning;
    }
  };
  
  const getStatusIcon = () => {
    switch (email.status) {
      case "sent":
        return <CheckCircle size={20} color={Colors.light.success} />;
      case "failed":
        return <XCircle size={20} color={Colors.light.error} />;
      default:
        return <Clock size={20} color={Colors.light.warning} />;
    }
  };
  
  const getStatusText = () => {
    switch (email.status) {
      case "sent":
        return t("sentSuccessfully");
      case "failed":
        return t("failedToSend");
      default:
        return t("pending");
    }
  };
  
  const handleSendAgain = () => {
    if (email.contactId) {
      if (email.templateId) {
        router.push(`/compose/${email.templateId}/${email.contactId}`);
      } else {
        router.push(`/compose/select/${email.contactId}`);
      }
    } else if (email.contactIds && email.contactIds.length > 0) {
      if (email.templateId) {
        router.push(`/bulk-send?templateId=${email.templateId}`);
      } else {
        router.push("/bulk-send");
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("emailDetails"),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(new Date(email.sentAt))}</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.label}>{t("subject")}</Text>
          <Text style={styles.value}>{email.subject}</Text>
        </View>
        
        {contact && (
          <View style={styles.card}>
            <Text style={styles.label}>{t("to")}</Text>
            <Text style={styles.value}>
              {contact.name} ({contact.email})
            </Text>
          </View>
        )}
        
        {contacts.length > 0 && (
          <View style={styles.card}>
            <View style={styles.recipientsHeader}>
              <Text style={styles.label}>{t("recipients")}</Text>
              <View style={styles.recipientCount}>
                <Users size={14} color={Colors.light.subtext} />
                <Text style={styles.recipientCountText}>
                  {contacts.length}
                </Text>
              </View>
            </View>
            
            {contacts.slice(0, 3).map((c) => (
              <Text key={c?.id} style={styles.recipientItem}>
                {c?.name} ({c?.email})
              </Text>
            ))}
            
            {contacts.length > 3 && (
              <Text style={styles.moreRecipients}>
                +{contacts.length - 3} {t("more")}
              </Text>
            )}
          </View>
        )}
        
        {email.hasImages && (
          <View style={styles.card}>
            <View style={styles.imagesContainer}>
              <ImageIcon size={18} color={Colors.light.primary} />
              <Text style={styles.imagesText}>{t("containsImages")}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.card}>
          <Text style={styles.label}>{t("message")}</Text>
          <Text style={styles.messageBody}>{email.body}</Text>
        </View>
        
        {template && (
          <View style={styles.card}>
            <View style={styles.templateContainer}>
              <FileText size={18} color={Colors.light.primary} />
              <Text style={styles.templateText}>
                {t("sentUsingTemplate")}: {template.name}
              </Text>
            </View>
          </View>
        )}
        
        {email.status === "sent" && email.contactIds && email.contactIds.length > 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>{t("deliveryStatistics")}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t("totalRecipients")}</Text>
                <Text style={styles.statValue}>
                  {email.contactIds.length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t("successful")}</Text>
                <Text style={[styles.statValue, { color: Colors.light.success }]}>
                  {email.successCount || 0}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t("failed")}</Text>
                <Text style={[styles.statValue, { color: Colors.light.error }]}>
                  {email.failedCount || 0}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        <Button
          title={t("sendAgain")}
          onPress={handleSendAgain}
          leftIcon={<Send size={18} color="#fff" />}
          style={styles.sendAgainButton}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: Colors.light.text,
  },
  messageBody: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  imagesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imagesText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  templateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  templateText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  recipientsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recipientCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${Colors.light.primary}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipientCountText: {
    fontSize: 12,
    color: Colors.light.subtext,
    fontWeight: "500",
  },
  recipientItem: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  moreRecipients: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  sendAgainButton: {
    marginBottom: 40,
  },
});