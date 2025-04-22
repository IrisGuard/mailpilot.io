import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Building2, MoreVertical } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Contact } from "@/types";

interface ContactCardProps {
  contact: Contact;
  onPress: () => void;
  onLongPress?: () => void;
  onSendEmail?: () => void;
  rightIcon?: React.ReactNode;
}

export default function ContactCard({
  contact,
  onPress,
  onLongPress,
  onSendEmail,
  rightIcon,
}: ContactCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.name}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {contact.email}
        </Text>
        {contact.company && (
          <View style={styles.companyContainer}>
            <Building2 size={12} color={Colors.light.subtext} />
            <Text style={styles.company} numberOfLines={1}>
              {contact.company}
              {contact.role ? ` • ${contact.role}` : ""}
            </Text>
          </View>
        )}
      </View>
      {rightIcon ? (
        rightIcon
      ) : (
        <TouchableOpacity style={styles.moreButton} onPress={onLongPress || onSendEmail}>
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
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.secondary}30`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.secondary,
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
  email: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  companyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  company: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  moreButton: {
    padding: 4,
  },
});