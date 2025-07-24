import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Clock, User, CheckCircle, Plus } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import Colors from '@/constants/colors';
import Button from './Button';
import { useRecipeStore } from '@/store/recipeStore';
import { parseRecipeFromText } from '@/utils/recipeParser';
import { Recipe } from '@/types/recipe';

interface SharedRecordingsProps {
  userId: string;
}

export function SharedRecordings({ userId }: SharedRecordingsProps) {
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  
  const { data: userLinks, isLoading, refetch } = trpc.share.getUserLinks.useQuery(
    { userId },
    { refetchInterval: 5000 } // Poll every 5 seconds for updates
  );

  const handleImportRecipe = (transcription: string, recipientName: string) => {
    try {
      const parsedRecipe = parseRecipeFromText(transcription);
      
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        title: parsedRecipe.title || `Recipe from ${recipientName}`,
        ingredients: parsedRecipe.ingredients.length > 0 ? parsedRecipe.ingredients : ['No ingredients provided'],
        instructions: parsedRecipe.instructions.length > 0 ? parsedRecipe.instructions : ['No instructions provided'],
        prepTime: parsedRecipe.prepTime,
        cookTime: parsedRecipe.cookTime,
        servings: parsedRecipe.servings,
        createdAt: Date.now(),
      };

      addRecipe(newRecipe);
      Alert.alert('Success', 'Recipe imported successfully!');
    } catch (error) {
      console.error('Error importing recipe:', error);
      Alert.alert('Error', 'Failed to import recipe');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderShareLink = ({ item }: { item: any }) => (
    <View style={styles.linkCard}>
      <View style={styles.linkHeader}>
        <View style={styles.recipientInfo}>
          <User size={16} color={Colors.primary} />
          <Text style={styles.recipientName}>{item.recipientName}</Text>
        </View>
        <View style={styles.statusContainer}>
          {item.status === 'completed' ? (
            <View style={styles.statusBadge}>
              <CheckCircle size={14} color={Colors.success} />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Clock size={14} color={Colors.gray} />
              <Text style={[styles.statusText, styles.pendingText]}>Pending</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.createdDate}>
        Sent {formatDate(item.createdAt)}
      </Text>

      {item.status === 'completed' && item.transcription && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionTitle}>Recipe Recording:</Text>
          <Text style={styles.transcriptionText} numberOfLines={3}>
            {item.transcription}
          </Text>
          
          <Button
            title="Import Recipe"
            onPress={() => handleImportRecipe(item.transcription, item.recipientName)}
            variant="primary"
            style={styles.importButton}
          />
        </View>
      )}

      {item.status === 'pending' && (
        <Text style={styles.pendingMessage}>
          Waiting for {item.recipientName} to record their recipe...
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading shared recordings...</Text>
      </View>
    );
  }

  if (!userLinks || userLinks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Shared Recordings</Text>
        <Text style={styles.emptyText}>
          Share recording links with friends and family to collect their recipes
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shared Recordings</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userLinks}
        renderItem={renderShareLink}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  refreshText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  linkCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: Colors.lightGray,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.success,
  },
  pendingText: {
    color: Colors.gray,
  },
  createdDate: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 12,
  },
  transcriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  transcriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  transcriptionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  importButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pendingMessage: {
    fontSize: 14,
    color: Colors.gray,
    fontStyle: 'italic',
    marginTop: 8,
  },
});