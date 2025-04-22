import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle, XCircle, Clock, Mail } from "lucide-react-native";
import Colors from "@/constants/colors";
import { EmailHistory } from "@/types";
import { useContactStore } from "@/store/contact-store";
import { useTemplateStore } from "@/store/template-store";

interface HistoryCardProps {
  history: EmailHistory;
  onPress: () => void;
}

export default function HistoryCard({ history, onPress }: HistoryCardProps) {
  const { getContactById } = useContactStore();
  const { getTemplateById } = useTemplateStore();

  // Get the first contact for display purposes
  const firstContactId = history.contactIds && history.contactIds.length > 0 
    ? history.contactIds[0] 
    : undefined;
  
  const contact = firstContactId ? getContactById(firstContactId) : undefined;
  const template = getTemplateById(history.templateId);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusIcon = () => {
    switch (history.status) {
      case "sent":
        return <CheckCircle size={16} color={Colors.light.success} />;
      case "failed":
        return <XCircle size={16} color={Colors.light.error} />;
      case "pending":
        return <Clock size={16} color={Colors.light.warning} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (history.status) {
      case "sent":
        return "Sent";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      default:
        return "";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Mail size={24} color={Colors.light.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.subject} numberOfLines={1}>
          {history.subject}
        </Text>
        <Text style={styles.recipient} numberOfLines={1}>
          To: {contact?.name || "Unknown"} {history.contactIds.length > 1 ? `+ ${history.contactIds.length - 1} more` : ""}
        </Text>
        <View style={styles.footer}>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text
              style={[
                styles.statusText,
                history.status === "sent" && styles.sentText,
                history.status === "failed" && styles.failedText,
                history.status === "pending" && styles.pendingText,
              ]}
            >
              {getStatusText()}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(history.sentAt)}</Text>
          {template && (
            <View style={styles.templateBadge}>
              <Text style={styles.templateText}>{template.name}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${Colors.light.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  subject: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  recipient: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sentText: {
    color: Colors.light.success,
  },
  failedText: {
    color: Colors.light.error,
  },
  pendingText: {
    color: Colors.light.warning,
  },
  date: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  templateBadge: {
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  templateText: {
    fontSize: 10,
    color: Colors.light.primary,
    fontWeight: "500",
  },
});