import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { Camera, Edit3, Mic, Share2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Button from "@/components/Button";
import VoiceRecorder from "@/components/VoiceRecorder";
import { ShareLinkModal } from "@/components/ShareLinkModal";
import Colors from "@/constants/colors";
import { useRecipeStore } from "@/store/recipeStore";
import { Recipe } from "@/types/recipe";
import { parseRecipeFromText } from "@/utils/recipeParser";

export default function CreateRecipeScreen() {
  const router = useRouter();
  const addRecipe = useRecipeStore((state) => state.addRecipe);

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [image, setImage] = useState<string | undefined>();
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [creationMode, setCreationMode] = useState<'select' | 'manual' | 'voice'>('select');
  const [showShareModal, setShowShareModal] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}`);

  const handleTranscriptionComplete = (text: string) => {
    const parsedRecipe = parseRecipeFromText(text);
    
    setTitle(parsedRecipe.title || title);
    
    if (parsedRecipe.ingredients.length > 0) {
      setIngredients(parsedRecipe.ingredients);
    }
    
    if (parsedRecipe.instructions.length > 0) {
      setInstructions(parsedRecipe.instructions);
    }
    
    if (parsedRecipe.prepTime) {
      setPrepTime(parsedRecipe.prepTime);
    }
    
    if (parsedRecipe.cookTime) {
      setCookTime(parsedRecipe.cookTime);
    }
    
    if (parsedRecipe.servings) {
      setServings(parsedRecipe.servings.toString());
    }
    
    setIsRecording(false);
    setCreationMode('manual');
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const updateIngredient = (text: string, index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = text;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = [...ingredients];
      newIngredients.splice(index, 1);
      setIngredients(newIngredients);
    }
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (text: string, index: number) => {
    const newInstructions = [...instructions];
    newInstructions[index] = text;
    setInstructions(newInstructions);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const newInstructions = [...instructions];
      newInstructions.splice(index, 1);
      setInstructions(newInstructions);
    }
  };

  const saveRecipe = () => {
    // Filter out empty ingredients and instructions
    const filteredIngredients = ingredients.filter((item) => item.trim() !== "");
    const filteredInstructions = instructions.filter(
      (item) => item.trim() !== ""
    );

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: title.trim() || "Untitled Recipe",
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      image,
      prepTime: prepTime.trim(),
      cookTime: cookTime.trim(),
      servings: parseInt(servings) || undefined,
      createdAt: Date.now(),
    };

    addRecipe(newRecipe);
    router.push("/");
  };

  const startManualCreation = () => {
    setCreationMode('manual');
  };

  const startVoiceCreation = () => {
    setCreationMode('voice');
    setIsRecording(true);
  };

  const openShareModal = () => {
    setShowShareModal(true);
  };

  const goBackToSelection = () => {
    setCreationMode('select');
    setIsRecording(false);
  };

  const isFormValid = () => {
    return title.trim() !== "" && 
           ingredients.some(ingredient => ingredient.trim() !== "") && 
           instructions.some(instruction => instruction.trim() !== "");
  };

  // Mode selection screen
  if (creationMode === 'select') {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Create Recipe",
            headerStyle: {
              backgroundColor: Colors.cardBackground,
            },
            headerTintColor: Colors.text,
          }}
        />

        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>How would you like to create your recipe?</Text>
          <Text style={styles.selectionSubtitle}>Choose the method that works best for you</Text>

          <View style={styles.optionsContainer}>
            <Pressable style={styles.optionCard} onPress={startManualCreation}>
              <View style={styles.optionIcon}>
                <Edit3 size={32} color={Colors.primary} />
              </View>
              <Text style={styles.optionTitle}>Write Manually</Text>
              <Text style={styles.optionDescription}>
                Type your recipe ingredients and instructions step by step
              </Text>
            </Pressable>

            <Pressable style={styles.optionCard} onPress={startVoiceCreation}>
              <View style={styles.optionIcon}>
                <Mic size={32} color={Colors.primary} />
              </View>
              <Text style={styles.optionTitle}>Voice Recording</Text>
              <Text style={styles.optionDescription}>
                Speak your recipe and we will convert it to text automatically
              </Text>
            </Pressable>

            <Pressable style={styles.optionCard} onPress={openShareModal}>
              <View style={styles.optionIcon}>
                <Share2 size={32} color={Colors.primary} />
              </View>
              <Text style={styles.optionTitle}>Share Recording Link</Text>
              <Text style={styles.optionDescription}>
                Send a link to someone so they can record their recipe for you
              </Text>
            </Pressable>
          </View>
        </View>

        <ShareLinkModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          userId={userId}
        />
      </View>
    );
  }

  // Voice recording screen
  if (creationMode === 'voice' && isRecording) {
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

        <View style={styles.recordingContainer}>
          <Text style={styles.recordingTitle}>Record Your Recipe</Text>
          <Text style={styles.recordingSubtitle}>
            Speak clearly and include ingredients and instructions
          </Text>
          <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
          <Button
            title="Cancel"
            onPress={goBackToSelection}
            variant="outline"
          />
        </View>
      </View>
    );
  }

  // Manual creation form
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: "Create Recipe",
          headerStyle: {
            backgroundColor: Colors.cardBackground,
          },
          headerTintColor: Colors.text,
          headerLeft: () => (
            <Pressable onPress={goBackToSelection}>
              <Text style={styles.backText}>Cancel</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.imageSection}>
            <Pressable style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: image }}
                    style={styles.imagePreview}
                  />
                </View>
              ) : (
                <View style={styles.imagePickerContent}>
                  <Camera size={32} color={Colors.gray} />
                  <Text style={styles.imagePickerText}>Add Photo</Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Recipe name"
              placeholderTextColor={Colors.gray}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Prep Time</Text>
              <TextInput
                style={styles.input}
                value={prepTime}
                onChangeText={setPrepTime}
                placeholder="e.g. 15 mins"
                placeholderTextColor={Colors.gray}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Cook Time</Text>
              <TextInput
                style={styles.input}
                value={cookTime}
                onChangeText={setCookTime}
                placeholder="e.g. 30 mins"
                placeholderTextColor={Colors.gray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Servings</Text>
            <TextInput
              style={styles.input}
              value={servings}
              onChangeText={setServings}
              placeholder="e.g. 4"
              placeholderTextColor={Colors.gray}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Ingredients</Text>
              <Pressable onPress={addIngredient}>
                <Text style={styles.addButton}>+ Add</Text>
              </Pressable>
            </View>
            {ingredients.map((ingredient, index) => (
              <View key={`ingredient-${index}`} style={styles.listItemContainer}>
                <TextInput
                  style={styles.listItemInput}
                  value={ingredient}
                  onChangeText={(text) => updateIngredient(text, index)}
                  placeholder={`Ingredient ${index + 1}`}
                  placeholderTextColor={Colors.gray}
                />
                {ingredients.length > 1 && (
                  <Pressable
                    onPress={() => removeIngredient(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Instructions</Text>
              <Pressable onPress={addInstruction}>
                <Text style={styles.addButton}>+ Add</Text>
              </Pressable>
            </View>
            {instructions.map((instruction, index) => (
              <View key={`instruction-${index}`} style={styles.listItemContainer}>
                <TextInput
                  style={styles.listItemInput}
                  value={instruction}
                  onChangeText={(text) => updateInstruction(text, index)}
                  placeholder={`Step ${index + 1}`}
                  placeholderTextColor={Colors.gray}
                  multiline
                />
                {instructions.length > 1 && (
                  <Pressable
                    onPress={() => removeInstruction(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          <View style={styles.createButtonContainer}>
            <Button
              title="Create Recipe"
              onPress={saveRecipe}
              variant="primary"
              disabled={!isFormValid()}
              style={styles.createButton}
            />
          </View>

          <View style={styles.alternativeSection}>
            <Text style={styles.alternativeText}>Or try voice recording instead</Text>
            <Button
              title="Switch to Voice"
              onPress={startVoiceCreation}
              variant="outline"
              style={styles.voiceButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  selectionContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  selectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    marginBottom: 48,
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  optionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  imagePicker: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  imagePickerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePickerText: {
    marginTop: 8,
    color: Colors.gray,
    fontSize: 14,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    width: "100%",
    height: "100%",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  inputGroup: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.cardBackground,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  listItemInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.cardBackground,
  },
  removeButton: {
    marginLeft: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeButtonText: {
    color: Colors.gray,
    fontSize: 16,
    fontWeight: "600",
  },
  backText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  createButtonContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  createButton: {
    width: "100%",
    paddingVertical: 18,
  },
  alternativeSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: "center",
    marginBottom: 40,
  },
  alternativeText: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 16,
    textAlign: "center",
  },
  voiceButton: {
    paddingHorizontal: 32,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  recordingTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  recordingSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 40,
    textAlign: "center",
    maxWidth: 280,
  },
});