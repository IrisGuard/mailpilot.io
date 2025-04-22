import React from "react";
import { View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";

export default function BulkSendTab() {
  // Redirect to the bulk send screen
  return <Redirect href="/bulk-send" />;
}