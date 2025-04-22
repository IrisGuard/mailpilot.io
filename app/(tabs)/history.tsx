import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Trash } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useHistoryStore } from "@/store/history-store";
import HistoryCard from "@/components/HistoryCard";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";

export default function HistoryScreen() {
  const router = useRouter();
  const { history, clearHistory } = useHistoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHistory, setFilteredHistory] = useState(history);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredHistory(history);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredHistory(
        history.filter(
          (item) =>
            item.subject.toLowerCase().includes(query) ||
            item.body.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, history]);

  const confirmClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all email history?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          onPress: clearHistory,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search history..."
        />
        {history.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={confirmClearHistory}
          >
            <Trash size={20} color={Colors.light.error} />
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <EmptyState type="history" />
      ) : filteredHistory.length === 0 ? (
        <EmptyState type="search" message="No emails match your search" />
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryCard
              history={item}
              onPress={() => router.push(`/history/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  clearButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.light.error}15`,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  list: {
    paddingBottom: 20,
  },
});