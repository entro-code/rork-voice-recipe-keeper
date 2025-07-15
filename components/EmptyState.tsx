import { BookOpen } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

interface EmptyStateProps {
  message: string;
  subMessage?: string;
}

export default function EmptyState({ message, subMessage }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <BookOpen size={48} color={Colors.sageGreen} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.paleSageGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.lightSageGreen,
  },
  message: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
  },
});