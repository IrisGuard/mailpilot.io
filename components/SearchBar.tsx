import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { Search, X } from "lucide-react-native";
import Colors from "@/constants/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Search size={18} color={Colors.light.subtext} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.subtext}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <X size={18} color={Colors.light.subtext} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    padding: 0,
  },
});