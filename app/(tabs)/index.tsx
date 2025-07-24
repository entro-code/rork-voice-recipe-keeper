import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Plus, Share, Users } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, Alert, Platform, Modal } from "react-native";

import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import RecipeCard from "@/components/RecipeCard";
import { SharedRecordings } from "@/components/SharedRecordings";
import { ShareLinkModal } from "@/components/ShareLinkModal";
import Colors from "@/constants/colors";
import { useRecipeStore } from "@/store/recipeStore";

export default function RecipesScreen() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);
  const [showSharedRecordings, setShowSharedRecordings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}`);

  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => b.createdAt - a.createdAt);
  }, [recipes]);

  const navigateToCreate = () => {
    router.push("/create");
  };

  const openShareModal = () => {
    setShowShareModal(true);
  };

  const openSharedRecordings = () => {
    setShowSharedRecordings(true);
  };

  const navigateToImport = () => {
    router.push("/import");
  };

  if (recipes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyHeader}>
          <View style={styles.headerActions}>
            <Pressable style={styles.shareButton} onPress={openSharedRecordings}>
              <Users size={20} color={Colors.sageGreen} />
            </Pressable>
            <Pressable style={styles.shareButton} onPress={openShareModal}>
              <Share size={20} color={Colors.sageGreen} />
            </Pressable>
          </View>
        </View>
        <EmptyState
          message="No recipes yet"
          subMessage="Start by creating your first recipe or import one from a shared recording"
        />
        <View style={styles.emptyActions}>
          <Button
            title="Create Recipe"
            onPress={navigateToCreate}
            style={styles.createButton}
          />
          <Button
            title="Import Recording"
            onPress={navigateToImport}
            variant="outline"
            style={styles.importButton}
          />
        </View>

        <ShareLinkModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          userId={userId}
        />

        <Modal
          visible={showSharedRecordings}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowSharedRecordings(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shared Recordings</Text>
              <Pressable onPress={() => setShowSharedRecordings(false)}>
                <Text style={styles.closeText}>Done</Text>
              </Pressable>
            </View>
            <SharedRecordings userId={userId} />
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.shareButton} onPress={openSharedRecordings}>
            <Users size={20} color={Colors.sageGreen} />
          </Pressable>
          <Pressable style={styles.shareButton} onPress={openShareModal}>
            <Share size={20} color={Colors.sageGreen} />
          </Pressable>
          <Pressable style={styles.addButton} onPress={navigateToCreate}>
            <Plus size={24} color={Colors.sageGreen} />
          </Pressable>
        </View>
      </View>

      <FlashList
        data={sortedRecipes}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        estimatedItemSize={120}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.floatingActions}>
        <Button
          title="Import Recording"
          onPress={navigateToImport}
          variant="outline"
          style={styles.floatingImportButton}
        />
      </View>

      <ShareLinkModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        userId={userId}
      />

      <Modal
        visible={showSharedRecordings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSharedRecordings(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Shared Recordings</Text>
            <Pressable onPress={() => setShowSharedRecordings(false)}>
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>
          <SharedRecordings userId={userId} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.paleSageGreen,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.paleSageGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lightSageGreen,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.paleSageGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lightSageGreen,
  },
  listContent: {
    padding: 20,
  },
  emptyActions: {
    position: "absolute",
    bottom: 32,
    left: 20,
    right: 20,
    gap: 12,
  },
  createButton: {
    width: "100%",
  },
  importButton: {
    width: "100%",
  },
  floatingActions: {
    position: "absolute",
    bottom: 32,
    right: 20,
  },
  floatingImportButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});