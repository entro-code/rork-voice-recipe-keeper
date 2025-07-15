import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  Pressable,
} from "react-native";

import Button from "@/components/Button";
import VoiceRecorder from "@/components/VoiceRecorder";
import Colors from "@/constants/colors";
import { parseRecipeFromText } from "@/utils/recipeParser";

export default function ShareRecordScreen() {
  const [transcription, setTranscription] = useState<string>("");
  const [parsedRecipe, setParsedRecipe] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleTranscriptionComplete = (text: string) => {
    setTranscription(text);
    const parsed = parseRecipeFromText(text);
    setParsedRecipe(parsed);
    setIsComplete(true);
  };

  const shareRecipe = () => {
    const recipeData = {
      transcription,
      parsed: parsedRecipe,
      timestamp: Date.now(),
    };

    const encodedData = encodeURIComponent(JSON.stringify(recipeData));
    const importUrl = Platform.OS === 'web' 
      ? `${window.location.origin}/import?data=${encodedData}`
      : `your-app-scheme://import?data=${encodedData}`;

    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(importUrl).then(() => {
        Alert.alert(
          "Recipe Ready!",
          "The import link has been copied to your clipboard. Send this link to the recipe owner to import it into their app.",
          [{ text: "OK" }]
        );
      }).catch(() => {
        Alert.alert(
          "Recipe Ready!",
          "Copy this link and send it to the recipe owner:\n\n" + importUrl,
          [{ text: "OK" }]
        );
      });
    } else {
      Alert.alert(
        "Recipe Ready!",
        "Copy this link and send it to the recipe owner:\n\n" + importUrl,
        [{ text: "OK" }]
      );
    }
  };

  const startOver = () => {
    setTranscription("");
    setParsedRecipe(null);
    setIsComplete(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Record Recipe",
          headerStyle: {
            backgroundColor: Colors.cardBackground,
          },
          headerTintColor: Colors.text,
        }}
      />

      <View style={styles.content}>
        {!isComplete ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Record a Recipe</Text>
              <Text style={styles.subtitle}>
                Someone has shared this link with you to record a recipe. 
                Speak clearly and include ingredients and instructions.
              </Text>
            </View>

            <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Recipe Recorded!</Text>
              <Text style={styles.subtitle}>
                Your recipe has been transcribed. Review it below and share it back.
              </Text>
            </View>

            <View style={styles.previewContainer}>
              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>Title:</Text>
                <Text style={styles.previewText}>{parsedRecipe?.title || "Untitled Recipe"}</Text>
              </View>

              {parsedRecipe?.ingredients && parsedRecipe.ingredients.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewTitle}>Ingredients ({parsedRecipe.ingredients.length}):</Text>
                  {parsedRecipe.ingredients.slice(0, 3).map((ingredient: string, index: number) => (
                    <Text key={index} style={styles.previewItem}>• {ingredient}</Text>
                  ))}
                  {parsedRecipe.ingredients.length > 3 && (
                    <Text style={styles.previewMore}>...and {parsedRecipe.ingredients.length - 3} more</Text>
                  )}
                </View>
              )}

              {parsedRecipe?.instructions && parsedRecipe.instructions.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewTitle}>Instructions ({parsedRecipe.instructions.length} steps):</Text>
                  <Text style={styles.previewItem}>
                    1. {parsedRecipe.instructions[0]?.substring(0, 100)}
                    {parsedRecipe.instructions[0]?.length > 100 ? "..." : ""}
                  </Text>
                  {parsedRecipe.instructions.length > 1 && (
                    <Text style={styles.previewMore}>...and {parsedRecipe.instructions.length - 1} more steps</Text>
                  )}
                </View>
              )}

              <Pressable style={styles.expandButton} onPress={() => {
                Alert.alert(
                  "Full Transcription",
                  transcription,
                  [{ text: "OK" }]
                );
              }}>
                <Text style={styles.expandButtonText}>View Full Transcription</Text>
              </Pressable>
            </View>

            <View style={styles.actions}>
              <Button
                title="Share Recipe"
                onPress={shareRecipe}
                style={styles.shareButton}
              />
              <Button
                title="Record Again"
                onPress={startOver}
                variant="outline"
                style={styles.retryButton}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.paleSageGreen,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  previewItem: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  previewMore: {
    fontSize: 14,
    color: Colors.sageAccent,
    fontStyle: "italic",
    marginTop: 4,
  },
  expandButton: {
    backgroundColor: Colors.paleSageGreen,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  expandButtonText: {
    color: Colors.darkSageGreen,
    fontSize: 14,
    fontWeight: "500",
  },
  actions: {
    gap: 12,
  },
  shareButton: {
    width: "100%",
    paddingVertical: 16,
  },
  retryButton: {
    width: "100%",
  },
});