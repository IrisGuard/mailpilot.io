import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import Colors from "@/constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return Colors.light.border;

    switch (variant) {
      case "primary":
        return Colors.light.primary;
      case "secondary":
        return Colors.light.secondary;
      case "outline":
        return "transparent";
      case "danger":
        return Colors.light.error;
      default:
        return Colors.light.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.light.subtext;

    switch (variant) {
      case "outline":
        return Colors.light.primary;
      default:
        return "#fff";
    }
  };

  const getBorderColor = () => {
    if (disabled) return Colors.light.border;

    switch (variant) {
      case "outline":
        return Colors.light.primary;
      default:
        return "transparent";
    }
  };

  const getPadding = () => {
    switch (size) {
      case "small":
        return { paddingVertical: 8, paddingHorizontal: 12 };
      case "large":
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 16 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "large":
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          ...getPadding(),
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? Colors.light.primary : "#fff"}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                marginLeft: icon && iconPosition === "left" ? 8 : 0,
                marginRight: icon && iconPosition === "right" ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontWeight: "500",
    textAlign: "center",
  },
});