import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { Image as ImageIcon, Upload } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ImagePickerProps {
  onImageSelected: (uri: string, name: string) => void;
  existingImageUri?: string;
  label?: string;
  height?: number;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  existingImageUri,
  label = 'Upload Image',
  height = 200,
}) => {
  const pickImage = async () => {
    // Request permission
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('We need camera roll permissions to upload images.');
      return;
    }

    // Launch image library
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const name = uri.split('/').pop() || 'image.jpg';
      onImageSelected(uri, name);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { height }]} 
      onPress={pickImage}
    >
      {existingImageUri ? (
        <Image 
          source={{ uri: existingImageUri }} 
          style={styles.image} 
          resizeMode="contain"
        />
      ) : (
        <View style={styles.placeholder}>
          <ImageIcon size={24} color={Colors.light.subtext} />
          <Text style={styles.placeholderText}>{label}</Text>
        </View>
      )}
      <View style={styles.uploadButton}>
        <Upload size={16} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.subtext,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImagePicker;