import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
  disabled?: boolean;
  style?: object;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return [
          styles.button,
          styles.primaryButton,
          disabled && styles.disabledButton,
          style,
        ];
      case "secondary":
        return [
          styles.button,
          styles.secondaryButton,
          disabled && styles.disabledButton,
          style,
        ];
      case "outline":
        return [
          styles.button,
          styles.outlineButton,
          disabled && styles.disabledOutlineButton,
          style,
        ];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return [styles.text, styles.primaryText];
      case "secondary":
        return [styles.text, styles.secondaryText];
      case "outline":
        return [styles.text, styles.outlineText, disabled && styles.disabledOutlineText];
    }
  };

  return (
    <Pressable
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "outline" ? Colors.primary : Colors.background}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 120,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.accent,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledOutlineButton: {
    borderColor: Colors.gray,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: Colors.background,
  },
  secondaryText: {
    color: Colors.background,
  },
  outlineText: {
    color: Colors.primary,
  },
  disabledOutlineText: {
    color: Colors.gray,
  },
});