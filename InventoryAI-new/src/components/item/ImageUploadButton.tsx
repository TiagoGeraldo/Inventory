import React, { useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { attachmentService } from '../../services/item/attachmentService';

interface ImageUploadButtonProps {
  itemId: string;
  userId: string;
  onImageUploaded: () => void;
}

export function ImageUploadButton({ itemId, userId, onImageUploaded }: ImageUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      setUploading(true);
      setError(null);
      
      console.log('Starting document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (result.type === 'success' || (!result.canceled && result.assets?.[0])) {
        // Handle web platform
        if (Platform.OS === 'web' && result.output) {
          const file = result.output[0];
          console.log('Web file selected:', {
            name: file.name,
            size: file.size,
            type: file.type
          });

          // Upload directly for web
          console.log('Starting upload with:', { itemId, userId });
          const publicUrl = await attachmentService.uploadFile(file, itemId, userId);
          console.log('Upload completed, URL:', publicUrl);
          
          onImageUploaded();
          alert('Image uploaded successfully!');
          return;
        }

        // Handle mobile platform
        const fileInfo = Platform.OS === 'web' ? result.output[0] : result;
        console.log('Selected file:', {
          uri: fileInfo.uri,
          name: fileInfo.name,
          size: fileInfo.size,
          type: fileInfo.mimeType
        });

        const response = await fetch(fileInfo.uri);
        const blob = await response.blob();
        console.log('Created blob:', {
          size: blob.size,
          type: blob.type
        });

        const file = new File([blob], fileInfo.name, { 
          type: fileInfo.mimeType || 'image/jpeg' 
        });

        console.log('Starting upload with:', { itemId, userId });
        const publicUrl = await attachmentService.uploadFile(file, itemId, userId);
        console.log('Upload completed, URL:', publicUrl);
        
        onImageUploaded();
        alert('Image uploaded successfully!');
      } else {
        console.log('Document picker cancelled or failed');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <Button
        mode="outlined"
        icon="image"
        onPress={handleUpload}
        loading={uploading}
        disabled={uploading}
        style={styles.button}
      >
        {uploading ? 'Uploading...' : 'Add Image'}
      </Button>
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
}); 