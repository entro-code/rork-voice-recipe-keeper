import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Mic, Send, CheckCircle } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function ShareRecordingPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { data: shareLink, isLoading, error } = trpc.share.getLink.useQuery(
    { linkId: id || '' },
    { enabled: !!id }
  );

  const submitMutation = trpc.share.submitRecording.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    },
    onError: (error: { message: string }) => {
      Alert.alert('Error', error.message);
      setIsSubmitting(false);
    },
  });

  const startRecording = async () => {
    try {
      setIsRecording(true);
      
      if (Platform.OS === 'web') {
        // Web recording implementation
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          await transcribeAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();

        // Auto-stop after 5 minutes
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 5 * 60 * 1000);

        // Store mediaRecorder reference for manual stop
        (window as any).currentRecorder = mediaRecorder;
      } else {
        // Mobile recording would use expo-av
        Alert.alert('Info', 'Mobile recording not implemented in this demo');
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (Platform.OS === 'web' && (window as any).currentRecorder) {
      (window as any).currentRecorder.stop();
    }
    setIsRecording(false);
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      setTranscription(result.text);
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio');
    }
  };

  const handleSubmit = () => {
    if (!transcription.trim()) {
      Alert.alert('Error', 'Please record your recipe first');
      return;
    }

    setIsSubmitting(true);
    submitMutation.mutate({
      linkId: id || '',
      transcription: transcription.trim(),
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Link Not Found</Text>
        <Text style={styles.errorText}>
          This recording link is invalid or has expired.
        </Text>
      </View>
    );
  }

  if (isSubmitted) {
    return (
      <>
        <Stack.Screen options={{ title: 'Recipe Submitted' }} />
        <View style={styles.successContainer}>
          <CheckCircle size={64} color={Colors.success} />
          <Text style={styles.successTitle}>Recipe Submitted!</Text>
          <Text style={styles.successText}>
            Thank you for sharing your recipe. It has been sent successfully.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Record for ${shareLink?.recipientName || 'Recipe'}` 
        }} 
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Share Your Recipe</Text>
          <Text style={styles.subtitle}>
            Record your recipe and it will be shared with the requester
          </Text>
        </View>

        <View style={styles.recordingSection}>
          {!transcription ? (
            <>
              <View style={styles.micContainer}>
                <Mic 
                  size={48} 
                  color={isRecording ? Colors.error : Colors.primary} 
                />
              </View>
              
              <Text style={styles.recordingStatus}>
                {isRecording ? 'Recording...' : 'Tap to start recording'}
              </Text>

              <Button
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
                onPress={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'secondary' : 'primary'}
                style={styles.recordButton}
              />
            </>
          ) : (
            <View style={styles.transcriptionContainer}>
              <Text style={styles.transcriptionTitle}>Your Recipe:</Text>
              <View style={styles.transcriptionBox}>
                <Text style={styles.transcriptionText}>{transcription}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <Button
                  title="Record Again"
                  onPress={() => {
                    setTranscription('');
                    startRecording();
                  }}
                  variant="outline"
                  style={styles.actionButton}
                />
                
                <Button
                  title="Submit Recipe"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  style={styles.actionButton}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This link will expire in 24 hours
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  recordingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  micContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  recordingStatus: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 32,
  },
  recordButton: {
    minWidth: 200,
  },
  transcriptionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  transcriptionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  transcriptionBox: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 120,
  },
  transcriptionText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.gray,
  },
});