import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Mic, Square } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export default function VoiceRecorder({
  onTranscriptionComplete,
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Web-specific refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Timeout and cleanup refs
  const transcriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Cleanup function
  const cleanup = async () => {
    try {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      if (transcriptionTimeoutRef.current) {
        clearTimeout(transcriptionTimeoutRef.current);
        transcriptionTimeoutRef.current = null;
      }

      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
      } else {
        if (recording) {
          try {
            await recording.stopAndUnloadAsync();
          } catch (e) {
            console.log("Recording already stopped");
          }
          setRecording(null);
        }
        
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
          });
        } catch (e) {
          console.log("Audio mode cleanup failed");
        }
      }
    } catch (error) {
      console.log("Cleanup error:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      setRecordingDuration(0);

      if (Platform.OS === 'web') {
        await startWebRecording();
      } else {
        await startMobileRecording();
      }

      setIsRecording(true);
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error("Failed to start recording", err);
      setError("Failed to start recording. Please check microphone permissions.");
      await cleanup();
    }
  };

  const startWebRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    });
    streamRef.current = stream;
    
    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.start(1000); // Collect data every second
    mediaRecorderRef.current = mediaRecorder;
  };

  const startMobileRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Audio permission not granted');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recordingOptions: Audio.RecordingOptions = {
      android: {
        extension: ".m4a",
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 64000,
      },
      ios: {
        extension: ".wav",
        outputFormat: Audio.IOSOutputFormat.LINEARPCM,
        audioQuality: Audio.IOSAudioQuality.MEDIUM,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 64000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: "audio/webm",
        bitsPerSecond: 64000,
      },
    };

    const { recording } = await Audio.Recording.createAsync(recordingOptions);
    setRecording(recording);
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      setIsRecording(false);
      
      // Show warning for long recordings
      if (recordingDuration > 90) {
        setError("Long recording detected. This may take a while to process...");
      }
      
      if (Platform.OS === 'web') {
        await stopWebRecording();
      } else {
        await stopMobileRecording();
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      setError("Failed to process recording. Please try again.");
      setIsTranscribing(false);
      await cleanup();
    }
  };

  const stopWebRecording = async () => {
    return new Promise<void>((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Recording stop timeout'));
      }, 10000);

      mediaRecorderRef.current.onstop = async () => {
        try {
          clearTimeout(timeout);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Check file size (limit to 25MB)
          if (audioBlob.size > 25 * 1024 * 1024) {
            throw new Error('Recording too large. Please keep recordings under 2 minutes.');
          }
          
          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          
          setIsTranscribing(true);
          await transcribeWebAudio(audioBlob);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        clearTimeout(timeout);
        reject(new Error('MediaRecorder error'));
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    });
  };

  const stopMobileRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      if (!uri) {
        throw new Error("Recording URI is null");
      }

      // Check file size on mobile
      try {
        const fileInfo = await fetch(uri, { method: 'HEAD' });
        const contentLength = fileInfo.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 25 * 1024 * 1024) {
          throw new Error('Recording too large. Please keep recordings under 2 minutes.');
        }
      } catch (sizeError) {
        console.log("Could not check file size:", sizeError);
      }

      setIsTranscribing(true);
      await transcribeMobileAudio(uri);
    } finally {
      setRecording(null);
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      } catch (e) {
        console.log("Audio mode reset failed");
      }
    }
  };

  const transcribeWithTimeout = async (transcribeFunction: () => Promise<void>) => {
    return new Promise<void>((resolve, reject) => {
      // Set timeout for transcription (2 minutes for long recordings)
      transcriptionTimeoutRef.current = setTimeout(() => {
        reject(new Error('Transcription timeout. Please try with a shorter recording.'));
      }, 120000);

      transcribeFunction()
        .then(() => {
          if (transcriptionTimeoutRef.current) {
            clearTimeout(transcriptionTimeoutRef.current);
            transcriptionTimeoutRef.current = null;
          }
          resolve();
        })
        .catch((error) => {
          if (transcriptionTimeoutRef.current) {
            clearTimeout(transcriptionTimeoutRef.current);
            transcriptionTimeoutRef.current = null;
          }
          reject(error);
        });
    });
  };

  const transcribeWebAudio = async (audioBlob: Blob) => {
    try {
      await transcribeWithTimeout(async () => {
        const formData = new FormData();
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        formData.append("audio", audioFile);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        try {
          const response = await fetch("https://toolkit.rork.com/stt/transcribe/", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Transcription API error:", response.status, errorText);
            
            if (response.status === 413) {
              throw new Error("Recording too large. Please try a shorter recording.");
            } else if (response.status === 400) {
              throw new Error("Invalid audio format. Please try recording again.");
            } else {
              throw new Error(`Transcription failed: ${response.status}`);
            }
          }

          const data = await response.json();
          
          if (!data.text || data.text.trim().length === 0) {
            throw new Error("No speech detected. Please speak clearly and try again.");
          }
          
          onTranscriptionComplete(data.text);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('Transcription timeout. Please try with a shorter recording.');
          }
          throw fetchError;
        }
      });
    } catch (err) {
      console.error("Web transcription error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to transcribe audio. Please try again.";
      setError(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  const transcribeMobileAudio = async (uri: string) => {
    try {
      await transcribeWithTimeout(async () => {
        const formData = new FormData();
        
        // Prepare the audio file for upload
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        
        const audioFile = {
          uri,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`,
        };
        
        // @ts-ignore - FormData expects a Blob but we're using React Native's object format
        formData.append("audio", audioFile);

        const response = await fetch("https://toolkit.rork.com/stt/transcribe/", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Transcription API error:", response.status, errorText);
          
          if (response.status === 413) {
            throw new Error("Recording too large. Please try a shorter recording.");
          } else if (response.status === 400) {
            throw new Error("Invalid audio format. Please try recording again.");
          } else {
            throw new Error(`Transcription failed: ${response.status}`);
          }
        }

        const data = await response.json();
        
        if (!data.text || data.text.trim().length === 0) {
          throw new Error("No speech detected. Please speak clearly and try again.");
        }
        
        onTranscriptionComplete(data.text);
      });
    } catch (err) {
      console.error("Mobile transcription error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to transcribe audio. Please try again.";
      setError(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.recordingInfo}>
        {isRecording && (
          <View style={styles.durationContainer}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.durationText}>
              {formatTime(recordingDuration)}
            </Text>
            {recordingDuration > 60 && (
              <Text style={styles.warningText}>Long recording</Text>
            )}
          </View>
        )}

        {isTranscribing && (
          <View style={styles.transcribingContainer}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.transcribingText}>
              {recordingDuration > 60 ? "Processing long recording..." : "Transcribing..."}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {!isRecording ? (
          <Pressable
            style={styles.recordButton}
            onPress={startRecording}
            disabled={isTranscribing}
          >
            <Mic size={32} color={Colors.background} />
          </Pressable>
        ) : (
          <Pressable style={styles.stopButton} onPress={stopRecording}>
            <Square size={28} color={Colors.error} />
          </Pressable>
        )}
      </View>

      <Text style={styles.helpText}>
        {isRecording
          ? recordingDuration > 90 
            ? "Recording is getting long. Tap to stop and process."
            : "Tap to stop recording"
          : "Tap the microphone and start speaking your recipe"}
      </Text>
      
      {!isRecording && !isTranscribing && (
        <Text style={styles.tipText}>
          💡 For best results, keep recordings under 2 minutes and speak clearly
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  recordingInfo: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.error,
    marginRight: 8,
  },
  durationText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  warningText: {
    fontSize: 12,
    color: Colors.error,
    marginLeft: 8,
    fontWeight: "500",
  },
  transcribingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  transcribingText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
  },
  buttonContainer: {
    marginBottom: 24,
  },
  recordButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  stopButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.error,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  helpText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
  tipText: {
    fontSize: 14,
    color: Colors.sageAccent,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 20,
    marginTop: 16,
    fontStyle: "italic",
  },
  errorText: {
    color: Colors.error,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
    maxWidth: 280,
  },
});