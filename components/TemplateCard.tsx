import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Mail, MoreVertical, Clock } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Template } from "@/types";

interface TemplateCardProps {
  template: Template;
  onPress: () => void;
  onLongPress?: () => void;
  rightIcon?: React.ReactNode;
}

export default function TemplateCard({
  template,
  onPress,
  onLongPress,
  rightIcon,
}: TemplateCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Mail size={24} color={Colors.light.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {template.name}
        </Text>
        <Text style={styles.subject} numberOfLines={1}>
          {template.subject}
        </Text>
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Clock size={12} color={Colors.light.subtext} />
            <Text style={styles.date}>
              Updated {formatDate(template.updatedAt)}
            </Text>
          </View>
        </View>
      </View>
      {rightIcon ? (
        rightIcon
      ) : (
        <TouchableOpacity style={styles.moreButton} onPress={onLongPress}>
          <MoreVertical size={20} color={Colors.light.subtext} />
        </TouchableOpacity>
      )}
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
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  subject: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  moreButton: {
    padding: 4,
  },
});