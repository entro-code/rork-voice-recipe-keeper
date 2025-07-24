import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Share,
  Clipboard,
} from 'react-native';
import { X, Send, Copy } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import Colors from '@/constants/colors';
import Button from './Button';

interface ShareLinkModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export function ShareLinkModal({ visible, onClose, userId }: ShareLinkModalProps) {
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const createLinkMutation = trpc.share.createLink.useMutation({
    onSuccess: (data: { shareUrl: string; linkId: string; expiresAt: number; }) => {
      setShareUrl(data.shareUrl);
      setIsCreating(false);
    },
    onError: (error: { message: string; }) => {
      Alert.alert('Error', error.message);
      setIsCreating(false);
    },
  });

  const handleCreateLink = async () => {
    if (!recipientName.trim()) {
      Alert.alert('Error', 'Please enter recipient name');
      return;
    }

    setIsCreating(true);
    createLinkMutation.mutate({
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      userId,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Hi ${recipientName}! Please record your recipe using this link: ${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setString(shareUrl);
      Alert.alert('Success', 'Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleClose = () => {
    setRecipientName('');
    setRecipientPhone('');
    setShareUrl('');
    setIsCreating(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Share Recipe Recording</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {!shareUrl ? (
          <View style={styles.form}>
            <Text style={styles.description}>
              Send a link to someone so they can record a recipe for you
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recipient Name *</Text>
              <TextInput
                style={styles.input}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="Enter recipient's name"
                placeholderTextColor={Colors.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number (optional)</Text>
              <TextInput
                style={styles.input}
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                placeholder="Enter phone number"
                placeholderTextColor={Colors.gray}
                keyboardType="phone-pad"
              />
            </View>

            <Button
              title="Create Share Link"
              onPress={handleCreateLink}
              isLoading={isCreating}
              style={styles.createButton}
            />
          </View>
        ) : (
          <View style={styles.shareContainer}>
            <Text style={styles.successTitle}>Link Created!</Text>
            <Text style={styles.successDescription}>
              Share this link with {recipientName} so they can record their recipe
            </Text>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText} numberOfLines={2}>
                {shareUrl}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Send size={20} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Share Link</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleCopyLink}>
                <Copy size={20} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Copy Link</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.expiryNote}>
              This link will expire in 24 hours
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.lightGray,
  },
  createButton: {
    marginTop: 20,
  },
  shareContainer: {
    padding: 20,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  linkContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  expiryNote: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
});