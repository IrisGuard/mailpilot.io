import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
} from "react-native";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Image as ImageIcon,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useImageStore } from "@/store/image-store";
import ImagePicker from "./ImagePicker";

interface RichTextEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
  style?: any;
}

export default function RichTextEditor({
  value,
  onChangeText,
  placeholder = "Write your content here...",
  minHeight = 200,
  style,
}: RichTextEditorProps) {
  const inputRef = useRef<TextInput>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const { addImage } = useImageStore();

  const insertTag = (openTag: string, closeTag: string) => {
    // For simplicity, we'll just append the tags at the end
    onChangeText(`${value}${openTag}Text${closeTag}`);
  };

  const handleImageSelected = (uri: string, name: string) => {
    const imageId = addImage({
      uri,
      name,
      type: "content",
    });
    
    // Insert image placeholder in the text
    onChangeText(`${value}
[IMAGE:${imageId}]
`);
    setShowImagePicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertTag("<b>", "</b>")}
        >
          <Bold size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertTag("<i>", "</i>")}
        >
          <Italic size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertTag("<u>", "</u>")}
        >
          <Underline size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertTag('<div style="text-align:left;">', "</div>")}
        >
          <AlignLeft size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertTag('<div style="text-align:center;">', "</div>")}
        >
          <AlignCenter size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertTag('<div style="text-align:right;">', "</div>")}
        >
          <AlignRight size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertTag("<ul><li>", "</li></ul>")}
        >
          <List size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertTag("<ol><li>", "</li></ol>")}
        >
          <ListOrdered size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setShowImagePicker(true)}
        >
          <ImageIcon size={20} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      {showImagePicker && (
        <ImagePicker
          onImageSelected={handleImageSelected}
          onImageRemoved={() => setShowImagePicker(false)}
          label="Select an image to insert"
        />
      )}

      <TextInput
        ref={inputRef}
        style={[styles.editor, { minHeight }, style]}
        value={value}
        onChangeText={onChangeText}
        multiline
        placeholder={placeholder}
        placeholderTextColor={Colors.light.subtext}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    overflow: "hidden",
  },
  toolbar: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    padding: 8,
  },
  toolbarButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  separator: {
    width: 1,
    height: "80%",
    backgroundColor: Colors.light.border,
    marginHorizontal: 8,
    alignSelf: "center",
  },
  editor: {
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
});